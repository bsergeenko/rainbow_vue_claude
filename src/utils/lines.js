import { assetUrl } from './api.js'
import { designLabel, findDesign, firstImage, subLabel, targetLabel, unitPrice } from './products.js'

/**
 * Ergänzt einen Warenkorb- oder Bestellartikel um Produktinformationen,
 * Bild, Rückenmotiv und Preise.
 */
export function buildLine(item, products, designs) {
  const product = (products || []).find((entry) => entry.id === item.productId) || null
  const design = item.designId ? findDesign(designs, item.designId) : null
  const quantity = Number(item.quantity) || 1
  const price = item.unitPrice !== undefined ? Number(item.unitPrice) : unitPrice(product, item.size)
  const productImage = product ? firstImage(product, item.color) : ''
  const designImage = design ? assetUrl(design.image) : ''
  const lineTotal = item.itemTotal !== undefined ? Number(item.itemTotal) : Number.isFinite(price) ? price * quantity : NaN

  return {
    ...item,
    quantity,
    product,
    design,
    designName: design ? designLabel(design, designs) : '',
    designImage,
    isCustom: !!item.designId,
    target: item.designId ? targetLabel(product) : '',
    targetSub: item.designId ? subLabel(product) : '',
    image: productImage || (item.designId ? designImage : ''),
    imageIsDesign: !productImage && !!designImage,
    unitPrice: price,
    lineTotal
  }
}
