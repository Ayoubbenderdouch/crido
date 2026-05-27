// ─────────────────────────────────────────────────────────────
// Mock data for the Crido vendor dashboard visual prototype.
// Everything is scoped to a single merchant — "طاهر فون", an
// electronics shop in Adrar. Swapped for real /api/v1/merchant
// responses from Sprint 1 onward.
// ─────────────────────────────────────────────────────────────

export type Locale = 'ar' | 'fr'

export type RequestStatus =
  | 'submitted'
  | 'merchant_confirmed'
  | 'processing'
  | 'approved'
  | 'completed'
  | 'merchant_rejected'
export type FinancingStatus = 'active' | 'completed' | 'defaulted'
export type PayoutStatus = 'pending' | 'processing' | 'paid'
export type PayoutMethod = 'ccp_transfer' | 'baridi_mob' | 'cash_delivery'
export type StaffRole = 'owner' | 'manager' | 'cashier' | 'viewer'
export type CustomerStatus = 'active' | 'inactive'

/** The merchant profile — the single tenant this dashboard belongs to. */
export const merchantProfile = {
  id: 1,
  slug: 'tahar-phones',
  name: 'طاهر فون',
  nameFr: 'Tahar Phone',
  tagline: 'هواتف ذكية وإلكترونيات — أدرار',
  description: 'متجر متخصص في الهواتف الذكية والأجهزة الإلكترونية والملحقات. شريك معتمد لدى Crido منذ ديسمبر 2025.',
  category: 'إلكترونيات',
  rc: '11/00-1248763 B 25',
  nif: '002011124876355',
  nis: '0980110248763',
  art: '11248763',
  phone: '+213661234567',
  email: 'contact@taharphone.dz',
  website: 'taharphone.dz',
  wilaya: 'أدرار',
  commune: 'أدرار',
  address: 'شارع الإمام مالك، حي 20 أوت، أدرار',
  commissionRate: 5,
  bank: {
    type: 'ccp' as const,
    holder: 'طاهر بلعباس',
    ccp: '0024871563 clé 41',
    rip: '00799999002487156341',
    baridiMob: '+213661234567',
  },
  joinedAt: '2025-12-10',
} as const

export const currentUser = {
  name: 'طاهر بلعباس',
  role: 'owner' as StaffRole,
  phone: '+213661234567',
  email: 'tahar@taharphone.dz',
}

export type IncomingRequest = {
  reference: string
  customerId: number
  customerName: string
  customerPhone: string
  productName: string
  amountDzd: number
  planMonths: number
  branchName: string
  status: RequestStatus
  createdAt: string
  note: string | null
  /** ISO datetime — set the moment the request appears in the merchant queue. */
  submittedAt: string
  /** ISO datetime — set when the merchant confirms availability + price. */
  merchantConfirmedAt?: string | null
  /** ISO datetime — set when Crido takes the request into processing. */
  processingStartedAt?: string | null
  /** ISO datetime — set when Crido approves the request. */
  approvedAt?: string | null
  /** ISO datetime — set when the financing has been fully delivered. */
  completedAt?: string | null
  /** ISO datetime — set on merchant rejection. */
  rejectedAt?: string | null
}

export type Financing = {
  reference: string
  requestRef: string
  customerName: string
  productName: string
  totalAmountDzd: number
  payoutDzd: number
  payoutPaid: boolean
  planMonths: number
  status: FinancingStatus
  activatedAt: string
}

export type Payout = {
  reference: string
  financingRef: string
  customerName: string
  productName: string
  amountDzd: number
  method: PayoutMethod
  status: PayoutStatus
  externalRef: string | null
  agentName: string | null
  expectedDate: string
  paidAt: string | null
}

export type Customer = {
  id: number
  name: string
  phone: string
  commune: string
  purchaseCount: number
  totalSpentDzd: number
  firstPurchaseAt: string
  lastPurchaseAt: string
  status: CustomerStatus
}

export type Product = {
  id: number
  name: string
  nameFr: string
  category: string
  priceDzd: number
  sku: string
  stock: number | null
  available: boolean
  descriptionAr?: string
  descriptionFr?: string
  coverImage?: string
  gallery?: string[]
}

export type Branch = {
  id: number
  name: string
  wilaya: string
  commune: string
  street: string
  phone: string
  managerName: string
  active: boolean
}

export type Staff = {
  id: number
  name: string
  phone: string
  role: StaffRole
  lastLoginAt: string | null
  active: boolean
}

// ── Incoming financing requests (9) ───────────────────────────
// Mix of statuses spans the richer flow: submitted → merchant_confirmed →
// processing → approved → completed (and merchant_rejected as a side path).
export const incomingRequests: IncomingRequest[] = [
  {
    reference: 'CR-2026-000142', customerId: 1, customerName: 'إبراهيم سحنون', customerPhone: '+213770112648',
    productName: 'iPhone 15 Pro', amountDzd: 240000, planMonths: 12, branchName: 'الفرع الرئيسي — أدرار',
    status: 'submitted', createdAt: '2026-05-20', note: null,
    submittedAt: '2026-05-20T09:14:00',
  },
  {
    reference: 'CR-2026-000139', customerId: 2, customerName: 'أيوب قويدري', customerPhone: '+213551203847',
    productName: 'iPhone 16', amountDzd: 200000, planMonths: 12, branchName: 'الفرع الرئيسي — أدرار',
    status: 'submitted', createdAt: '2026-05-19', note: null,
    submittedAt: '2026-05-19T17:03:00',
  },
  {
    reference: 'CR-2026-000137', customerId: 3, customerName: 'سمية حساني', customerPhone: '+213779338471',
    productName: 'Samsung Galaxy S24', amountDzd: 175000, planMonths: 12, branchName: 'فرع رقان',
    status: 'submitted', createdAt: '2026-05-19', note: null,
    submittedAt: '2026-05-19T11:48:00',
  },
  {
    reference: 'CR-2026-000133', customerId: 4, customerName: 'خديجة عمراني', customerPhone: '+213551667214',
    productName: 'حاسوب محمول HP Pavilion', amountDzd: 132000, planMonths: 6, branchName: 'الفرع الرئيسي — أدرار',
    status: 'merchant_confirmed', createdAt: '2026-05-16', note: 'السعر مؤكد، المنتج متوفر في المخزن.',
    submittedAt: '2026-05-16T10:22:00',
    merchantConfirmedAt: '2026-05-16T14:32:00',
  },
  {
    reference: 'CR-2026-000128', customerId: 5, customerName: 'محمد الأمين تواتي', customerPhone: '+213551772900',
    productName: 'تلفاز Samsung 55"', amountDzd: 158000, planMonths: 12, branchName: 'فرع تامست',
    status: 'processing', createdAt: '2026-05-14', note: 'تم التأكيد.',
    submittedAt: '2026-05-14T08:55:00',
    merchantConfirmedAt: '2026-05-14T12:12:00',
    processingStartedAt: '2026-05-15T09:30:00',
  },
  {
    reference: 'CR-2026-000124', customerId: 3, customerName: 'سمية حساني', customerPhone: '+213779338471',
    productName: 'سماعة AirPods Pro', amountDzd: 48000, planMonths: 6, branchName: 'فرع رقان',
    status: 'processing', createdAt: '2026-05-12', note: 'المنتج جاهز للاستلام.',
    submittedAt: '2026-05-12T15:18:00',
    merchantConfirmedAt: '2026-05-12T18:40:00',
    processingStartedAt: '2026-05-13T10:05:00',
  },
  {
    reference: 'CR-2026-000121', customerId: 6, customerName: 'كريم العماري', customerPhone: '+213662918334',
    productName: 'iPad Air', amountDzd: 118000, planMonths: 6, branchName: 'الفرع الرئيسي — أدرار',
    status: 'approved', createdAt: '2026-05-08', note: 'تم التأكيد.',
    submittedAt: '2026-05-08T11:00:00',
    merchantConfirmedAt: '2026-05-08T13:45:00',
    processingStartedAt: '2026-05-09T09:10:00',
    approvedAt: '2026-05-10T16:25:00',
  },
  {
    reference: 'CR-2026-000115', customerId: 7, customerName: 'نسيمة بكاي', customerPhone: '+213662550719',
    productName: 'Samsung Galaxy A55', amountDzd: 72000, planMonths: 6, branchName: 'الفرع الرئيسي — أدرار',
    status: 'completed', createdAt: '2026-05-03', note: 'تم التأكيد.',
    submittedAt: '2026-05-03T09:32:00',
    merchantConfirmedAt: '2026-05-03T11:18:00',
    processingStartedAt: '2026-05-04T08:50:00',
    approvedAt: '2026-05-05T14:00:00',
    completedAt: '2026-05-05T17:42:00',
  },
  {
    reference: 'CR-2026-000108', customerId: 8, customerName: 'يوسف بن عيسى', customerPhone: '+213663401255',
    productName: 'سماعة AirPods Pro', amountDzd: 48000, planMonths: 6, branchName: 'فرع أولف',
    status: 'merchant_rejected', createdAt: '2026-04-27', note: 'المنتج غير متوفر حالياً في المخزن.',
    submittedAt: '2026-04-27T16:20:00',
    rejectedAt: '2026-04-27T19:05:00',
  },
]

// ── Financings issued via this merchant (6) ───────────────────
export const financings: Financing[] = [
  { reference: 'CRF-2026-000089', requestRef: 'CR-2026-000121', customerName: 'كريم العماري', productName: 'iPad Air', totalAmountDzd: 127440, payoutDzd: 112100, payoutPaid: true, planMonths: 6, status: 'active', activatedAt: '2026-05-10' },
  { reference: 'CRF-2026-000081', requestRef: 'CR-2026-000115', customerName: 'نسيمة بكاي', productName: 'Samsung Galaxy A55', totalAmountDzd: 77760, payoutDzd: 68400, payoutPaid: false, planMonths: 6, status: 'active', activatedAt: '2026-05-05' },
  { reference: 'CRF-2026-000074', requestRef: 'CR-2026-000098', customerName: 'محمد الأمين تواتي', productName: 'iPhone 14', totalAmountDzd: 186300, payoutDzd: 153425, payoutPaid: true, planMonths: 12, status: 'active', activatedAt: '2026-03-18' },
  { reference: 'CRF-2026-000066', requestRef: 'CR-2026-000084', customerName: 'سمية حساني', productName: 'تلفاز LG 50"', totalAmountDzd: 109250, payoutDzd: 90250, payoutPaid: true, planMonths: 12, status: 'active', activatedAt: '2026-02-22' },
  { reference: 'CRF-2026-000052', requestRef: 'CR-2026-000061', customerName: 'أيوب قويدري', productName: 'iPhone 13', totalAmountDzd: 166750, payoutDzd: 137750, payoutPaid: true, planMonths: 12, status: 'completed', activatedAt: '2025-05-12' },
  { reference: 'CRF-2026-000041', requestRef: 'CR-2026-000049', customerName: 'عبد الرحمن مولاي', productName: 'Samsung Galaxy A34', totalAmountDzd: 63250, payoutDzd: 55100, payoutPaid: true, planMonths: 6, status: 'defaulted', activatedAt: '2025-12-30' },
]

// ── Payouts from Crido to this merchant (6) ───────────────────
export const payouts: Payout[] = [
  { reference: 'PO-2026-000231', financingRef: 'CRF-2026-000081', customerName: 'نسيمة بكاي', productName: 'Samsung Galaxy A55', amountDzd: 68400, method: 'baridi_mob', status: 'pending', externalRef: null, agentName: null, expectedDate: '2026-05-23', paidAt: null },
  { reference: 'PO-2026-000228', financingRef: 'CRF-2026-000089', customerName: 'كريم العماري', productName: 'iPad Air', amountDzd: 112100, method: 'ccp_transfer', status: 'processing', externalRef: null, agentName: null, expectedDate: '2026-05-21', paidAt: null },
  { reference: 'PO-2026-000219', financingRef: 'CRF-2026-000074', customerName: 'محمد الأمين تواتي', productName: 'iPhone 14', amountDzd: 153425, method: 'ccp_transfer', status: 'paid', externalRef: 'CCP-VIR-884213', agentName: null, expectedDate: '2026-03-20', paidAt: '2026-03-20' },
  { reference: 'PO-2026-000204', financingRef: 'CRF-2026-000066', customerName: 'سمية حساني', productName: 'تلفاز LG 50"', amountDzd: 90250, method: 'cash_delivery', status: 'paid', externalRef: null, agentName: 'وكيل Crido — رشيد', expectedDate: '2026-02-25', paidAt: '2026-02-25' },
  { reference: 'PO-2026-000188', financingRef: 'CRF-2026-000052', customerName: 'أيوب قويدري', productName: 'iPhone 13', amountDzd: 137750, method: 'baridi_mob', status: 'paid', externalRef: 'BM-770118', agentName: null, expectedDate: '2025-05-14', paidAt: '2025-05-14' },
  { reference: 'PO-2026-000170', financingRef: 'CRF-2026-000041', customerName: 'عبد الرحمن مولاي', productName: 'Samsung Galaxy A34', amountDzd: 55100, method: 'ccp_transfer', status: 'paid', externalRef: 'CCP-VIR-770042', agentName: null, expectedDate: '2026-01-02', paidAt: '2026-01-02' },
]

// ── Customers of this merchant (8) ────────────────────────────
export const customers: Customer[] = [
  { id: 1, name: 'إبراهيم سحنون', phone: '+213770112648', commune: 'أدرار', purchaseCount: 1, totalSpentDzd: 0, firstPurchaseAt: '2026-05-20', lastPurchaseAt: '2026-05-20', status: 'active' },
  { id: 2, name: 'أيوب قويدري', phone: '+213551203847', commune: 'أدرار', purchaseCount: 2, totalSpentDzd: 366750, firstPurchaseAt: '2025-05-12', lastPurchaseAt: '2026-05-19', status: 'active' },
  { id: 3, name: 'سمية حساني', phone: '+213779338471', commune: 'رقان', purchaseCount: 2, totalSpentDzd: 284250, firstPurchaseAt: '2026-02-22', lastPurchaseAt: '2026-05-19', status: 'active' },
  { id: 4, name: 'خديجة عمراني', phone: '+213551667214', commune: 'أدرار', purchaseCount: 1, totalSpentDzd: 0, firstPurchaseAt: '2026-05-16', lastPurchaseAt: '2026-05-16', status: 'active' },
  { id: 5, name: 'محمد الأمين تواتي', phone: '+213551772900', commune: 'تامست', purchaseCount: 2, totalSpentDzd: 344300, firstPurchaseAt: '2026-03-18', lastPurchaseAt: '2026-05-14', status: 'active' },
  { id: 6, name: 'كريم العماري', phone: '+213662918334', commune: 'أدرار', purchaseCount: 1, totalSpentDzd: 127440, firstPurchaseAt: '2026-05-10', lastPurchaseAt: '2026-05-10', status: 'active' },
  { id: 7, name: 'نسيمة بكاي', phone: '+213662550719', commune: 'أولف', purchaseCount: 1, totalSpentDzd: 77760, firstPurchaseAt: '2026-05-05', lastPurchaseAt: '2026-05-05', status: 'active' },
  { id: 8, name: 'يوسف بن عيسى', phone: '+213663401255', commune: 'أولف', purchaseCount: 0, totalSpentDzd: 0, firstPurchaseAt: '2026-04-27', lastPurchaseAt: '2026-04-27', status: 'inactive' },
]

// ── Catalog products (8) ──────────────────────────────────────
export const products: Product[] = [
  { id: 1, name: 'iPhone 16', nameFr: 'iPhone 16', category: 'هواتف ذكية', priceDzd: 200000, sku: 'TP-IP16-128', stock: 7, available: true },
  { id: 2, name: 'iPhone 15 Pro', nameFr: 'iPhone 15 Pro', category: 'هواتف ذكية', priceDzd: 240000, sku: 'TP-IP15P-256', stock: 4, available: true },
  { id: 3, name: 'Samsung Galaxy S24', nameFr: 'Samsung Galaxy S24', category: 'هواتف ذكية', priceDzd: 175000, sku: 'TP-SGS24-256', stock: 5, available: true },
  { id: 4, name: 'Samsung Galaxy A55', nameFr: 'Samsung Galaxy A55', category: 'هواتف ذكية', priceDzd: 72000, sku: 'TP-SGA55-128', stock: 12, available: true },
  { id: 5, name: 'حاسوب محمول HP Pavilion', nameFr: 'PC portable HP Pavilion', category: 'حواسيب', priceDzd: 132000, sku: 'TP-HPPAV-15', stock: 3, available: true },
  { id: 6, name: 'iPad Air', nameFr: 'iPad Air', category: 'أجهزة لوحية', priceDzd: 118000, sku: 'TP-IPADAIR', stock: 6, available: true },
  { id: 7, name: 'تلفاز Samsung 55"', nameFr: 'TV Samsung 55"', category: 'تلفزيونات', priceDzd: 158000, sku: 'TP-SAMTV55', stock: 0, available: false },
  { id: 8, name: 'سماعة AirPods Pro', nameFr: 'AirPods Pro', category: 'ملحقات', priceDzd: 48000, sku: 'TP-AIRPODP', stock: 9, available: true },
]

// ── Branches (3) ──────────────────────────────────────────────
export const branches: Branch[] = [
  { id: 1, name: 'الفرع الرئيسي — أدرار', wilaya: 'أدرار', commune: 'أدرار', street: 'شارع الإمام مالك، حي 20 أوت', phone: '+213661234567', managerName: 'طاهر بلعباس', active: true },
  { id: 2, name: 'فرع رقان', wilaya: 'أدرار', commune: 'رقان', street: 'حي السلام، الطريق الوطني رقم 6', phone: '+213551098220', managerName: 'سفيان قاسمي', active: true },
  { id: 3, name: 'فرع تامست', wilaya: 'أدرار', commune: 'تامست', street: 'وسط المدينة، تامست', phone: '+213662771403', managerName: 'حمزة بن يحيى', active: false },
]

// ── Staff with dashboard access (4) ───────────────────────────
export const staff: Staff[] = [
  { id: 1, name: 'طاهر بلعباس', phone: '+213661234567', role: 'owner', lastLoginAt: '2026-05-20', active: true },
  { id: 2, name: 'سفيان قاسمي', phone: '+213551098220', role: 'manager', lastLoginAt: '2026-05-19', active: true },
  { id: 3, name: 'حمزة بن يحيى', phone: '+213662771403', role: 'cashier', lastLoginAt: '2026-05-18', active: true },
  { id: 4, name: 'لطيفة مرابط', phone: '+213770339187', role: 'viewer', lastLoginAt: null, active: false },
]

// ── KYB documents shown on the profile page ───────────────────
export const kybDocuments = [
  { key: 'rc', status: 'approved' as const },
  { key: 'nif', status: 'approved' as const },
  { key: 'nis', status: 'approved' as const },
  { key: 'ownerId', status: 'pending' as const },
]

// ── Support chat with the Crido admin team ────────────────────
export type SupportMessage = {
  id: string
  sender: 'vendor' | 'admin'
  body: string
  sent_at: string
  read: boolean
}

export const MOCK_SUPPORT_MESSAGES: SupportMessage[] = [
  {
    id: 'msg-001',
    sender: 'vendor',
    body: 'السلام عليكم، عندي مشكلة مع طلب رقم CR-2026-000145',
    sent_at: '2026-05-27T08:42:00',
    read: true,
  },
  {
    id: 'msg-002',
    sender: 'admin',
    body: 'وعليكم السلام، أهلاً بك يا طاهر. ما هي المشكلة بالضبط؟',
    sent_at: '2026-05-27T08:46:00',
    read: true,
  },
  {
    id: 'msg-003',
    sender: 'vendor',
    body: 'العميل غيّر رأيه بعد ما وقّعت العقد، ويطلب إلغاء الطلب.',
    sent_at: '2026-05-27T08:48:00',
    read: true,
  },
  {
    id: 'msg-004',
    sender: 'admin',
    body: 'لا مشكلة، يمكننا إلغاء الطلب قبل تحويل المبلغ. سأرسل لك رابط التأكيد بعد لحظات.',
    sent_at: '2026-05-27T08:50:00',
    read: true,
  },
  {
    id: 'msg-005',
    sender: 'vendor',
    body: 'شكراً جزيلاً. سؤال آخر: متى أستلم دفعة CRF-2026-000081؟',
    sent_at: '2026-05-27T08:52:00',
    read: true,
  },
  {
    id: 'msg-006',
    sender: 'admin',
    body: 'تظهر لي في النظام كـ "قيد المعالجة". التحويل سيتم خلال 24 ساعة عبر BaridiMob.',
    sent_at: '2026-05-27T08:55:00',
    read: true,
  },
  {
    id: 'msg-007',
    sender: 'vendor',
    body: 'ممتاز، بارك الله فيك.',
    sent_at: '2026-05-27T08:56:00',
    read: true,
  },
  {
    id: 'msg-008',
    sender: 'admin',
    body: 'في الخدمة دائماً. إذا احتجت أي شيء آخر، أنا هنا.',
    sent_at: '2026-05-27T08:57:00',
    read: false,
  },
]

export const SUPPORT_QUICK_REPLIES = [
  'مشكلة مع طلب',
  'تأخر في الدفع',
  'أحتاج تغيير في حسابي',
  'أحتاج التحدث مع مسؤول',
  'أخرى',
]

export const SUPPORT_CANNED_REPLIES = [
  'شكراً على رسالتك. سأتحقق من الأمر وأعود إليك في أقرب وقت.',
  'تم تسجيل طلبك. سيتواصل معك أحد الزملاء قريباً.',
  'فهمت. أمهلني دقائق لأراجع الملف.',
  'سأنقل المشكلة إلى فريق العمليات وأخبرك بالنتيجة.',
  'تم. سنرسل لك تأكيداً عبر الرسائل القصيرة بمجرد المعالجة.',
]

/** Daily sales series for dashboard charts (365 days — filtered in UI by period). */
export function buildDailySeries(): { date: string; salesDzd: number }[] {
  const out: { date: string; salesDzd: number }[] = []
  const today = new Date('2026-05-20')
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const wave = Math.sin(i / 17) + Math.cos(i / 38) * 0.3 + 1.2
    const seasonal = 1 + Math.sin((i / 365) * Math.PI * 2) * 0.14
    out.push({
      date: d.toISOString().slice(0, 10),
      salesDzd: Math.round((wave * 34000 * seasonal + (i % 5) * 9000) / 1000) * 1000,
    })
  }
  return out
}
