import { merchantProfile } from '@/lib/mock/data'
import { formatDzd } from '@/lib/format'
import { getPayouts, getProducts, getRequests } from '@/lib/vendorStore'

export type VendorNotificationType = 'request' | 'payout' | 'product'

export type VendorNotification = {
  id: string
  type: VendorNotificationType
  titleAr: string
  titleFr: string
  bodyAr: string
  bodyFr: string
  link: string
  read: boolean
  createdAt: string
}

const LOW_STOCK_THRESHOLD = 5

function payoutOf(amountDzd: number): number {
  return amountDzd - Math.round((amountDzd * merchantProfile.commissionRate) / 100)
}

export function buildVendorNotifications(): Omit<VendorNotification, 'read'>[] {
  const items: Omit<VendorNotification, 'read'>[] = []

  for (const r of getRequests().filter((req) => req.status === 'submitted')) {
    const payout = payoutOf(r.amountDzd)
    items.push({
      id: `request:${r.reference}`,
      type: 'request',
      titleAr: 'طلب تمويل بانتظار التأكيد',
      titleFr: 'Demande en attente de confirmation',
      bodyAr: `${r.reference} — ${r.customerName} — ${r.productName} — ${formatDzd(r.amountDzd, 'ar')} (صافي ${formatDzd(payout, 'ar')})`,
      bodyFr: `${r.reference} — ${r.customerName} — ${r.productName} — ${formatDzd(r.amountDzd, 'fr')} (net ${formatDzd(payout, 'fr')})`,
      link: `/requests/${r.reference}`,
      createdAt: r.createdAt,
    })
  }

  for (const p of getPayouts().filter((po) => po.status === 'pending' || po.status === 'processing')) {
    items.push({
      id: `payout:${p.reference}`,
      type: 'payout',
      titleAr: p.status === 'pending' ? 'دفعة معلقة' : 'دفعة قيد المعالجة',
      titleFr: p.status === 'pending' ? 'Versement en attente' : 'Versement en cours',
      bodyAr: `${p.reference} — ${p.productName} — ${formatDzd(p.amountDzd, 'ar')}`,
      bodyFr: `${p.reference} — ${p.productName} — ${formatDzd(p.amountDzd, 'fr')}`,
      link: `/payouts/${p.reference}`,
      createdAt: p.expectedDate,
    })
  }

  for (const p of getProducts().filter(
    (prod) => prod.stock != null && prod.stock <= LOW_STOCK_THRESHOLD,
  )) {
    const name = p.name
    const nameFr = p.nameFr
    const isOut = p.stock === 0
    items.push({
      id: `product:${p.id}`,
      type: 'product',
      titleAr: isOut ? 'منتج نفد من المخزون' : 'مخزون منخفض',
      titleFr: isOut ? 'Produit en rupture' : 'Stock faible',
      bodyAr: isOut
        ? `${name} — المخزون: 0`
        : `${name} — متبقي ${p.stock} وحدة`,
      bodyFr: isOut
        ? `${nameFr} — Stock : 0`
        : `${nameFr} — ${p.stock} unité(s) restante(s)`,
      link: `/products/${p.id}`,
      createdAt: new Date().toISOString().slice(0, 10),
    })
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
