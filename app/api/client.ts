const TOKEN_KEY = 'evoting-token'

/** Key `useState` global — dibaca app.vue untuk memunculkan toast. */
export const SESSION_EXPIRED_STATE = 'session-expired'

/**
 * 401 = token tidak ada / dicabut / kadaluarsa.
 * 419 = CSRF token Sanctum basi (efek sama dari sisi user: harus login ulang).
 */
const EXPIRED_STATUSES = new Set([401, 419])

export class SessionExpiredError extends Error {
  constructor(message = 'Sesi Anda telah berakhir. Silakan masuk kembali.') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}

export function isSessionExpired(err: unknown): boolean {
  const name = (err as { name?: string } | null | undefined)?.name
  return err instanceof SessionExpiredError || name === 'SessionExpiredError'
}

export function getToken(): string | null {
  return import.meta.client ? localStorage.getItem(TOKEN_KEY) : null
}

/** Guard supaya 3 request paralel yang 401 barengan tidak trigger 3 redirect. */
let expiring = false

export function setToken(value: string) {
  if (!import.meta.client) return
  localStorage.setItem(TOKEN_KEY, value)
  expiring = false
}

export function clearToken() {
  if (import.meta.client) localStorage.removeItem(TOKEN_KEY)
}

export interface ApiOptions {
  method?: 'GET' | 'POST'
  /** JSON object, atau FormData untuk upload. ofetch set Content-Type sendiri. */
  body?: unknown
  query?: Record<string, string | number | undefined | null>
  /**
   * 401 di endpoint ini tidak memicu flow "sesi berakhir" (toast + redirect).
   * Dipakai `/me` saat boot dan `/logout` — di sana 401 itu normal, bukan
   * kejadian tak terduga di tengah user memakai app.
   */
  silentAuth?: boolean
}

type Query = Record<string, string | number | undefined | null>

/** Buang key yang kosong supaya tidak jadi `?search=&status=`. */
function cleanQuery(query: Query | undefined): Query | undefined {
  if (!query) return undefined
  const entries = Object.entries(query).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  )
  return entries.length ? Object.fromEntries(entries) : undefined
}

/**
 * Dipanggil sekali saat token dinyatakan tidak valid. Plugin client yang
 * mendaftarkannya (lihat `plugins/auth.client.ts`) yang memutuskan redirect
 * + toast, supaya `client.ts` tidak perlu tahu soal router/UI.
 */
type ExpiredHandler = () => void
let onExpired: ExpiredHandler | null = null

export function setSessionExpiredHandler(handler: ExpiredHandler) {
  onExpired = handler
}

/**
 * Nyalakan flag "sesi habis" supaya `/login` menampilkan banner penjelas.
 * Terpisah dari redirect karena saat boot (plugin auth → `/me`) yang perlu
 * hanya flag; middleware yang sudah-menahan navigasi ke /login.
 */
export function markSessionExpired() {
  if (!import.meta.client) return
  useState<boolean>(SESSION_EXPIRED_STATE, () => false).value = true
}

/** Bersihkan state lokal + lempar ke handler. Dipanggil sekali per 401. */
function expireSession() {
  clearToken()
  markSessionExpired()
  try {
    useAuthStore().clear()
  } catch {
    // Store belum siap (mis. saat SSR) — token lokal sudah cukup dihapus.
  }
  onExpired?.()
}

/**
 * Semua request ke backend E-Voting (Laravel Sanctum).
 * Base URL dari `runtimeConfig.public.apiBase`, override via NUXT_PUBLIC_API_BASE.
 */
export function api<T>(
  path: string,
  { method = 'GET', body, query, silentAuth }: ApiOptions = {}
): Promise<T> {
  const { public: config } = useRuntimeConfig()
  const bearer = getToken()
  const params = cleanQuery(query)

  return $fetch<T>(`${config.apiBase}${path}`, {
    method,
    ...(body !== undefined && { body }),
    ...(params && { query: params }),
    headers: {
      Accept: 'application/json',
      ...(bearer && { Authorization: `Bearer ${bearer}` })
    }
  }).catch((err: unknown) => {
    // 401/419 = sesi tidak valid lagi. Lempar `SessionExpiredError` supaya
    // halaman tidak pernah menampilkan `[GET] "...": 401 Unauthorized` mentah.
    //
    // Dikecualikan: `/login` (401 = kredensial salah, pesan asli yang tampil),
    // request tanpa token (mis. statistik panel di halaman login — 401-nya
    // memang normal, bukan sesi yang mati), dan `silentAuth`.
    if (path === '/login' || !bearer) throw err
    const status = (err as { statusCode?: number, status?: number } | null)?.statusCode
      ?? (err as { status?: number } | null)?.status
    if (!EXPIRED_STATUSES.has(status ?? 0)) throw err

    if (silentAuth) throw new SessionExpiredError()

    if (!expiring) {
      expiring = true
      expireSession()
    }
    throw new SessionExpiredError()
  })
}

/**
 * Pesan error dari Laravel. Validasi 422 punya `errors` per-field yang lebih
 * spesifik daripada `message` generik, jadi prefer yang itu.
 */
export function apiErrorMessage(err: unknown): string {
  if (isSessionExpired(err)) return (err as Error).message
  const data = (err as { data?: { message?: string, errors?: Record<string, string[]> } } | null)?.data
  const first = data?.errors && Object.values(data.errors)[0]?.[0]
  return first ?? data?.message ?? 'Gagal menghubungi server. Coba lagi.'
}
