export const API_BASE = 'http://localhost:3000'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const GENERIC_ERROR = 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'
const NETWORK_ERROR = 'Der Server ist nicht erreichbar. Bitte überprüfe deine Verbindung und versuche es erneut.'

async function request(method, path, body) {
  const options = {
    method,
    credentials: 'include',
    headers: { Accept: 'application/json' }
  }

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, options)
  } catch {
    throw new ApiError(NETWORK_ERROR, 0)
  }

  let data = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const message = data && typeof data.message === 'string' ? data.message : GENERIC_ERROR
    throw new ApiError(message, response.status)
  }

  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body = {}) => request('POST', path, body),
  put: (path, body = {}) => request('PUT', path, body),
  delete: (path) => request('DELETE', path)
}

export function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

export function errorMessage(error, fallback = GENERIC_ERROR) {
  if (error instanceof ApiError && error.message) return error.message
  return fallback
}
