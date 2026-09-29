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

interface ApiOptions {
  method?: 'GET' | 'POST'
  /** JSON object, atau FormData untuk upload. ofetch set Content-Type sendiri. */
  body?: unknown
}

/**
 * Semua request ke backend E-Voting (Laravel Sanctum).
 * Base URL dari `runtimeConfig.public.apiBase`, override via NUXT_PUBLIC_API_BASE.
 */
export function api<T>(path: string, { method = 'GET', body }: ApiOptions = {}): Promise<T> {
  const { public: config } = useRuntimeConfig()
  const bearer = getToken()

  return $fetch<T>(`${config.apiBase}${path}`, {
    method,
    ...(body !== undefined && { body }),
    headers: {
      Accept: 'application/json',
      ...(bearer && { Authorization: `Bearer ${bearer}` })
    }
  })
}

// ponytail: asumsi response Laravel selalu punya `message`. Timeout/CORS/offline
// tidak, jadi jatuh ke fallback. Upgrade kalau backend pernah balas bentuk lain.
export function apiErrorMessage(err: unknown): string {
  const data = (err as { data?: { message?: string } } | null)?.data
  return typeof data?.message === 'string' ? data.message : 'Gagal menghubungi server. Coba lagi.'
}
