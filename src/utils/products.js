import { assetUrl } from './api.js'
import { SUBCATEGORY_LABELS, TARGET_LABELS, formatPrice } from './format.js'

export function hasSizePrices(product) {
  return !!product && product.category === 'kids' && !!product.pricesBySize && typeof product.pricesBySize === 'object'
}

export function minPrice(product) {
  if (!hasSizePrices(product)) return Number(product?.price)
  const values = Object.values(product.pricesBySize).map(Number).filter(Number.isFinite)
  return values.length ? Math.min(...values) : NaN
}

export function unitPrice(product, size) {
  if (!product) return NaN
  if (hasSizePrices(product)) return Number(product.pricesBySize[size])
  return Number(product.price)
}

// Preis für Übersichten: Kinderprodukte mit „ab“ und dem niedrigsten Größenpreis
export function displayPrice(product) {
  if (!product) return ''
  if (hasSizePrices(product)) return `ab ${formatPrice(minPrice(product))}`
  return formatPrice(product.price)
}

export function colorsWithImages(product) {
  const images = product?.imagesByColor || {}
  return (product?.colors || []).filter((color) => Array.isArray(images[color]) && images[color].length > 0)
}

export function imagesFor(product, color) {
  const images = product?.imagesByColor?.[color]
  return Array.isArray(images) ? images.map(assetUrl) : []
}

export function firstImage(product, color) {
  return imagesFor(product, color)[0] || ''
}

// Jede Farbvariante mit eigenem Produktbild wird als eigene Karte dargestellt
export function productVariants(product) {
  const colors = colorsWithImages(product)
  if (colors.length === 0) {
    return [{ key: product.id, product, color: product.colors?.[0] || '', image: '' }]
  }
  return colors.map((color) => ({
    key: `${product.id}-${color}`,
    product,
    color,
    image: firstImage(product, color)
  }))
}

export function allDesigns(designs) {
  return [...(designs?.adult || []), ...(designs?.kids || [])]
}

export function findDesign(designs, id) {
  if (!designs || !id) return null
  return allDesigns(designs).find((item) => item.id === id) || null
}

export function designGroup(designs, design) {
  if (!design) return ''
  return (designs?.kids || []).some((item) => item.id === design.id) ? 'kids' : 'adult'
}

// Lesbarer Name eines Rückenmotivs, z. B. „Motiv 07 · Erwachsene“
export function designLabel(design, designs) {
  if (!design) return ''
  const group = designGroup(designs, design) === 'kids' ? 'Kinder' : 'Erwachsene'
  const match = /(\d+)\D*$/.exec(design.image || design.id || '')
  const number = match ? match[1] : ''
  return number ? `Motiv ${number} · ${group}` : `Motiv · ${group}`
}

// „Für wen?“-Angabe eines individualisierbaren Produkts
export function targetLabel(product) {
  if (!product) return ''
  return TARGET_LABELS[product.category] || ''
}

export function subLabel(product) {
  if (!product || product.category !== 'kids' || !product.subcategory) return ''
  return SUBCATEGORY_LABELS[product.subcategory] || ''
}

export function productLink(productId, color) {
  return color
    ? { path: `/produkt/${encodeURIComponent(productId)}`, query: { farbe: color } }
    : { path: `/produkt/${encodeURIComponent(productId)}` }
}
