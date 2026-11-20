export const CATEGORY_LABELS = {
  women: 'Damen',
  men: 'Herren',
  kids: 'Kinder',
  dogs: 'Hunde'
}

export const CATEGORY_ROUTES = {
  women: '/damen',
  men: '/herren',
  kids: '/kinder',
  dogs: '/hunde'
}

export const SUBCATEGORY_LABELS = {
  girls: 'Mädchen',
  boys: 'Jungen'
}

// Bezeichnungen für die Auswahl „Für wen?“ im Konfigurator
export const TARGET_LABELS = {
  women: 'Damen',
  men: 'Herren',
  kids: 'Kinder',
  dogs: 'Hund'
}

export const COLOR_LABELS = {
  black: 'Schwarz',
  red: 'Rot',
  blue: 'Blau',
  aquablue: 'Aquablau',
  turquoise: 'Türkis',
  pink: 'Rosa',
  yellow: 'Gelb',
  plum: 'Pflaume',
  green: 'Grün',
  grey: 'Grau',
  magenta: 'Magenta',
  beige: 'Beige',
  brown: 'Braun',
  orange: 'Orange',
  silver: 'Silber'
}

// Darstellungsfarben für die Farbfelder der Farbauswahl
export const COLOR_SWATCHES = {
  black: '#1f1f1f',
  red: '#d62828',
  blue: '#1d4ed8',
  aquablue: '#38bdf8',
  turquoise: '#14b8a6',
  pink: '#f9a8d4',
  yellow: '#facc15',
  plum: '#7e2f6e',
  green: '#16a34a',
  grey: '#8b8f96',
  magenta: '#d01c8b',
  beige: '#e3d1b0',
  brown: '#7c4a25',
  orange: '#f97316',
  silver: '#c0c4cc'
}

export const KIDS_SIZE_LABELS = {
  '2-3': '2–3 Jahre',
  '4-7': '4–7 Jahre',
  '8-12': '8–12 Jahre'
}

export const STATUS_LABELS = {
  new: 'Bestätigt',
  processing: 'In Bearbeitung',
  shipped: 'Versendet',
  delivered: 'Zugestellt',
  cancelled: 'Storniert'
}

export const ROLE_LABELS = {
  user: 'Benutzer',
  admin: 'Administrator',
  main_admin: 'Hauptadministrator'
}

const PAYMENT_LABELS = {
  card: 'Kartenzahlung'
}

const SHIPPING_FALLBACK_LABELS = {
  standard: 'Standardversand',
  express: 'Expressversand'
}

const currency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })

export function formatPrice(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  return currency.format(number)
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const formatted = date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${formatted} Uhr`
}

export function colorLabel(code) {
  return COLOR_LABELS[code] || code || ''
}

export function sizeLabel(size) {
  return KIDS_SIZE_LABELS[size] || size || ''
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || ''
}

export function roleLabel(role) {
  return ROLE_LABELS[role] || role || ''
}

export function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category || ''
}

export function subcategoryLabel(subcategory) {
  return SUBCATEGORY_LABELS[subcategory] || subcategory || ''
}

export function shippingLabel(id, options = []) {
  const option = options.find((item) => item.id === id)
  if (option) return option.name
  return SHIPPING_FALLBACK_LABELS[id] || id || ''
}

export function paymentLabel(method) {
  return PAYMENT_LABELS[method] || method || ''
}

export function fullName(person) {
  if (!person) return ''
  return [person.firstName, person.lastName].filter(Boolean).join(' ')
}

// Liefert nur tatsächlich gespeicherte Adresszeilen (leere Felder werden nicht angezeigt)
export function addressLines(address) {
  if (!address) return []
  const street = (address.street || '').trim()
  const cityLine = [address.postalCode, address.city].map((part) => (part || '').trim()).filter(Boolean).join(' ')
  const country = (address.country || '').trim()
  return [street, cityLine, country].filter(Boolean)
}
