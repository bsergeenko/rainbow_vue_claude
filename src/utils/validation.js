const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || '').trim())
}

export function required(label) {
  return (value) => (String(value ?? '').trim() ? '' : `Bitte gib ${label} ein.`)
}

export function email() {
  return (value) => {
    const text = String(value ?? '').trim()
    if (!text) return ''
    return isValidEmail(text) ? '' : 'Bitte gib eine gültige E-Mail-Adresse ein (z. B. name@beispiel.de).'
  }
}

export function minLength(length, label) {
  return (value) => {
    const text = String(value ?? '')
    if (!text) return ''
    return text.length >= length ? '' : `${label} muss mindestens ${length} Zeichen lang sein.`
  }
}

export function matches(getOther, message) {
  return (value) => {
    if (!value) return ''
    return value === getOther() ? '' : message
  }
}

export function cardNumber() {
  return (value) => {
    const digits = String(value ?? '').replace(/\s/g, '')
    if (!digits) return ''
    return /^\d{16}$/.test(digits) ? '' : 'Die Kartennummer muss aus 16 Ziffern bestehen.'
  }
}

export function expiryDate() {
  return (value) => {
    const text = String(value ?? '').trim()
    if (!text) return ''
    const match = /^(\d{2})\/(\d{2})$/.exec(text)
    if (!match) return 'Bitte gib das Ablaufdatum im Format MM/JJ ein (z. B. 08/27).'
    const month = Number(match[1])
    if (month < 1 || month > 12) return 'Bitte gib einen gültigen Monat zwischen 01 und 12 ein.'
    const now = new Date()
    const year = 2000 + Number(match[2])
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Die Karte ist abgelaufen.'
    }
    return ''
  }
}

export function securityCode() {
  return (value) => {
    const text = String(value ?? '').trim()
    if (!text) return ''
    return /^\d{3}$/.test(text) ? '' : 'Der Sicherheitscode muss aus 3 Ziffern bestehen.'
  }
}

export function nonNegativePrice() {
  return (value) => {
    const text = String(value ?? '').trim().replace(',', '.')
    if (!text) return ''
    const number = Number(text)
    return Number.isFinite(number) && number >= 0 ? '' : 'Bitte gib einen gültigen Preis ein (z. B. 49,90).'
  }
}

export function parsePrice(value) {
  return Number(String(value ?? '').trim().replace(',', '.'))
}
