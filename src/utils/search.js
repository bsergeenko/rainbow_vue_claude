import { CATEGORY_LABELS, COLOR_LABELS, SUBCATEGORY_LABELS } from './format.js'
import { productVariants } from './products.js'

// Deutsche Suchbegriffe und gängige Synonyme je Kategorie
const CATEGORY_TERMS = {
  women: ['damen', 'dame', 'frau', 'frauen'],
  men: ['herren', 'herr', 'mann', 'männer'],
  kids: ['kinder', 'kind', 'mädchen', 'jungen', 'junge'],
  dogs: ['hunde', 'hund']
}

// Begriffe, die zusätzlich gezielt auf eine Unterkategorie verweisen
const SUBCATEGORY_TERMS = {
  girls: ['mädchen'],
  boys: ['jungen', 'junge']
}

function normalize(text) {
  return String(text || '')
    .toLocaleLowerCase('de-DE')
    .normalize('NFC')
    .trim()
}

function termMatches(term, word) {
  return term.startsWith(word)
}

// Prüft, ob ein Suchwort auf Produktname oder Kategorie passt
function matchesProduct(product, word) {
  if (normalize(product.name).includes(word)) return true

  const categoryTerms = [normalize(CATEGORY_LABELS[product.category]), ...(CATEGORY_TERMS[product.category] || [])]
  const subcategoryTerms = SUBCATEGORY_TERMS[product.subcategory] || []
  const allSubTerms = Object.values(SUBCATEGORY_TERMS).flat()

  // „Mädchen“ bzw. „Jungen“ führen gezielt zur passenden Unterkategorie
  const isSubWord = allSubTerms.some((term) => termMatches(term, word)) && word.length >= 3
  if (product.category === 'kids' && isSubWord && product.subcategory) {
    return subcategoryTerms.some((term) => termMatches(term, word)) ||
      normalize(SUBCATEGORY_LABELS[product.subcategory]).startsWith(word)
  }

  return categoryTerms.some((term) => termMatches(term, word))
}

function matchesColor(color, word) {
  const label = normalize(COLOR_LABELS[color] || '')
  return !!label && label.includes(word)
}

/**
 * Liefert passende Farbvarianten. Jedes Suchwort muss entweder auf
 * Produktname/Kategorie oder auf die Farbe der Variante passen.
 */
export function searchProducts(products, query) {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const results = []
  for (const product of products) {
    for (const variant of productVariants(product)) {
      const ok = words.every((word) => matchesProduct(product, word) || matchesColor(variant.color, word))
      if (ok) results.push(variant)
    }
  }
  return results
}
