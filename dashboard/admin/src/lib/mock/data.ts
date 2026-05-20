// ─────────────────────────────────────────────────────────────
// Mock data for the Crido admin dashboard visual prototype.
// All entities mirror docs/DATABASE_SCHEMA.md. Swapped for real
// API responses from Sprint 1 onward.
// ─────────────────────────────────────────────────────────────

export type Locale = 'ar' | 'fr'
export type CreditTier = 'A' | 'B' | 'C' | 'D' | 'E'
export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired'
export type MerchantSource = 'partner' | 'ad_hoc'
export type MerchantStatus = 'pending' | 'active' | 'suspended' | 'rejected'
export type EmploymentStatus = 'employed' | 'self_employed' | 'student' | 'retired' | 'unemployed' | 'other'

export type RequestStatus =
  | 'draft' | 'submitted' | 'merchant_confirmed' | 'merchant_rejected'
  | 'under_review' | 'documents_required' | 'contracts_generated'
  | 'contracts_signed' | 'approved' | 'rejected' | 'cancelled_by_client' | 'expired'

export type FinancingStatus = 'active' | 'late' | 'completed' | 'defaulted' | 'cancelled'
export type PaymentStatus = 'pending_proof' | 'pending_verification' | 'verified' | 'rejected'
export type PaymentMethod = 'ccp' | 'baridi_mob' | 'bank_transfer' | 'cash_to_agent'

export type Client = {
  id: number
  name: string
  phone: string
  commune: string
  kycStatus: KycStatus
  tier: CreditTier
  creditScore: number
  creditLimitDzd: number
  usedCreditDzd: number
  activeFinancings: number
  employmentStatus: EmploymentStatus
  employer: string | null
  monthlyIncomeDzd: number | null
  dateOfBirth: string
  address: string
  createdAt: string
  lastActivityAt: string
}

export type Merchant = {
  id: number
  slug: string
  name: string
  source: MerchantSource
  status: MerchantStatus
  phone: string
  commune: string
  totalSalesDzd: number
  totalFinancings: number
  commissionRate: number
  createdAt: string
}

export type FinancingRequest = {
  reference: string
  clientId: number
  clientName: string
  clientTier: CreditTier
  merchantName: string
  merchantSource: MerchantSource
  productName: string
  amountDzd: number
  planMonths: number
  status: RequestStatus
  createdAt: string
}

export type Financing = {
  reference: string
  clientName: string
  merchantName: string
  productName: string
  totalToCollectDzd: number
  paidAmountDzd: number
  remainingDzd: number
  monthlyInstallmentDzd: number
  durationMonths: number
  paidInstallments: number
  nextDueDate: string
  status: FinancingStatus
  activatedAt: string
}

export type Payment = {
  reference: string
  clientName: string
  financingRef: string
  amountDzd: number
  method: PaymentMethod
  externalRef: string
  status: PaymentStatus
  submittedAt: string
}

export const currentAdmin = {
  name: 'أيوب بن دردوش',
  role: 'admin' as const,
  email: 'admin@crido.dz',
}

export const clients: Client[] = [
  { id: 1, name: 'أيوب قويدري', phone: '+213551203847', commune: 'أدرار', kycStatus: 'approved', tier: 'B', creditScore: 690, creditLimitDzd: 280000, usedCreditDzd: 230000, activeFinancings: 1, employmentStatus: 'employed', employer: 'الأمن الوطني', monthlyIncomeDzd: 70000, dateOfBirth: '1997-03-12', address: 'حي 20 أوت، أدرار', createdAt: '2026-01-14', lastActivityAt: '2026-05-18' },
  { id: 2, name: 'كريم العماري', phone: '+213662918334', commune: 'رقان', kycStatus: 'approved', tier: 'C', creditScore: 580, creditLimitDzd: 200000, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'self_employed', employer: null, monthlyIncomeDzd: 85000, dateOfBirth: '1990-07-30', address: 'حي السلام، رقان', createdAt: '2026-02-02', lastActivityAt: '2026-05-11' },
  { id: 3, name: 'فاطمة الزهراء بلقاسم', phone: '+213770564219', commune: 'أدرار', kycStatus: 'pending', tier: 'C', creditScore: 530, creditLimitDzd: 0, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'employed', employer: 'مديرية التربية', monthlyIncomeDzd: 62000, dateOfBirth: '1995-11-05', address: 'حي بودة، أدرار', createdAt: '2026-05-09', lastActivityAt: '2026-05-19' },
  { id: 4, name: 'محمد الأمين تواتي', phone: '+213551772900', commune: 'تامست', kycStatus: 'approved', tier: 'A', creditScore: 765, creditLimitDzd: 480000, usedCreditDzd: 150000, activeFinancings: 1, employmentStatus: 'employed', employer: 'سونلغاز', monthlyIncomeDzd: 110000, dateOfBirth: '1988-01-22', address: 'وسط المدينة، تامست', createdAt: '2025-12-20', lastActivityAt: '2026-05-17' },
  { id: 5, name: 'يوسف بن عيسى', phone: '+213663401255', commune: 'أولف', kycStatus: 'pending', tier: 'C', creditScore: 500, creditLimitDzd: 0, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'student', employer: null, monthlyIncomeDzd: null, dateOfBirth: '2002-09-14', address: 'حي النصر، أولف', createdAt: '2026-05-15', lastActivityAt: '2026-05-19' },
  { id: 6, name: 'سمية حساني', phone: '+213779338471', commune: 'أدرار', kycStatus: 'approved', tier: 'B', creditScore: 705, creditLimitDzd: 320000, usedCreditDzd: 92000, activeFinancings: 1, employmentStatus: 'employed', employer: 'البريد الجزائري', monthlyIncomeDzd: 78000, dateOfBirth: '1993-06-18', address: 'حي الوئام، أدرار', createdAt: '2026-01-30', lastActivityAt: '2026-05-16' },
  { id: 7, name: 'عبد الرحمن مولاي', phone: '+213551884003', commune: 'رقان', kycStatus: 'rejected', tier: 'D', creditScore: 470, creditLimitDzd: 0, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'unemployed', employer: null, monthlyIncomeDzd: null, dateOfBirth: '1999-04-09', address: 'حي 5 جويلية، رقان', createdAt: '2026-04-22', lastActivityAt: '2026-05-02' },
  { id: 8, name: 'نسيمة بكاي', phone: '+213662550719', commune: 'تسابيت', kycStatus: 'approved', tier: 'C', creditScore: 615, creditLimitDzd: 240000, usedCreditDzd: 240000, activeFinancings: 1, employmentStatus: 'employed', employer: 'مستشفى أدرار', monthlyIncomeDzd: 68000, dateOfBirth: '1991-12-01', address: 'حي المستقبل، تسابيت', createdAt: '2026-02-18', lastActivityAt: '2026-05-13' },
  { id: 9, name: 'إبراهيم سحنون', phone: '+213770112648', commune: 'أدرار', kycStatus: 'pending', tier: 'C', creditScore: 545, creditLimitDzd: 0, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'self_employed', employer: null, monthlyIncomeDzd: 95000, dateOfBirth: '1986-08-25', address: 'حي تيليلان، أدرار', createdAt: '2026-05-12', lastActivityAt: '2026-05-20' },
  { id: 10, name: 'خديجة عمراني', phone: '+213551667214', commune: 'بودة', kycStatus: 'approved', tier: 'B', creditScore: 680, creditLimitDzd: 300000, usedCreditDzd: 115000, activeFinancings: 1, employmentStatus: 'employed', employer: 'بلدية بودة', monthlyIncomeDzd: 72000, dateOfBirth: '1994-02-28', address: 'وسط بودة', createdAt: '2026-03-04', lastActivityAt: '2026-05-14' },
  { id: 11, name: 'الطاهر بن زيان', phone: '+213663920185', commune: 'أدرار', kycStatus: 'not_started', tier: 'C', creditScore: 500, creditLimitDzd: 0, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'other', employer: null, monthlyIncomeDzd: null, dateOfBirth: '2000-10-17', address: 'حي القدس، أدرار', createdAt: '2026-05-19', lastActivityAt: '2026-05-19' },
  { id: 12, name: 'وليد شعباني', phone: '+213779445026', commune: 'تيت', kycStatus: 'approved', tier: 'A', creditScore: 752, creditLimitDzd: 450000, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'employed', employer: 'الحماية المدنية', monthlyIncomeDzd: 98000, dateOfBirth: '1989-05-06', address: 'حي الشهداء، تيت', createdAt: '2025-11-28', lastActivityAt: '2026-05-10' },
]

export const merchants: Merchant[] = [
  { id: 1, slug: 'tahar-phones', name: 'طاهر فون', source: 'partner', status: 'active', phone: '+213661234567', commune: 'أدرار', totalSalesDzd: 4350000, totalFinancings: 23, commissionRate: 5, createdAt: '2025-12-10' },
  { id: 2, slug: 'electro-adrar', name: 'إلكترو أدرار', source: 'partner', status: 'active', phone: '+213551098220', commune: 'أدرار', totalSalesDzd: 2980000, totalFinancings: 16, commissionRate: 5, createdAt: '2026-01-08' },
  { id: 3, slug: 'meuble-touat', name: 'أثاث توات', source: 'partner', status: 'active', phone: '+213662771403', commune: 'أدرار', totalSalesDzd: 1640000, totalFinancings: 9, commissionRate: 6, createdAt: '2026-02-14' },
  { id: 4, slug: 'maison-reggane', name: 'محل النور للأجهزة', source: 'ad_hoc', status: 'active', phone: '+213770339187', commune: 'رقان', totalSalesDzd: 520000, totalFinancings: 3, commissionRate: 5, createdAt: '2026-03-22' },
  { id: 5, slug: 'phone-store-aoulef', name: 'متجر الهاتف أولف', source: 'ad_hoc', status: 'pending', phone: '+213551660934', commune: 'أولف', totalSalesDzd: 0, totalFinancings: 0, commissionRate: 5, createdAt: '2026-05-18' },
  { id: 6, slug: 'tamest-electro', name: 'تامست إلكترونيك', source: 'partner', status: 'suspended', phone: '+213663008255', commune: 'تامست', totalSalesDzd: 780000, totalFinancings: 4, commissionRate: 5, createdAt: '2026-01-25' },
]

export const financingRequests: FinancingRequest[] = [
  { reference: 'CR-2026-000142', clientId: 9, clientName: 'إبراهيم سحنون', clientTier: 'C', merchantName: 'محل البركة (مقترح)', merchantSource: 'ad_hoc', productName: 'iPhone 15', amountDzd: 195000, planMonths: 12, status: 'submitted', createdAt: '2026-05-20' },
  { reference: 'CR-2026-000141', clientId: 3, clientName: 'فاطمة الزهراء بلقاسم', clientTier: 'C', merchantName: 'إلكترو أدرار', merchantSource: 'partner', productName: 'ثلاجة LG 420 لتر', amountDzd: 138000, planMonths: 6, status: 'under_review', createdAt: '2026-05-19' },
  { reference: 'CR-2026-000140', clientId: 5, clientName: 'يوسف بن عيسى', clientTier: 'C', merchantName: 'متجر الهاتف أولف (مقترح)', merchantSource: 'ad_hoc', productName: 'Samsung Galaxy A55', amountDzd: 72000, planMonths: 6, status: 'submitted', createdAt: '2026-05-19' },
  { reference: 'CR-2026-000139', clientId: 1, clientName: 'أيوب قويدري', clientTier: 'B', merchantName: 'طاهر فون', merchantSource: 'partner', productName: 'iPhone 16', amountDzd: 200000, planMonths: 12, status: 'contracts_generated', createdAt: '2026-05-16' },
  { reference: 'CR-2026-000138', clientId: 11, clientName: 'الطاهر بن زيان', clientTier: 'C', merchantName: 'طاهر فون', merchantSource: 'partner', productName: 'حاسوب محمول HP', amountDzd: 124000, planMonths: 12, status: 'documents_required', createdAt: '2026-05-15' },
  { reference: 'CR-2026-000137', clientId: 6, clientName: 'سمية حساني', clientTier: 'B', merchantName: 'أثاث توات', merchantSource: 'partner', productName: 'طقم صالون', amountDzd: 165000, planMonths: 12, status: 'merchant_confirmed', createdAt: '2026-05-14' },
  { reference: 'CR-2026-000136', clientId: 2, clientName: 'كريم العماري', clientTier: 'C', merchantName: 'محل النور للأجهزة', merchantSource: 'ad_hoc', productName: 'غسالة Condor', amountDzd: 89000, planMonths: 6, status: 'contracts_signed', createdAt: '2026-05-12' },
  { reference: 'CR-2026-000135', clientId: 12, clientName: 'وليد شعباني', clientTier: 'A', merchantName: 'إلكترو أدرار', merchantSource: 'partner', productName: 'تلفاز Samsung 65"', amountDzd: 178000, planMonths: 12, status: 'approved', createdAt: '2026-05-08' },
  { reference: 'CR-2026-000134', clientId: 7, clientName: 'عبد الرحمن مولاي', clientTier: 'D', merchantName: 'طاهر فون', merchantSource: 'partner', productName: 'iPhone 13', amountDzd: 145000, planMonths: 12, status: 'rejected', createdAt: '2026-05-03' },
  { reference: 'CR-2026-000133', clientId: 10, clientName: 'خديجة عمراني', clientTier: 'B', merchantName: 'تامست إلكترونيك', merchantSource: 'partner', productName: 'مكيف هواء Cristor', amountDzd: 115000, planMonths: 12, status: 'approved', createdAt: '2026-04-29' },
  { reference: 'CR-2026-000132', clientId: 4, clientName: 'محمد الأمين تواتي', clientTier: 'A', merchantName: 'أثاث توات', merchantSource: 'partner', productName: 'غرفة نوم كاملة', amountDzd: 150000, planMonths: 12, status: 'approved', createdAt: '2026-04-21' },
  { reference: 'CR-2026-000131', clientId: 8, clientName: 'نسيمة بكاي', clientTier: 'C', merchantName: 'إلكترو أدرار', merchantSource: 'partner', productName: 'iPhone 15 Pro', amountDzd: 240000, planMonths: 12, status: 'expired', createdAt: '2026-04-10' },
]

export const financings: Financing[] = [
  { reference: 'CRF-2026-000089', clientName: 'أيوب قويدري', merchantName: 'طاهر فون', productName: 'iPhone 16', totalToCollectDzd: 230000, paidAmountDzd: 38333, remainingDzd: 191667, monthlyInstallmentDzd: 19167, durationMonths: 12, paidInstallments: 2, nextDueDate: '2026-06-08', status: 'active', activatedAt: '2026-04-08' },
  { reference: 'CRF-2026-000084', clientName: 'محمد الأمين تواتي', merchantName: 'أثاث توات', productName: 'غرفة نوم كاملة', totalToCollectDzd: 172500, paidAmountDzd: 57500, remainingDzd: 115000, monthlyInstallmentDzd: 14375, durationMonths: 12, paidInstallments: 4, nextDueDate: '2026-06-02', status: 'active', activatedAt: '2026-02-02' },
  { reference: 'CRF-2026-000081', clientName: 'سمية حساني', merchantName: 'تامست إلكترونيك', productName: 'مكيف هواء Cristor', totalToCollectDzd: 132250, paidAmountDzd: 22042, remainingDzd: 110208, monthlyInstallmentDzd: 11021, durationMonths: 12, paidInstallments: 2, nextDueDate: '2026-05-29', status: 'active', activatedAt: '2026-03-29' },
  { reference: 'CRF-2026-000078', clientName: 'نسيمة بكاي', merchantName: 'إلكترو أدرار', productName: 'غسالة Samsung', totalToCollectDzd: 96000, paidAmountDzd: 16000, remainingDzd: 80000, monthlyInstallmentDzd: 16000, durationMonths: 6, paidInstallments: 1, nextDueDate: '2026-05-12', status: 'late', activatedAt: '2026-03-12' },
  { reference: 'CRF-2026-000074', clientName: 'خديجة عمراني', merchantName: 'أثاث توات', productName: 'طقم مطبخ', totalToCollectDzd: 124200, paidAmountDzd: 41400, remainingDzd: 82800, monthlyInstallmentDzd: 10350, durationMonths: 12, paidInstallments: 4, nextDueDate: '2026-06-15', status: 'active', activatedAt: '2026-01-15' },
  { reference: 'CRF-2026-000066', clientName: 'كريم العماري', merchantName: 'طاهر فون', productName: 'iPhone 14', totalToCollectDzd: 162000, paidAmountDzd: 162000, remainingDzd: 0, monthlyInstallmentDzd: 13500, durationMonths: 12, paidInstallments: 12, nextDueDate: '2026-04-20', status: 'completed', activatedAt: '2025-04-20' },
  { reference: 'CRF-2026-000059', clientName: 'عبد الرحمن مولاي', merchantName: 'إلكترو أدرار', productName: 'تلفاز LG 55"', totalToCollectDzd: 138000, paidAmountDzd: 23000, remainingDzd: 115000, monthlyInstallmentDzd: 11500, durationMonths: 12, paidInstallments: 2, nextDueDate: '2026-02-28', status: 'defaulted', activatedAt: '2025-12-28' },
]

export const payments: Payment[] = [
  { reference: 'PAY-2026-000312', clientName: 'أيوب قويدري', financingRef: 'CRF-2026-000089', amountDzd: 19167, method: 'baridi_mob', externalRef: 'BM-784213', status: 'pending_verification', submittedAt: '2026-05-20' },
  { reference: 'PAY-2026-000311', clientName: 'سمية حساني', financingRef: 'CRF-2026-000081', amountDzd: 11021, method: 'ccp', externalRef: 'CCP-9920134', status: 'pending_verification', submittedAt: '2026-05-19' },
  { reference: 'PAY-2026-000310', clientName: 'نسيمة بكاي', financingRef: 'CRF-2026-000078', amountDzd: 16000, method: 'cash_to_agent', externalRef: '—', status: 'pending_verification', submittedAt: '2026-05-19' },
  { reference: 'PAY-2026-000309', clientName: 'محمد الأمين تواتي', financingRef: 'CRF-2026-000084', amountDzd: 14375, method: 'ccp', externalRef: 'CCP-9918880', status: 'verified', submittedAt: '2026-05-18' },
  { reference: 'PAY-2026-000308', clientName: 'خديجة عمراني', financingRef: 'CRF-2026-000074', amountDzd: 10350, method: 'baridi_mob', externalRef: 'BM-781002', status: 'verified', submittedAt: '2026-05-15' },
  { reference: 'PAY-2026-000307', clientName: 'أيوب قويدري', financingRef: 'CRF-2026-000089', amountDzd: 19167, method: 'bank_transfer', externalRef: 'VIR-55218', status: 'verified', submittedAt: '2026-05-08' },
  { reference: 'PAY-2026-000306', clientName: 'كريم العماري', financingRef: 'CRF-2026-000066', amountDzd: 13500, method: 'baridi_mob', externalRef: 'BM-770441', status: 'rejected', submittedAt: '2026-05-04' },
  { reference: 'PAY-2026-000305', clientName: 'سمية حساني', financingRef: 'CRF-2026-000081', amountDzd: 11021, method: 'ccp', externalRef: 'CCP-9901223', status: 'verified', submittedAt: '2026-04-29' },
]

/** Daily series for the dashboard charts (last 30 days). */
export function buildDailySeries(): { date: string; financings: number; revenueDzd: number }[] {
  const out: { date: string; financings: number; revenueDzd: number }[] = []
  const today = new Date('2026-05-20')
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const wave = Math.sin(i / 4) + 1.2
    out.push({
      date: d.toISOString().slice(0, 10),
      financings: Math.max(0, Math.round(wave * 1.6 + (i % 3))),
      revenueDzd: Math.round((wave * 26000 + (i % 5) * 7000) / 1000) * 1000,
    })
  }
  return out
}

// ── Merchant payouts (money Crido pays merchants) ─────────────
export type PayoutMethod = 'ccp_transfer' | 'baridi_mob' | 'cash_delivery'
export type PayoutStatus = 'pending' | 'processing' | 'paid'

export type MerchantPayout = {
  reference: string
  merchantName: string
  customerName: string
  financingRef: string
  amountDzd: number
  method: PayoutMethod
  status: PayoutStatus
  createdAt: string
  paidAt: string | null
}

export const merchantPayouts: MerchantPayout[] = [
  { reference: 'PO-2026-000231', merchantName: 'طاهر فون', customerName: 'أيوب قويدري', financingRef: 'CRF-2026-000089', amountDzd: 190000, method: 'ccp_transfer', status: 'pending', createdAt: '2026-05-18', paidAt: null },
  { reference: 'PO-2026-000228', merchantName: 'إلكترو أدرار', customerName: 'نسيمة بكاي', financingRef: 'CRF-2026-000078', amountDzd: 76000, method: 'baridi_mob', status: 'pending', createdAt: '2026-05-16', paidAt: null },
  { reference: 'PO-2026-000224', merchantName: 'أثاث توات', customerName: 'سمية حساني', financingRef: 'CRF-2026-000081', amountDzd: 109250, method: 'cash_delivery', status: 'processing', createdAt: '2026-05-12', paidAt: null },
  { reference: 'PO-2026-000219', merchantName: 'أثاث توات', customerName: 'محمد الأمين تواتي', financingRef: 'CRF-2026-000084', amountDzd: 142500, method: 'ccp_transfer', status: 'paid', createdAt: '2026-04-09', paidAt: '2026-04-10' },
  { reference: 'PO-2026-000211', merchantName: 'أثاث توات', customerName: 'خديجة عمراني', financingRef: 'CRF-2026-000074', amountDzd: 102600, method: 'ccp_transfer', status: 'paid', createdAt: '2026-01-16', paidAt: '2026-01-17' },
  { reference: 'PO-2026-000198', merchantName: 'طاهر فون', customerName: 'كريم العماري', financingRef: 'CRF-2026-000066', amountDzd: 145000, method: 'baridi_mob', status: 'paid', createdAt: '2025-04-21', paidAt: '2025-04-21' },
  { reference: 'PO-2026-000185', merchantName: 'إلكترو أدرار', customerName: 'عبد الرحمن مولاي', financingRef: 'CRF-2026-000059', amountDzd: 131000, method: 'cash_delivery', status: 'paid', createdAt: '2025-12-29', paidAt: '2025-12-30' },
]

// ── Ad-hoc merchant verification queue (admin phone calls) ────
export type VerificationItem = {
  requestRef: string
  proposedMerchantName: string
  proposedMerchantPhone: string
  proposedMerchantAddress: string
  clientName: string
  clientPhone: string
  amountDzd: number
  planMonths: number
  submittedAt: string
}

export const verificationQueue: VerificationItem[] = [
  { requestRef: 'CR-2026-000142', proposedMerchantName: 'محل البركة للإلكترونيك', proposedMerchantPhone: '+213661902255', proposedMerchantAddress: 'حي تيليلان، أدرار', clientName: 'إبراهيم سحنون', clientPhone: '+213770112648', amountDzd: 195000, planMonths: 12, submittedAt: '2026-05-20' },
  { requestRef: 'CR-2026-000140', proposedMerchantName: 'متجر الهاتف أولف', proposedMerchantPhone: '+213551660934', proposedMerchantAddress: 'حي النصر، أولف', clientName: 'يوسف بن عيسى', clientPhone: '+213663401255', amountDzd: 72000, planMonths: 6, submittedAt: '2026-05-19' },
  { requestRef: 'CR-2026-000136', proposedMerchantName: 'محل النور للأجهزة', proposedMerchantPhone: '+213770339187', proposedMerchantAddress: 'حي السلام، رقان', clientName: 'كريم العماري', clientPhone: '+213662918334', amountDzd: 89000, planMonths: 6, submittedAt: '2026-05-12' },
]

// ── Collections — late / defaulted accounts ───────────────────
export type CollectionStatus = 'late' | 'defaulted'
export type CollectionAccount = {
  financingRef: string
  customerName: string
  customerPhone: string
  daysLate: number
  overdueDzd: number
  lateInstallments: number
  status: CollectionStatus
  lastAction: string
  lastActionAt: string
}

export const collectionAccounts: CollectionAccount[] = [
  { financingRef: 'CRF-2026-000059', customerName: 'عبد الرحمن مولاي', customerPhone: '+213551884003', daysLate: 82, overdueDzd: 23000, lateInstallments: 2, status: 'defaulted', lastAction: 'إنذار قانوني', lastActionAt: '2026-04-28' },
  { financingRef: 'CRF-2026-000078', customerName: 'نسيمة بكاي', customerPhone: '+213662550719', daysLate: 8, overdueDzd: 16000, lateInstallments: 1, status: 'late', lastAction: 'مكالمة هاتفية', lastActionAt: '2026-05-15' },
  { financingRef: 'CRF-2026-000081', customerName: 'سمية حساني', customerPhone: '+213779338471', daysLate: 4, overdueDzd: 11021, lateInstallments: 1, status: 'late', lastAction: 'تذكير SMS', lastActionAt: '2026-05-17' },
]

// ── Admin-configurable settings (see docs/BUSINESS_RULES.md §14) ──
export type SettingCategory = 'financing' | 'risk' | 'kyc'
export type SettingUnit = 'days' | 'years' | 'dzd'
export type SettingItem = {
  key: string
  category: SettingCategory
  value: number
  unit: SettingUnit
}

export const settings: SettingItem[] = [
  { key: 'grace_period_days', category: 'financing', value: 3, unit: 'days' },
  { key: 'request_expiry_days', category: 'financing', value: 7, unit: 'days' },
  { key: 'default_first_due_offset_days', category: 'financing', value: 30, unit: 'days' },
  { key: 'max_credit_limit_dzd', category: 'financing', value: 500000, unit: 'dzd' },
  { key: 'default_threshold_days', category: 'risk', value: 90, unit: 'days' },
  { key: 'kyc_validity_days', category: 'kyc', value: 365, unit: 'days' },
  { key: 'min_age_years', category: 'kyc', value: 18, unit: 'years' },
  { key: 'max_age_years', category: 'kyc', value: 65, unit: 'years' },
]
