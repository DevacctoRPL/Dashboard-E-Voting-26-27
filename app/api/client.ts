const TOKEN_KEY = 'evoting-token'

export function getToken(): string | null {
  return import.meta.client ? localStorage.getItem(TOKEN_KEY) : null
}

export function setToken(value: string) {
  if (import.meta.client) localStorage.setItem(TOKEN_KEY, value)
}

export function clearToken() {
  if (import.meta.client) localStorage.removeItem(TOKEN_KEY)
}

export interface ApiOptions {
  method?: 'GET' | 'POST'
  /** JSON object, atau FormData untuk upload. ofetch set Content-Type sendiri. */
  body?: unknown
  query?: Record<string, string | number | undefined | null>
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
 * Semua request ke backend E-Voting (Laravel Sanctum).
 * Base URL dari `runtimeConfig.public.apiBase`, override via NUXT_PUBLIC_API_BASE.
 */
export function api<T>(
  path: string,
  { method = 'GET', body, query }: ApiOptions = {}
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
    },
    // Token bisa dicabut backend (re-login, logout, kadaluarsa). Bersihkan
    // state lokal lalu lempar ke /login supaya tidak stuck di halaman yang
    // butuh auth. `bypass` dipakai login itu sendiri — 401 di sana artinya
    // kredensial salah, bukan session invalid.
    onResponseError({ response }) {
      if (response.status !== 401 || path === '/login') return
      clearToken()
      if (import.meta.client) {
        const auth = useAuthStore()
        auth.clear()
        void navigateTo('/login')
      }
    }
  })
}

/**
 * Pesan error dari Laravel. Validasi 422 punya `errors` per-field yang lebih
 * spesifik daripada `message` generik, jadi prefer yang itu.
 */
export function apiErrorMessage(err: unknown): string {
  const data = (err as { data?: { message?: string, errors?: Record<string, string[]> } } | null)?.data
  const first = data?.errors && Object.values(data.errors)[0]?.[0]
  return first ?? data?.message ?? 'Gagal menghubungi server. Coba lagi.'
}
