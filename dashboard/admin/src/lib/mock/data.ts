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
export type PaymentMethod =
  | 'ccp'
  | 'baridi_mob'
  | 'bank_transfer'
  | 'cash_to_agent'
  | 'check'
  | 'company_payment'

export type Client = {
  id: number
  name: string
  phone: string
  /** Algerian national ID number (NIN — 18 digits). Used in KYC + search. */
  nationalId: string
  /** Wilaya (Algerian province). MVP is restricted to Adrar (id 01). */
  wilaya: string
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
  /**
   * Sum of installments owed THIS MONTH across ALL active financings.
   * Drives the debt-ratio check (Crido policy caps it at 30% of monthly income).
   * See docs/BUSINESS_RULES.md.
   */
  currentMonthlyDebtDzd: number
  dateOfBirth: string
  address: string
  createdAt: string
  lastActivityAt: string
}

/** Crido risk policy: monthly debt cannot exceed this share of monthly income.
 *  Above this threshold the application is auto-rejected. */
export const DEBT_RATIO_MAX_PCT = 30

/**
 * Debt-to-income ratio for a client, in percent (0–∞).
 * Returns 0 when income is missing or zero (no signal).
 */
export function debtRatioPct(
  client: Pick<Client, 'monthlyIncomeDzd' | 'currentMonthlyDebtDzd'>,
): number {
  if (!client.monthlyIncomeDzd || client.monthlyIncomeDzd <= 0) return 0
  return (client.currentMonthlyDebtDzd / client.monthlyIncomeDzd) * 100
}

export type Merchant = {
  id: number
  slug: string
  name: string
  nameFr: string | null
  tagline: string | null
  description: string | null
  source: MerchantSource
  status: MerchantStatus
  phone: string
  email: string | null
  website: string | null
  wilaya: string
  commune: string
  address: string
  category: string
  rc: string | null
  nif: string | null
  totalSalesDzd: number
  totalFinancings: number
  monthSalesDzd: number
  pendingPayoutDzd: number
  commissionRate: number
  branchesCount: number
  productsCount: number
  staffCount: number
  joinedAt: string
  lastActivityAt: string
  /** @deprecated use joinedAt — kept for list sorting */
  createdAt: string
}

/** Daily sales per merchant (365 days, seeded by merchant id). */
export function buildMerchantSalesSeries(merchantId: number): { date: string; salesDzd: number }[] {
  const out: { date: string; salesDzd: number }[] = []
  const today = new Date('2026-05-20')
  const seed = merchantId * 1.37
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const wave = Math.sin((i + seed) / 17) + Math.cos((i + seed) / 38) * 0.3 + 1.1
    const scale = 12000 + merchantId * 4500
    out.push({
      date: d.toISOString().slice(0, 10),
      salesDzd: Math.round((wave * scale + (i % 4) * 2000) / 1000) * 1000,
    })
  }
  return out
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
  // Debt-ratio spread is intentional so the table demos every color band:
  //   0–15% green · 15–25% amber · 25–30% red · >30% critical (policy-blocked).
  { id: 1, name: 'أيوب قويدري', phone: '+213551203847', nationalId: '109971030412847', wilaya: 'أدرار', commune: 'أدرار', kycStatus: 'approved', tier: 'B', creditScore: 690, creditLimitDzd: 280000, usedCreditDzd: 230000, activeFinancings: 1, employmentStatus: 'employed', employer: 'الأمن الوطني', monthlyIncomeDzd: 70000, currentMonthlyDebtDzd: 19167, dateOfBirth: '1997-03-12', address: 'حي 20 أوت، أدرار', createdAt: '2026-01-14', lastActivityAt: '2026-05-18' }, // 27.4% — red
  { id: 2, name: 'كريم العماري', phone: '+213662918334', nationalId: '109901070330833', wilaya: 'أدرار', commune: 'رقان', kycStatus: 'approved', tier: 'C', creditScore: 580, creditLimitDzd: 200000, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'self_employed', employer: null, monthlyIncomeDzd: 85000, currentMonthlyDebtDzd: 0, dateOfBirth: '1990-07-30', address: 'حي السلام، رقان', createdAt: '2026-02-02', lastActivityAt: '2026-05-11' }, // 0% — green
  { id: 3, name: 'فاطمة الزهراء بلقاسم', phone: '+213770564219', nationalId: '209951105056421', wilaya: 'أدرار', commune: 'أدرار', kycStatus: 'pending', tier: 'C', creditScore: 530, creditLimitDzd: 0, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'employed', employer: 'مديرية التربية', monthlyIncomeDzd: 62000, currentMonthlyDebtDzd: 0, dateOfBirth: '1995-11-05', address: 'حي بودة، أدرار', createdAt: '2026-05-09', lastActivityAt: '2026-05-19' }, // 0% — green
  { id: 4, name: 'محمد الأمين تواتي', phone: '+213551772900', nationalId: '109881010122900', wilaya: 'أدرار', commune: 'تامست', kycStatus: 'approved', tier: 'A', creditScore: 765, creditLimitDzd: 480000, usedCreditDzd: 150000, activeFinancings: 1, employmentStatus: 'employed', employer: 'سونلغاز', monthlyIncomeDzd: 110000, currentMonthlyDebtDzd: 14375, dateOfBirth: '1988-01-22', address: 'وسط المدينة، تامست', createdAt: '2025-12-20', lastActivityAt: '2026-05-17' }, // 13.1% — green
  { id: 5, name: 'يوسف بن عيسى', phone: '+213663401255', nationalId: '110020909141255', wilaya: 'أدرار', commune: 'أولف', kycStatus: 'pending', tier: 'C', creditScore: 500, creditLimitDzd: 0, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'student', employer: null, monthlyIncomeDzd: null, currentMonthlyDebtDzd: 0, dateOfBirth: '2002-09-14', address: 'حي النصر، أولف', createdAt: '2026-05-15', lastActivityAt: '2026-05-19' }, // no income
  { id: 6, name: 'سمية حساني', phone: '+213779338471', nationalId: '209930606188471', wilaya: 'أدرار', commune: 'أدرار', kycStatus: 'approved', tier: 'B', creditScore: 705, creditLimitDzd: 320000, usedCreditDzd: 92000, activeFinancings: 1, employmentStatus: 'employed', employer: 'البريد الجزائري', monthlyIncomeDzd: 78000, currentMonthlyDebtDzd: 11021, dateOfBirth: '1993-06-18', address: 'حي الوئام، أدرار', createdAt: '2026-01-30', lastActivityAt: '2026-05-16' }, // 14.1% — green
  { id: 7, name: 'عبد الرحمن مولاي', phone: '+213551884003', nationalId: '109990404094003', wilaya: 'أدرار', commune: 'رقان', kycStatus: 'rejected', tier: 'D', creditScore: 470, creditLimitDzd: 0, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'unemployed', employer: null, monthlyIncomeDzd: null, currentMonthlyDebtDzd: 0, dateOfBirth: '1999-04-09', address: 'حي 5 جويلية، رقان', createdAt: '2026-04-22', lastActivityAt: '2026-05-02' }, // no income
  { id: 8, name: 'نسيمة بكاي', phone: '+213662550719', nationalId: '209911201017719', wilaya: 'أدرار', commune: 'تسابيت', kycStatus: 'approved', tier: 'C', creditScore: 615, creditLimitDzd: 240000, usedCreditDzd: 240000, activeFinancings: 2, employmentStatus: 'employed', employer: 'مستشفى أدرار', monthlyIncomeDzd: 68000, currentMonthlyDebtDzd: 22500, dateOfBirth: '1991-12-01', address: 'حي المستقبل، تسابيت', createdAt: '2026-02-18', lastActivityAt: '2026-05-13' }, // 33.1% — CRITICAL (over policy)
  { id: 9, name: 'إبراهيم سحنون', phone: '+213770112648', nationalId: '109860808256648', wilaya: 'أدرار', commune: 'أدرار', kycStatus: 'pending', tier: 'C', creditScore: 545, creditLimitDzd: 0, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'self_employed', employer: null, monthlyIncomeDzd: 95000, currentMonthlyDebtDzd: 0, dateOfBirth: '1986-08-25', address: 'حي تيليلان، أدرار', createdAt: '2026-05-12', lastActivityAt: '2026-05-20' }, // 0% — green
  { id: 10, name: 'خديجة عمراني', phone: '+213551667214', nationalId: '209940202287214', wilaya: 'أدرار', commune: 'بودة', kycStatus: 'approved', tier: 'B', creditScore: 680, creditLimitDzd: 300000, usedCreditDzd: 115000, activeFinancings: 1, employmentStatus: 'employed', employer: 'بلدية بودة', monthlyIncomeDzd: 72000, currentMonthlyDebtDzd: 14400, dateOfBirth: '1994-02-28', address: 'وسط بودة', createdAt: '2026-03-04', lastActivityAt: '2026-05-14' }, // 20.0% — amber
  { id: 11, name: 'الطاهر بن زيان', phone: '+213663920185', nationalId: '110001010170185', wilaya: 'أدرار', commune: 'أدرار', kycStatus: 'not_started', tier: 'C', creditScore: 500, creditLimitDzd: 0, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'other', employer: null, monthlyIncomeDzd: null, currentMonthlyDebtDzd: 0, dateOfBirth: '2000-10-17', address: 'حي القدس، أدرار', createdAt: '2026-05-19', lastActivityAt: '2026-05-19' }, // no income
  { id: 12, name: 'وليد شعباني', phone: '+213779445026', nationalId: '109890505066026', wilaya: 'أدرار', commune: 'تيت', kycStatus: 'approved', tier: 'A', creditScore: 752, creditLimitDzd: 450000, usedCreditDzd: 0, activeFinancings: 0, employmentStatus: 'employed', employer: 'الحماية المدنية', monthlyIncomeDzd: 98000, currentMonthlyDebtDzd: 0, dateOfBirth: '1989-05-06', address: 'حي الشهداء، تيت', createdAt: '2025-11-28', lastActivityAt: '2026-05-10' }, // 0% — green
  // Extra clients to explicitly show the red & critical zones.
  { id: 13, name: 'صالح بلعربي', phone: '+213551302988', nationalId: '109921205112988', wilaya: 'أدرار', commune: 'فنوغيل', kycStatus: 'approved', tier: 'B', creditScore: 660, creditLimitDzd: 260000, usedCreditDzd: 180000, activeFinancings: 1, employmentStatus: 'employed', employer: 'مديرية الأشغال العمومية', monthlyIncomeDzd: 65000, currentMonthlyDebtDzd: 18000, dateOfBirth: '1992-12-15', address: 'حي العقيد، فنوغيل', createdAt: '2026-02-25', lastActivityAt: '2026-05-15' }, // 27.7% — red
  { id: 14, name: 'مريم عمارة', phone: '+213662180994', nationalId: '209960707080994', wilaya: 'أدرار', commune: 'أدرار', kycStatus: 'approved', tier: 'C', creditScore: 600, creditLimitDzd: 180000, usedCreditDzd: 90000, activeFinancings: 1, employmentStatus: 'employed', employer: 'بنك BNA', monthlyIncomeDzd: 60000, currentMonthlyDebtDzd: 19800, dateOfBirth: '1996-07-08', address: 'حي قصر العرب، أدرار', createdAt: '2026-03-16', lastActivityAt: '2026-05-18' }, // 33.0% — CRITICAL
  { id: 15, name: 'عبد المالك جبار', phone: '+213779550612', nationalId: '109850303129612', wilaya: 'أدرار', commune: 'رقان', kycStatus: 'approved', tier: 'A', creditScore: 740, creditLimitDzd: 420000, usedCreditDzd: 85000, activeFinancings: 1, employmentStatus: 'employed', employer: 'سوناطراك', monthlyIncomeDzd: 135000, currentMonthlyDebtDzd: 7100, dateOfBirth: '1985-03-12', address: 'حي 17 أكتوبر، رقان', createdAt: '2025-10-12', lastActivityAt: '2026-05-19' }, // 5.3% — green
]

export const merchants: Merchant[] = [
  {
    id: 1, slug: 'tahar-phones', name: 'طاهر فون', nameFr: 'Tahar Phone',
    tagline: 'هواتف ذكية وإلكترونيات — أدرار',
    description: 'متجر متخصص في الهواتف الذكية والأجهزة الإلكترونية. شريك معتمد لدى Crido.',
    source: 'partner', status: 'active', phone: '+213661234567', email: 'contact@taharphone.dz',
    website: 'taharphone.dz', wilaya: 'أدرار', commune: 'أدرار',
    address: 'شارع الإمام مالك، حي 20 أوت، أدرار', category: 'إلكترونيات',
    rc: '11/00-1248763 B 25', nif: '002011124876355',
    totalSalesDzd: 4350000, totalFinancings: 23, monthSalesDzd: 575000, pendingPayoutDzd: 190000,
    commissionRate: 5, branchesCount: 2, productsCount: 48, staffCount: 4,
    joinedAt: '2025-12-10', lastActivityAt: '2026-05-19', createdAt: '2025-12-10',
  },
  {
    id: 2, slug: 'electro-adrar', name: 'إلكترو أدرار', nameFr: 'Electro Adrar',
    tagline: 'أجهزة كهرومنزلية وتلفزيونات',
    description: 'بيع التلفزيونات والثلاجات والأجهزة المنزلية بالتقسيط عبر Crido.',
    source: 'partner', status: 'active', phone: '+213551098220', email: 'info@electro-adrar.dz',
    website: null, wilaya: 'أدرار', commune: 'أدرار',
    address: 'حي السلام، أدرار', category: 'أجهزة منزلية',
    rc: '11/00-9821044 B 25', nif: '002011982104422',
    totalSalesDzd: 2980000, totalFinancings: 16, monthSalesDzd: 412000, pendingPayoutDzd: 76000,
    commissionRate: 5, branchesCount: 1, productsCount: 32, staffCount: 3,
    joinedAt: '2026-01-08', lastActivityAt: '2026-05-17', createdAt: '2026-01-08',
  },
  {
    id: 3, slug: 'meuble-touat', name: 'أثاث توات', nameFr: 'Meuble Touat',
    tagline: 'أثاث وديكور المنزل',
    description: 'معرض أثاث في وسط أدرار — غرف نوم، صالونات، مطابخ.',
    source: 'partner', status: 'active', phone: '+213662771403', email: null,
    website: null, wilaya: 'أدرار', commune: 'أدرار',
    address: 'شارع بريد العام، أدرار', category: 'أثاث',
    rc: '11/00-7712041 B 25', nif: null,
    totalSalesDzd: 1640000, totalFinancings: 9, monthSalesDzd: 218000, pendingPayoutDzd: 109250,
    commissionRate: 6, branchesCount: 1, productsCount: 24, staffCount: 2,
    joinedAt: '2026-02-14', lastActivityAt: '2026-05-16', createdAt: '2026-02-14',
  },
  {
    id: 4, slug: 'maison-reggane', name: 'محل النور للأجهزة', nameFr: null,
    tagline: null,
    description: 'تاجر مؤقت — تم التحقق منه عبر مكالمة Crido بعد طلب عميل.',
    source: 'ad_hoc', status: 'active', phone: '+213770339187', email: null,
    website: null, wilaya: 'أدرار', commune: 'رقان',
    address: 'حي السلام، رقان', category: 'إلكترونيات',
    rc: null, nif: null,
    totalSalesDzd: 520000, totalFinancings: 3, monthSalesDzd: 89000, pendingPayoutDzd: 0,
    commissionRate: 5, branchesCount: 1, productsCount: 0, staffCount: 0,
    joinedAt: '2026-03-22', lastActivityAt: '2026-05-12', createdAt: '2026-03-22',
  },
  {
    id: 5, slug: 'phone-store-aoulef', name: 'متجر الهاتف أولف', nameFr: null,
    tagline: null,
    description: 'تاجر مؤقت قيد المراجعة — لم يُفعَّل بعد في النظام.',
    source: 'ad_hoc', status: 'pending', phone: '+213551660934', email: null,
    website: null, wilaya: 'أدرار', commune: 'أولف',
    address: 'حي النصر، أولف', category: 'إلكترونيات',
    rc: null, nif: null,
    totalSalesDzd: 0, totalFinancings: 0, monthSalesDzd: 0, pendingPayoutDzd: 0,
    commissionRate: 5, branchesCount: 0, productsCount: 0, staffCount: 0,
    joinedAt: '2026-05-18', lastActivityAt: '2026-05-18', createdAt: '2026-05-18',
  },
  {
    id: 6, slug: 'tamest-electro', name: 'تامست إلكترونيك', nameFr: 'Tamest Electro',
    tagline: 'إلكترونيات — تامست',
    description: 'شريك موقوف مؤقتاً بسبب تأخر في تسليم مستندات KYB.',
    source: 'partner', status: 'suspended', phone: '+213663008255', email: 'tamest@mail.dz',
    website: null, wilaya: 'أدرار', commune: 'تامست',
    address: 'وسط المدينة، تامست', category: 'إلكترونيات',
    rc: '11/00-6602188 B 25', nif: '002011660218877',
    totalSalesDzd: 780000, totalFinancings: 4, monthSalesDzd: 0, pendingPayoutDzd: 0,
    commissionRate: 5, branchesCount: 1, productsCount: 12, staffCount: 1,
    joinedAt: '2026-01-25', lastActivityAt: '2026-04-02', createdAt: '2026-01-25',
  },
]

export const financingRequests: FinancingRequest[] = [
  { reference: 'CR-2026-000142', clientId: 9, clientName: 'إبراهيم سحنون', clientTier: 'C', merchantName: 'محل البركة (مقترح)', merchantSource: 'ad_hoc', productName: 'iPhone 15', amountDzd: 195000, planMonths: 12, status: 'submitted', createdAt: '2026-05-20' },
  { reference: 'CR-2026-000141', clientId: 3, clientName: 'فاطمة الزهراء بلقاسم', clientTier: 'C', merchantName: 'إلكترو أدرار', merchantSource: 'partner', productName: 'ثلاجة LG 420 لتر', amountDzd: 138000, planMonths: 6, status: 'under_review', createdAt: '2026-05-19' },
  { reference: 'CR-2026-000140', clientId: 5, clientName: 'يوسف بن عيسى', clientTier: 'C', merchantName: 'متجر الهاتف أولف (مقترح)', merchantSource: 'ad_hoc', productName: 'Samsung Galaxy A55', amountDzd: 72000, planMonths: 6, status: 'submitted', createdAt: '2026-05-19' },
  { reference: 'CR-2026-000139', clientId: 1, clientName: 'أيوب قويدري', clientTier: 'B', merchantName: 'طاهر فون', merchantSource: 'partner', productName: 'iPhone 16', amountDzd: 200000, planMonths: 12, status: 'contracts_generated', createdAt: '2026-05-16' },
  { reference: 'CR-2026-000138', clientId: 11, clientName: 'الطاهر بن زيان', clientTier: 'C', merchantName: 'طاهر فون', merchantSource: 'partner', productName: 'حاسوب محمول HP', amountDzd: 124000, planMonths: 12, status: 'documents_required', createdAt: '2026-05-15' },
  { reference: 'CR-2026-000137', clientId: 6, clientName: 'سمية حساني', clientTier: 'B', merchantName: 'أثاث توات', merchantSource: 'partner', productName: 'طقم صالون', amountDzd: 165000, planMonths: 12, status: 'merchant_confirmed', createdAt: '2026-05-14' },
  { reference: 'CR-2026-000136', clientId: 2, clientName: 'كريم العماري', clientTier: 'C', merchantName: 'محل النور للأجهزة', merchantSource: 'ad_hoc', productName: 'حاسوب محمول HP', amountDzd: 124000, planMonths: 12, status: 'contracts_signed', createdAt: '2026-05-12' },
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
  { reference: 'PAY-2026-000316', clientName: 'محمد الأمين تواتي', financingRef: 'CRF-2026-000084', amountDzd: 14375, method: 'company_payment', externalRef: 'SLZ-EMP-44021', status: 'pending_verification', submittedAt: '2026-05-26' },
  { reference: 'PAY-2026-000315', clientName: 'سمية حساني', financingRef: 'CRF-2026-000081', amountDzd: 11021, method: 'check', externalRef: 'CHQ-2208741', status: 'pending_verification', submittedAt: '2026-05-25' },
  { reference: 'PAY-2026-000314', clientName: 'خديجة عمراني', financingRef: 'CRF-2026-000074', amountDzd: 10350, method: 'company_payment', externalRef: 'COMM-BOUDA-7712', status: 'verified', submittedAt: '2026-05-23' },
  { reference: 'PAY-2026-000313', clientName: 'أيوب قويدري', financingRef: 'CRF-2026-000089', amountDzd: 19167, method: 'check', externalRef: 'CHQ-2208619', status: 'verified', submittedAt: '2026-05-21' },
  { reference: 'PAY-2026-000312', clientName: 'أيوب قويدري', financingRef: 'CRF-2026-000089', amountDzd: 19167, method: 'baridi_mob', externalRef: 'BM-784213', status: 'pending_verification', submittedAt: '2026-05-20' },
  { reference: 'PAY-2026-000311', clientName: 'سمية حساني', financingRef: 'CRF-2026-000081', amountDzd: 11021, method: 'ccp', externalRef: 'CCP-9920134', status: 'pending_verification', submittedAt: '2026-05-19' },
  { reference: 'PAY-2026-000310', clientName: 'نسيمة بكاي', financingRef: 'CRF-2026-000078', amountDzd: 16000, method: 'cash_to_agent', externalRef: '—', status: 'pending_verification', submittedAt: '2026-05-19' },
  { reference: 'PAY-2026-000309', clientName: 'محمد الأمين تواتي', financingRef: 'CRF-2026-000084', amountDzd: 14375, method: 'ccp', externalRef: 'CCP-9918880', status: 'verified', submittedAt: '2026-05-18' },
  { reference: 'PAY-2026-000308', clientName: 'خديجة عمراني', financingRef: 'CRF-2026-000074', amountDzd: 10350, method: 'baridi_mob', externalRef: 'BM-781002', status: 'verified', submittedAt: '2026-05-15' },
  { reference: 'PAY-2026-000307', clientName: 'أيوب قويدري', financingRef: 'CRF-2026-000089', amountDzd: 19167, method: 'bank_transfer', externalRef: 'VIR-55218', status: 'verified', submittedAt: '2026-05-08' },
  { reference: 'PAY-2026-000306', clientName: 'كريم العماري', financingRef: 'CRF-2026-000066', amountDzd: 13500, method: 'baridi_mob', externalRef: 'BM-770441', status: 'rejected', submittedAt: '2026-05-04' },
  { reference: 'PAY-2026-000305', clientName: 'سمية حساني', financingRef: 'CRF-2026-000081', amountDzd: 11021, method: 'ccp', externalRef: 'CCP-9901223', status: 'verified', submittedAt: '2026-04-29' },
]

/** Daily series for dashboard charts (365 days — filtered in UI by period). */
export function buildDailySeries(): { date: string; financings: number; revenueDzd: number }[] {
  const out: { date: string; financings: number; revenueDzd: number }[] = []
  const today = new Date('2026-05-20')
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const wave = Math.sin(i / 18) + Math.cos(i / 42) * 0.35 + 1.15
    const seasonal = 1 + Math.sin((i / 365) * Math.PI * 2) * 0.12
    out.push({
      date: d.toISOString().slice(0, 10),
      financings: Math.max(0, Math.round(wave * 1.6 * seasonal + (i % 3))),
      revenueDzd: Math.round((wave * 26000 * seasonal + (i % 5) * 7000) / 1000) * 1000,
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
  productName: string
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
  { requestRef: 'CR-2026-000142', productName: 'iPhone 15', proposedMerchantName: 'محل البركة للإلكترونيك', proposedMerchantPhone: '+213661902255', proposedMerchantAddress: 'حي تيليلان، أدرار', clientName: 'إبراهيم سحنون', clientPhone: '+213770112648', amountDzd: 195000, planMonths: 12, submittedAt: '2026-05-20' },
  { requestRef: 'CR-2026-000140', productName: 'Samsung Galaxy A55', proposedMerchantName: 'متجر الهاتف أولف', proposedMerchantPhone: '+213551660934', proposedMerchantAddress: 'حي النصر، أولف', clientName: 'يوسف بن عيسى', clientPhone: '+213663401255', amountDzd: 72000, planMonths: 6, submittedAt: '2026-05-19' },
  { requestRef: 'CR-2026-000136', productName: 'حاسوب محمول HP', proposedMerchantName: 'محل النور للأجهزة', proposedMerchantPhone: '+213770339187', proposedMerchantAddress: 'حي السلام، رقان', clientName: 'كريم العماري', clientPhone: '+213662918334', amountDzd: 124000, planMonths: 12, submittedAt: '2026-05-12' },
]

// ── Merchant verification call log (admin call history) ──────
export type VerificationOutcome = 'confirmed' | 'denied' | 'unreachable' | 'postponed'
export type MerchantVerification = {
  id: string
  number: string
  request_id: string
  merchant_phone: string
  called_at: string
  outcome: VerificationOutcome
  notes: string
  caller_name: string
}

export const merchantVerifications: MerchantVerification[] = [
  { id: 'mv-030', number: 'V-2026-000030', request_id: 'CR-2026-000142', merchant_phone: '+213661902255', called_at: '2026-05-27T09:42:00Z', outcome: 'confirmed', notes: 'التاجر أكد توفر الجهاز iPhone 15 بنفس السعر — جاهز للتسليم خلال 48 ساعة.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-029', number: 'V-2026-000029', request_id: 'CR-2026-000140', merchant_phone: '+213551660934', called_at: '2026-05-27T09:05:00Z', outcome: 'unreachable', notes: 'الهاتف مغلق منذ الصباح — سنعيد المحاولة بعد الظهر.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-028', number: 'V-2026-000028', request_id: 'CR-2026-000139', merchant_phone: '+213661234567', called_at: '2026-05-26T16:18:00Z', outcome: 'confirmed', notes: 'شريك معتمد — تأكيد المنتج والسعر مباشرة من المسؤول.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-027', number: 'V-2026-000027', request_id: 'CR-2026-000138', merchant_phone: '+213661234567', called_at: '2026-05-26T14:30:00Z', outcome: 'postponed', notes: 'طلب التاجر معاودة الاتصال غداً صباحاً للتحقق من المخزون.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-026', number: 'V-2026-000026', request_id: 'CR-2026-000137', merchant_phone: '+213662771403', called_at: '2026-05-26T11:55:00Z', outcome: 'confirmed', notes: 'طقم الصالون متوفر في المعرض — السعر مطابق.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-025', number: 'V-2026-000025', request_id: 'CR-2026-000136', merchant_phone: '+213770339187', called_at: '2026-05-25T15:22:00Z', outcome: 'confirmed', notes: 'تم التحقق من العنوان والاسم التجاري — الجهاز جاهز.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-024', number: 'V-2026-000024', request_id: 'CR-2026-000135', merchant_phone: '+213551098220', called_at: '2026-05-25T10:14:00Z', outcome: 'confirmed', notes: 'إلكترو أدرار — تأكيد الموديل والمواصفات.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-023', number: 'V-2026-000023', request_id: 'CR-2026-000134', merchant_phone: '+213661234567', called_at: '2026-05-24T17:01:00Z', outcome: 'denied', notes: 'التاجر رفض الصفقة بسبب نقص في المخزون — تم تحويل الطلب لإلغاء.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-022', number: 'V-2026-000022', request_id: 'CR-2026-000133', merchant_phone: '+213663008255', called_at: '2026-05-24T13:48:00Z', outcome: 'unreachable', notes: 'لم يرد بعد 3 محاولات — تامست إلكترونيك (حالة موقوفة).', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-021', number: 'V-2026-000021', request_id: 'CR-2026-000132', merchant_phone: '+213662771403', called_at: '2026-05-23T16:30:00Z', outcome: 'confirmed', notes: 'غرفة النوم الكاملة متوفرة — موعد التسليم محدد.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-020', number: 'V-2026-000020', request_id: 'CR-2026-000131', merchant_phone: '+213551098220', called_at: '2026-05-23T11:20:00Z', outcome: 'postponed', notes: 'العميل لم يحضر للموقع — تمت إعادة الموعد بعد 3 أيام.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-019', number: 'V-2026-000019', request_id: 'CR-2026-000130', merchant_phone: '+213770445819', called_at: '2026-05-22T15:05:00Z', outcome: 'confirmed', notes: 'متجر ذكي إلكترونيكس — تأكيد الجهاز والسعر.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-018', number: 'V-2026-000018', request_id: 'CR-2026-000129', merchant_phone: '+213661234567', called_at: '2026-05-22T10:42:00Z', outcome: 'confirmed', notes: 'طاهر فون — شريك معتمد، لا حاجة لمراجعة مفصلة.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-017', number: 'V-2026-000017', request_id: 'CR-2026-000128', merchant_phone: '+213662918007', called_at: '2026-05-21T17:18:00Z', outcome: 'denied', notes: 'العنوان غير صحيح — التاجر غير مسجل في الولاية.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-016', number: 'V-2026-000016', request_id: 'CR-2026-000127', merchant_phone: '+213551098220', called_at: '2026-05-21T13:55:00Z', outcome: 'confirmed', notes: 'الثلاجة موديل LG 420L متوفرة — السعر مع التركيب.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-015', number: 'V-2026-000015', request_id: 'CR-2026-000126', merchant_phone: '+213779001234', called_at: '2026-05-20T16:40:00Z', outcome: 'unreachable', notes: 'الرقم خارج التغطية — يلزم متابعة لاحقاً.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-014', number: 'V-2026-000014', request_id: 'CR-2026-000125', merchant_phone: '+213662771403', called_at: '2026-05-20T12:15:00Z', outcome: 'confirmed', notes: 'أثاث توات — مكتب مكتبي مع كرسي مدير، السعر مؤكد.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-013', number: 'V-2026-000013', request_id: 'CR-2026-000124', merchant_phone: '+213661234567', called_at: '2026-05-19T15:30:00Z', outcome: 'confirmed', notes: 'طاهر فون — Samsung Galaxy S24 جاهز للتسليم.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-012', number: 'V-2026-000012', request_id: 'CR-2026-000123', merchant_phone: '+213551098220', called_at: '2026-05-19T11:08:00Z', outcome: 'postponed', notes: 'التاجر مشغول في جرد — طلب المعاودة غداً.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-011', number: 'V-2026-000011', request_id: 'CR-2026-000122', merchant_phone: '+213662771403', called_at: '2026-05-18T16:45:00Z', outcome: 'confirmed', notes: 'طقم مطبخ مع تركيب — تأكيد التسليم خلال أسبوع.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-010', number: 'V-2026-000010', request_id: 'CR-2026-000121', merchant_phone: '+213770339187', called_at: '2026-05-18T13:22:00Z', outcome: 'confirmed', notes: 'محل النور — تاجر مؤقت تم التحقق منه بنجاح.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-009', number: 'V-2026-000009', request_id: 'CR-2026-000120', merchant_phone: '+213551772211', called_at: '2026-05-17T17:00:00Z', outcome: 'denied', notes: 'الاسم التجاري لا يطابق ما قدمه العميل — مشكوك فيه.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-008', number: 'V-2026-000008', request_id: 'CR-2026-000119', merchant_phone: '+213661234567', called_at: '2026-05-17T10:55:00Z', outcome: 'confirmed', notes: 'iPhone 14 Pro Max جاهز — مع ضمان رسمي سنة كاملة.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-007', number: 'V-2026-000007', request_id: 'CR-2026-000118', merchant_phone: '+213551098220', called_at: '2026-05-16T15:12:00Z', outcome: 'unreachable', notes: '4 محاولات بدون إجابة — البحث عن رقم ثانٍ.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-006', number: 'V-2026-000006', request_id: 'CR-2026-000117', merchant_phone: '+213779338800', called_at: '2026-05-16T11:30:00Z', outcome: 'confirmed', notes: 'تاجر مؤقت — العنوان والهوية متطابقان، تم التأكيد.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-005', number: 'V-2026-000005', request_id: 'CR-2026-000116', merchant_phone: '+213661234567', called_at: '2026-05-15T16:08:00Z', outcome: 'confirmed', notes: 'طاهر فون — حاسوب HP Pavilion 15، السعر مع الحقيبة.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-004', number: 'V-2026-000004', request_id: 'CR-2026-000115', merchant_phone: '+213662771403', called_at: '2026-05-15T10:25:00Z', outcome: 'postponed', notes: 'يحتاج فاتورة شكلية — سنرسلها بالإيميل ونعاود.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-003', number: 'V-2026-000003', request_id: 'CR-2026-000114', merchant_phone: '+213551098220', called_at: '2026-05-14T14:40:00Z', outcome: 'confirmed', notes: 'تلفاز Samsung 65" QLED — جاهز مع التركيب.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-002', number: 'V-2026-000002', request_id: 'CR-2026-000113', merchant_phone: '+213663008255', called_at: '2026-05-14T09:18:00Z', outcome: 'denied', notes: 'تامست إلكترونيك — حساب موقوف، رفض إتمام الصفقة.', caller_name: 'أيوب بن دردوش' },
  { id: 'mv-001', number: 'V-2026-000001', request_id: 'CR-2026-000112', merchant_phone: '+213661234567', called_at: '2026-05-13T11:50:00Z', outcome: 'confirmed', notes: 'أول مكالمة تحقق مسجلة في النظام — طاهر فون.', caller_name: 'أيوب بن دردوش' },
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

// ── Notifications (admin inbox) ───────────────────────────────
export type NotificationType =
  | 'financing_approved'
  | 'payment_verified'
  | 'kyc_pending'
  | 'merchant_request'
  | 'message_received'
  | 'system'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  body: string
  unread: boolean
  created_at: string
  link?: string
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  // ── Today (relative to TODAY = 2026-05-27) ──
  {
    id: 'ntf-001',
    type: 'financing_approved',
    title: 'تمويل جديد بانتظار الموافقة',
    body: 'الطلب CRF-2026-000145 من إبراهيم سحنون بمبلغ 200,000 دج — خطة 12 شهر.',
    unread: true,
    created_at: '2026-05-27T09:14:00Z',
    link: '/financing-requests/CR-2026-000142',
  },
  {
    id: 'ntf-002',
    type: 'payment_verified',
    title: 'دفعة جديدة بحاجة للتحقق',
    body: 'PAY-2026-000312 من أيوب قويدري بمبلغ 19,167 دج عبر Baridi Mob.',
    unread: true,
    created_at: '2026-05-27T08:42:00Z',
    link: '/payments/PAY-2026-000312',
  },
  {
    id: 'ntf-003',
    type: 'merchant_request',
    title: 'تاجر جديد طلب التحقق',
    body: 'متجر إلكترونيات أدرار — هاتف +213661902255، حي تيليلان، أدرار.',
    unread: true,
    created_at: '2026-05-27T07:55:00Z',
    link: '/merchant-verifications',
  },
  {
    id: 'ntf-004',
    type: 'kyc_pending',
    title: 'كي واي سي جديد قيد المراجعة',
    body: 'فاطمة الزهراء بلقاسم — حي بودة، أدرار. الوثائق مرفوعة وتنتظر المراجعة.',
    unread: true,
    created_at: '2026-05-27T07:18:00Z',
    link: '/clients/3',
  },
  {
    id: 'ntf-005',
    type: 'message_received',
    title: 'رسالة جديدة من تاجر',
    body: 'طاهر فون: استفسار حول دفعة CRF-2026-000089 — هل تم التحويل؟',
    unread: true,
    created_at: '2026-05-27T06:30:00Z',
    link: '/merchants/1',
  },

  // ── Yesterday ──
  {
    id: 'ntf-006',
    type: 'payment_verified',
    title: 'دفعة جديدة بحاجة للتحقق',
    body: 'PAY-2026-000311 من سمية حساني بمبلغ 11,021 دج عبر CCP.',
    unread: false,
    created_at: '2026-05-26T17:42:00Z',
    link: '/payments/PAY-2026-000311',
  },
  {
    id: 'ntf-007',
    type: 'financing_approved',
    title: 'عقد موقّع جاهز للتحقق',
    body: 'الطلب CR-2026-000139 من أيوب قويدري — العقود الموقّعة جاهزة للمراجعة النهائية.',
    unread: false,
    created_at: '2026-05-26T15:08:00Z',
    link: '/financing-requests/CR-2026-000139',
  },
  {
    id: 'ntf-008',
    type: 'kyc_pending',
    title: 'كي واي سي جديد قيد المراجعة',
    body: 'يوسف بن عيسى — حي النصر، أولف. الوثائق مرفوعة وتنتظر المراجعة.',
    unread: false,
    created_at: '2026-05-26T11:22:00Z',
    link: '/clients/5',
  },
  {
    id: 'ntf-009',
    type: 'merchant_request',
    title: 'تاجر جديد طلب التحقق',
    body: 'محل البركة للإلكترونيك — هاتف +213661902255، حي تيليلان، أدرار.',
    unread: true,
    created_at: '2026-05-26T09:50:00Z',
    link: '/merchant-verifications',
  },
  {
    id: 'ntf-010',
    type: 'system',
    title: 'تذكير: تأخر في تسديد قسط',
    body: 'CRF-2026-000078 من نسيمة بكاي متأخر بـ 8 أيام بقيمة 16,000 دج.',
    unread: false,
    created_at: '2026-05-26T08:00:00Z',
    link: '/collections',
  },

  // ── Last week ──
  {
    id: 'ntf-011',
    type: 'payment_verified',
    title: 'تم التحقق من دفعة',
    body: 'PAY-2026-000309 من محمد الأمين تواتي بمبلغ 14,375 دج تم تأكيدها.',
    unread: false,
    created_at: '2026-05-22T14:18:00Z',
    link: '/payments/PAY-2026-000309',
  },
  {
    id: 'ntf-012',
    type: 'message_received',
    title: 'رسالة جديدة من تاجر',
    body: 'إلكترو أدرار: طلب تحديث رقم CCP الخاص بالتاجر.',
    unread: false,
    created_at: '2026-05-21T10:05:00Z',
    link: '/merchants/2',
  },
  {
    id: 'ntf-013',
    type: 'financing_approved',
    title: 'تمويل جديد تم تفعيله',
    body: 'CRF-2026-000089 من أيوب قويدري — تم تحويل 190,000 دج لطاهر فون.',
    unread: false,
    created_at: '2026-05-20T16:30:00Z',
    link: '/financings/CRF-2026-000089',
  },
  {
    id: 'ntf-014',
    type: 'kyc_pending',
    title: 'كي واي سي تم رفضه',
    body: 'عبد الرحمن مولاي — الوثائق غير واضحة، يلزم إعادة الرفع.',
    unread: false,
    created_at: '2026-05-20T11:45:00Z',
    link: '/clients/7',
  },
  {
    id: 'ntf-015',
    type: 'system',
    title: 'تحديث على معدل العمولة',
    body: 'تم تعديل عمولة التجار من 4% إلى 5% — ساري المفعول من اليوم.',
    unread: false,
    created_at: '2026-05-19T09:00:00Z',
    link: '/settings',
  },

  // ── Older ──
  {
    id: 'ntf-016',
    type: 'merchant_request',
    title: 'تاجر جديد طلب التحقق',
    body: 'متجر الهاتف أولف — هاتف +213551660934، حي النصر، أولف.',
    unread: false,
    created_at: '2026-05-15T13:12:00Z',
    link: '/merchant-verifications',
  },
  {
    id: 'ntf-017',
    type: 'payment_verified',
    title: 'تم رفض دفعة',
    body: 'PAY-2026-000306 من كريم العماري — لا تطابق إثبات الدفع.',
    unread: false,
    created_at: '2026-05-13T17:40:00Z',
    link: '/payments/PAY-2026-000306',
  },
  {
    id: 'ntf-018',
    type: 'system',
    title: 'تقرير شهري جاهز',
    body: 'تقرير شهر أفريل 2026 جاهز للتنزيل — 4.2M دج إيرادات، 47 تمويلاً نشطاً.',
    unread: false,
    created_at: '2026-05-10T08:00:00Z',
    link: '/reports',
  },
]

// ── Inbox / Messages ──────────────────────────────────────────
// Conversations the admin holds with merchants and customers from
// inside the support inbox. Names are taken from existing clients /
// merchants so links can resolve later when wired to real APIs.

export type ConversationType = 'merchant' | 'customer'

export type Conversation = {
  id: string
  type: ConversationType
  name: string
  phone: string
  avatar?: string
  last_message: string
  last_message_at: string // ISO date-time
  unread_count: number
}

export type Message = {
  id: string
  conversation_id: string
  sender: 'them' | 'us'
  body: string
  sent_at: string // ISO date-time
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    type: 'customer',
    name: 'أيوب قويدري',
    phone: '+213551203847',
    last_message: 'شكرا، توصل دفعة الشهر القادم في الموعد إن شاء الله.',
    last_message_at: '2026-05-27T09:42:00',
    unread_count: 0,
  },
  {
    id: 'conv-002',
    type: 'merchant',
    name: 'طاهر فون',
    phone: '+213661234567',
    last_message: 'هل يمكنكم تأكيد طلب CR-2026-000139؟ الزبون ينتظر التسليم.',
    last_message_at: '2026-05-27T09:18:00',
    unread_count: 3,
  },
  {
    id: 'conv-003',
    type: 'customer',
    name: 'فاطمة الزهراء بلقاسم',
    phone: '+213770564219',
    last_message: 'السلام عليكم، عندي مشكلة في الدفع هذا الشهر، هل يمكن تأجيله؟',
    last_message_at: '2026-05-27T08:55:00',
    unread_count: 2,
  },
  {
    id: 'conv-004',
    type: 'merchant',
    name: 'إلكترو أدرار',
    phone: '+213551098220',
    last_message: 'زبون يطلب تقسيط 12 شهر، السعر 450,000 دج، يمكن نتقدّم؟',
    last_message_at: '2026-05-26T17:24:00',
    unread_count: 1,
  },
  {
    id: 'conv-005',
    type: 'customer',
    name: 'سمية حساني',
    phone: '+213779338471',
    last_message: 'تم إرسال إثبات الدفع عبر بريدي موب، الرجاء التأكيد.',
    last_message_at: '2026-05-26T14:11:00',
    unread_count: 0,
  },
  {
    id: 'conv-006',
    type: 'merchant',
    name: 'أثاث توات',
    phone: '+213662771403',
    last_message: 'متى ستصل الدفعة الأخيرة للحساب البريدي؟ نشكركم.',
    last_message_at: '2026-05-26T11:30:00',
    unread_count: 0,
  },
  {
    id: 'conv-007',
    type: 'customer',
    name: 'محمد الأمين تواتي',
    phone: '+213551772900',
    last_message: 'هل أستطيع رفع سقف التمويل؟ راني صاحب راتب ثابت.',
    last_message_at: '2026-05-25T19:48:00',
    unread_count: 0,
  },
  {
    id: 'conv-008',
    type: 'merchant',
    name: 'محل النور للأجهزة',
    phone: '+213770339187',
    last_message: 'مرحبا، صبحكم الله بالخير. عندي زبون جديد يحب يقسط هاتف.',
    last_message_at: '2026-05-25T08:05:00',
    unread_count: 1,
  },
  {
    id: 'conv-009',
    type: 'customer',
    name: 'نسيمة بكاي',
    phone: '+213662550719',
    last_message: 'شكرا على المهلة، نسدّد الدفعة اليوم بإذن الله.',
    last_message_at: '2026-05-24T13:22:00',
    unread_count: 0,
  },
  {
    id: 'conv-010',
    type: 'merchant',
    name: 'تامست إلكترونيك',
    phone: '+213663008255',
    last_message: 'متى يتم رفع الإيقاف عن حسابنا؟ المستندات أرسلناها قبل أسبوع.',
    last_message_at: '2026-05-23T16:09:00',
    unread_count: 0,
  },
]

export const MOCK_MESSAGES: Message[] = [
  // ── conv-001 : أيوب قويدري (customer) ──
  { id: 'msg-001-1', conversation_id: 'conv-001', sender: 'them', body: 'السلام عليكم، أنا أيوب قويدري، عميل عندكم.', sent_at: '2026-05-27T09:30:00' },
  { id: 'msg-001-2', conversation_id: 'conv-001', sender: 'them', body: 'بغيت نسأل على الدفعة القادمة، الموعد كاين في 8 جوان؟', sent_at: '2026-05-27T09:31:00' },
  { id: 'msg-001-3', conversation_id: 'conv-001', sender: 'us', body: 'وعليكم السلام أخي أيوب. نعم، الدفعة القادمة موعدها 8 جوان 2026، المبلغ 19,167 دج.', sent_at: '2026-05-27T09:35:00' },
  { id: 'msg-001-4', conversation_id: 'conv-001', sender: 'us', body: 'يمكنك الدفع عن طريق Baridi Mob، CCP، أو تحويل بنكي.', sent_at: '2026-05-27T09:35:30' },
  { id: 'msg-001-5', conversation_id: 'conv-001', sender: 'them', body: 'شكرا، توصل دفعة الشهر القادم في الموعد إن شاء الله.', sent_at: '2026-05-27T09:42:00' },

  // ── conv-002 : طاهر فون (merchant) ──
  { id: 'msg-002-1', conversation_id: 'conv-002', sender: 'them', body: 'صباح الخير، معكم طاهر من طاهر فون.', sent_at: '2026-05-27T09:00:00' },
  { id: 'msg-002-2', conversation_id: 'conv-002', sender: 'them', body: 'هل يمكنكم تأكيد طلب CR-2026-000139؟', sent_at: '2026-05-27T09:01:00' },
  { id: 'msg-002-3', conversation_id: 'conv-002', sender: 'them', body: 'الزبون ينتظر التسليم.', sent_at: '2026-05-27T09:18:00' },

  // ── conv-003 : فاطمة الزهراء بلقاسم (customer) ──
  { id: 'msg-003-1', conversation_id: 'conv-003', sender: 'them', body: 'السلام عليكم، عندي مشكلة في الدفع هذا الشهر', sent_at: '2026-05-27T08:50:00' },
  { id: 'msg-003-2', conversation_id: 'conv-003', sender: 'them', body: 'هل يمكن تأجيله أسبوع؟ راني نستنى الراتب يوم 5.', sent_at: '2026-05-27T08:55:00' },

  // ── conv-004 : إلكترو أدرار (merchant) ──
  { id: 'msg-004-1', conversation_id: 'conv-004', sender: 'them', body: 'مساء الخير فريق Crido.', sent_at: '2026-05-26T17:20:00' },
  { id: 'msg-004-2', conversation_id: 'conv-004', sender: 'them', body: 'زبون يطلب تقسيط 12 شهر، السعر 450,000 دج، يمكن نتقدّم؟', sent_at: '2026-05-26T17:24:00' },

  // ── conv-005 : سمية حساني (customer) ──
  { id: 'msg-005-1', conversation_id: 'conv-005', sender: 'them', body: 'تم إرسال إثبات الدفع عبر بريدي موب، الرجاء التأكيد.', sent_at: '2026-05-26T14:05:00' },
  { id: 'msg-005-2', conversation_id: 'conv-005', sender: 'us', body: 'وصلنا الإثبات، شكرا لك. سنقوم بالتحقق خلال ساعات.', sent_at: '2026-05-26T14:08:00' },
  { id: 'msg-005-3', conversation_id: 'conv-005', sender: 'them', body: 'بارك الله فيكم.', sent_at: '2026-05-26T14:11:00' },

  // ── conv-006 : أثاث توات (merchant) ──
  { id: 'msg-006-1', conversation_id: 'conv-006', sender: 'them', body: 'السلام عليكم، عندنا فاتورة معلقة من أسبوع.', sent_at: '2026-05-26T11:20:00' },
  { id: 'msg-006-2', conversation_id: 'conv-006', sender: 'us', body: 'وعليكم السلام، الدفعة في طور المعالجة وستصل خلال 48 ساعة.', sent_at: '2026-05-26T11:25:00' },
  { id: 'msg-006-3', conversation_id: 'conv-006', sender: 'them', body: 'متى ستصل الدفعة الأخيرة للحساب البريدي؟ نشكركم.', sent_at: '2026-05-26T11:30:00' },

  // ── conv-007 : محمد الأمين تواتي (customer) ──
  { id: 'msg-007-1', conversation_id: 'conv-007', sender: 'them', body: 'السلام عليكم، أنا محمد الأمين تواتي، سقفي حالياً 480,000.', sent_at: '2026-05-25T19:40:00' },
  { id: 'msg-007-2', conversation_id: 'conv-007', sender: 'them', body: 'هل أستطيع رفع سقف التمويل؟ راني صاحب راتب ثابت.', sent_at: '2026-05-25T19:48:00' },
  { id: 'msg-007-3', conversation_id: 'conv-007', sender: 'us', body: 'مرحبا أخي. ندرسوا الطلب ونتواصلو معاك في الأسبوع القادم.', sent_at: '2026-05-25T20:02:00' },

  // ── conv-008 : محل النور للأجهزة (merchant) ──
  { id: 'msg-008-1', conversation_id: 'conv-008', sender: 'them', body: 'مرحبا، صبحكم الله بالخير. عندي زبون جديد يحب يقسط هاتف.', sent_at: '2026-05-25T08:05:00' },

  // ── conv-009 : نسيمة بكاي (customer) ──
  { id: 'msg-009-1', conversation_id: 'conv-009', sender: 'them', body: 'السلام عليكم، اعتذر على التأخر في الدفع.', sent_at: '2026-05-24T13:00:00' },
  { id: 'msg-009-2', conversation_id: 'conv-009', sender: 'us', body: 'وعليكم السلام، لا بأس. نعطيك مهلة 3 أيام إضافية. هل هذا يناسبك؟', sent_at: '2026-05-24T13:10:00' },
  { id: 'msg-009-3', conversation_id: 'conv-009', sender: 'them', body: 'يناسبني تماما، بارك الله فيكم.', sent_at: '2026-05-24T13:15:00' },
  { id: 'msg-009-4', conversation_id: 'conv-009', sender: 'them', body: 'شكرا على المهلة، نسدّد الدفعة اليوم بإذن الله.', sent_at: '2026-05-24T13:22:00' },

  // ── conv-010 : تامست إلكترونيك (merchant) ──
  { id: 'msg-010-1', conversation_id: 'conv-010', sender: 'them', body: 'السلام عليكم، حسابنا متوقف من أسبوعين.', sent_at: '2026-05-23T15:50:00' },
  { id: 'msg-010-2', conversation_id: 'conv-010', sender: 'us', body: 'وعليكم السلام، نراجع ملفكم الآن. هل أرسلتم مستندات KYB المحدّثة؟', sent_at: '2026-05-23T16:00:00' },
  { id: 'msg-010-3', conversation_id: 'conv-010', sender: 'them', body: 'نعم، أرسلناها قبل أسبوع.', sent_at: '2026-05-23T16:05:00' },
  { id: 'msg-010-4', conversation_id: 'conv-010', sender: 'them', body: 'متى يتم رفع الإيقاف عن حسابنا؟ المستندات أرسلناها قبل أسبوع.', sent_at: '2026-05-23T16:09:00' },
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

// ── Roles & permissions (admin staff RBAC) ────────────────────
// Used by /users and /roles screens. For MVP all admins have full
// access; this scaffolds the future role-based UI.

export type RoleSlug =
  | 'super_admin'
  | 'admin'
  | 'finance_manager'
  | 'support_agent'
  | 'field_agent'

export type PermissionCategory =
  | 'clients'
  | 'merchants'
  | 'financings'
  | 'payments'
  | 'payouts'
  | 'collections'
  | 'messages'
  | 'reports'
  | 'settings'

export type Permission = {
  slug: string
  name_ar: string
  name_fr: string
  category: PermissionCategory
}

export type Role = {
  id: string
  slug: RoleSlug
  name_ar: string
  name_fr: string
  description_ar: string
  description_fr: string
  /** Either an explicit list of permission slugs, or `['*']` for all. */
  permissions: string[]
  users_count: number
  /** System roles can't be deleted; super_admin permissions can't be edited. */
  is_system: boolean
  /** Brand color for the badge (matches docs/DESIGN_SYSTEM.md palette). */
  color: string
}

export const MOCK_PERMISSIONS: Permission[] = [
  // ── Clients ────────────────────────────────────────────────
  { slug: 'clients.view', name_ar: 'عرض العملاء', name_fr: 'Voir les clients', category: 'clients' },
  { slug: 'clients.approve_kyc', name_ar: 'الموافقة على التحقق', name_fr: 'Approuver KYC', category: 'clients' },
  { slug: 'clients.update_limit', name_ar: 'تعديل الحد الائتماني', name_fr: 'Modifier la limite', category: 'clients' },
  { slug: 'clients.blacklist', name_ar: 'إدراج في القائمة السوداء', name_fr: 'Liste noire', category: 'clients' },

  // ── Merchants ──────────────────────────────────────────────
  { slug: 'merchants.view', name_ar: 'عرض التجار', name_fr: 'Voir les marchands', category: 'merchants' },
  { slug: 'merchants.approve', name_ar: 'الموافقة على التجار', name_fr: 'Approuver marchands', category: 'merchants' },
  { slug: 'merchants.verify_adhoc', name_ar: 'التحقق من التجار المؤقتين', name_fr: 'Vérifier marchands ad-hoc', category: 'merchants' },
  { slug: 'merchants.suspend', name_ar: 'تعليق التجار', name_fr: 'Suspendre marchands', category: 'merchants' },

  // ── Financings & requests ──────────────────────────────────
  { slug: 'financings.view', name_ar: 'عرض التمويلات', name_fr: 'Voir financements', category: 'financings' },
  { slug: 'financings.approve', name_ar: 'الموافقة على التمويل', name_fr: 'Approuver financements', category: 'financings' },
  { slug: 'financings.reject', name_ar: 'رفض التمويل', name_fr: 'Rejeter financements', category: 'financings' },
  { slug: 'financings.generate_contract', name_ar: 'إنشاء العقود', name_fr: 'Générer contrats', category: 'financings' },
  { slug: 'financings.reschedule', name_ar: 'إعادة جدولة الأقساط', name_fr: 'Reprogrammer échéances', category: 'financings' },

  // ── Payments ───────────────────────────────────────────────
  { slug: 'payments.view', name_ar: 'عرض المدفوعات', name_fr: 'Voir paiements', category: 'payments' },
  { slug: 'payments.verify', name_ar: 'التحقق من المدفوعات', name_fr: 'Vérifier paiements', category: 'payments' },

  // ── Payouts ────────────────────────────────────────────────
  { slug: 'payouts.view', name_ar: 'عرض المدفوعات للتجار', name_fr: 'Voir versements', category: 'payouts' },
  { slug: 'payouts.process', name_ar: 'معالجة المدفوعات', name_fr: 'Traiter versements', category: 'payouts' },
  { slug: 'payouts.deliver', name_ar: 'تسليم نقدي', name_fr: 'Remise cash', category: 'payouts' },

  // ── Collections ────────────────────────────────────────────
  { slug: 'collections.view', name_ar: 'عرض التحصيل', name_fr: 'Voir recouvrement', category: 'collections' },
  { slug: 'collections.visit', name_ar: 'الزيارات الميدانية', name_fr: 'Visites terrain', category: 'collections' },
  { slug: 'collections.log_action', name_ar: 'تسجيل إجراءات', name_fr: 'Journaliser actions', category: 'collections' },

  // ── Messages ───────────────────────────────────────────────
  { slug: 'messages.view', name_ar: 'عرض الرسائل', name_fr: 'Voir messages', category: 'messages' },
  { slug: 'messages.respond', name_ar: 'الرد على الرسائل', name_fr: 'Répondre messages', category: 'messages' },

  // ── Reports ────────────────────────────────────────────────
  { slug: 'reports.view', name_ar: 'عرض التقارير', name_fr: 'Voir rapports', category: 'reports' },
  { slug: 'reports.export', name_ar: 'تصدير التقارير', name_fr: 'Exporter rapports', category: 'reports' },

  // ── Settings ───────────────────────────────────────────────
  { slug: 'settings.view', name_ar: 'عرض الإعدادات', name_fr: 'Voir paramètres', category: 'settings' },
  { slug: 'settings.manage', name_ar: 'إدارة الإعدادات', name_fr: 'Gérer paramètres', category: 'settings' },
  { slug: 'settings.manage_roles', name_ar: 'إدارة الأدوار والصلاحيات', name_fr: 'Gérer rôles et permissions', category: 'settings' },
]

export const MOCK_ROLES: Role[] = [
  {
    id: 'role-super-admin',
    slug: 'super_admin',
    name_ar: 'مدير عام',
    name_fr: 'Super administrateur',
    description_ar: 'صلاحيات كاملة على جميع الأقسام بما فيها إدارة الأدوار.',
    description_fr: 'Accès complet à toutes les sections, y compris la gestion des rôles.',
    permissions: ['*'],
    users_count: 1,
    is_system: true,
    color: '#0F6E56',
  },
  {
    id: 'role-admin',
    slug: 'admin',
    name_ar: 'مدير',
    name_fr: 'Administrateur',
    description_ar: 'إدارة العمليات اليومية باستثناء إعدادات النظام والأدوار.',
    description_fr: 'Gestion quotidienne hors paramètres système et rôles.',
    permissions: [
      'clients.view', 'clients.approve_kyc', 'clients.update_limit', 'clients.blacklist',
      'merchants.view', 'merchants.approve', 'merchants.verify_adhoc', 'merchants.suspend',
      'financings.view', 'financings.approve', 'financings.reject', 'financings.generate_contract',
      'payments.view', 'payments.verify',
      'payouts.view', 'payouts.process',
      'collections.view', 'collections.log_action',
      'messages.view', 'messages.respond',
      'reports.view', 'reports.export',
      'settings.view',
    ],
    users_count: 2,
    is_system: true,
    color: '#0C5B47',
  },
  {
    id: 'role-finance-manager',
    slug: 'finance_manager',
    name_ar: 'مدير مالي',
    name_fr: 'Responsable financier',
    description_ar: 'مسؤول عن التمويلات والمدفوعات وتصدير التقارير المالية.',
    description_fr: 'Responsable des financements, paiements et exports financiers.',
    permissions: [
      'financings.view', 'financings.approve', 'financings.reject',
      'financings.generate_contract', 'financings.reschedule',
      'payments.view', 'payments.verify',
      'payouts.view', 'payouts.process',
      'reports.view', 'reports.export',
    ],
    users_count: 1,
    is_system: false,
    color: '#378ADD',
  },
  {
    id: 'role-support-agent',
    slug: 'support_agent',
    name_ar: 'وكيل دعم',
    name_fr: 'Agent support',
    description_ar: 'دعم العملاء والرد على رسائلهم بدون صلاحيات مالية.',
    description_fr: 'Support client et réponse aux messages, sans accès financier.',
    permissions: [
      'clients.view',
      'messages.view', 'messages.respond',
      'financings.view',
      'payments.view',
    ],
    users_count: 3,
    is_system: false,
    color: '#EF9F27',
  },
  {
    id: 'role-field-agent',
    slug: 'field_agent',
    name_ar: 'وكيل ميداني',
    name_fr: 'Agent terrain',
    description_ar: 'تسليم المبالغ نقداً للتجار وزيارة العملاء المتأخرين.',
    description_fr: 'Remises cash aux marchands et visites des clients en retard.',
    permissions: [
      'payouts.view', 'payouts.deliver',
      'collections.view', 'collections.visit', 'collections.log_action',
    ],
    users_count: 2,
    is_system: false,
    color: '#1D9E75',
  },
]

/** Returns true if a role grants the given permission (handles the `*` wildcard). */
export function roleHasPermission(role: Pick<Role, 'permissions'>, slug: string): boolean {
  return role.permissions.includes('*') || role.permissions.includes(slug)
}

/** Stable order to group permissions in the matrix UI. */
export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  'clients',
  'merchants',
  'financings',
  'payments',
  'payouts',
  'collections',
  'messages',
  'reports',
  'settings',
]

// ── Monthly accounting — installments due in a given month ────
// Each row represents a single installment due in May 2026 across
// the active portfolio. Used by the Accounting page to answer
// "who needs to pay this month, and who already did?".
export type MonthlyInstallmentStatus = 'paid' | 'pending' | 'late' | 'missed'

export type MonthlyInstallmentRow = {
  client_name: string
  client_phone: string
  wilaya_ar: string
  financing_ref: string
  installment_number: number
  total_installments: number
  amount_dzd: number
  due_date: string
  status: MonthlyInstallmentStatus
}

export const MOCK_MAY_INSTALLMENTS: MonthlyInstallmentRow[] = [
  // ── Week 1 (May 1 – May 7) — mostly settled ────────────────
  { client_name: 'أيوب قويدري', client_phone: '+213551203847', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000089', installment_number: 2, total_installments: 12, amount_dzd: 19167, due_date: '2026-05-02', status: 'paid' },
  { client_name: 'محمد الأمين تواتي', client_phone: '+213551772900', wilaya_ar: 'تامست', financing_ref: 'CRF-2026-000084', installment_number: 4, total_installments: 12, amount_dzd: 14375, due_date: '2026-05-02', status: 'paid' },
  { client_name: 'كريم العماري', client_phone: '+213662918334', wilaya_ar: 'رقان', financing_ref: 'CRF-2026-000091', installment_number: 3, total_installments: 12, amount_dzd: 11800, due_date: '2026-05-03', status: 'paid' },
  { client_name: 'سمية حساني', client_phone: '+213779338471', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000093', installment_number: 2, total_installments: 6, amount_dzd: 21300, due_date: '2026-05-04', status: 'paid' },
  { client_name: 'خديجة عمراني', client_phone: '+213551667214', wilaya_ar: 'بودة', financing_ref: 'CRF-2026-000074', installment_number: 4, total_installments: 12, amount_dzd: 10350, due_date: '2026-05-05', status: 'paid' },
  { client_name: 'وليد شعباني', client_phone: '+213779445026', wilaya_ar: 'تيت', financing_ref: 'CRF-2026-000095', installment_number: 1, total_installments: 12, amount_dzd: 17050, due_date: '2026-05-05', status: 'paid' },
  { client_name: 'نسيمة بكاي', client_phone: '+213662550719', wilaya_ar: 'تسابيت', financing_ref: 'CRF-2026-000078', installment_number: 2, total_installments: 6, amount_dzd: 16000, due_date: '2026-05-06', status: 'paid' },
  { client_name: 'فاطمة الزهراء بلقاسم', client_phone: '+213770564219', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000097', installment_number: 5, total_installments: 12, amount_dzd: 13400, due_date: '2026-05-07', status: 'paid' },

  // ── Week 2 (May 8 – May 14) — settled + a few late/missed ─
  { client_name: 'إبراهيم سحنون', client_phone: '+213770112648', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000101', installment_number: 6, total_installments: 12, amount_dzd: 15600, due_date: '2026-05-08', status: 'paid' },
  { client_name: 'الطاهر بن زيان', client_phone: '+213663920185', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000104', installment_number: 2, total_installments: 12, amount_dzd: 9450, due_date: '2026-05-08', status: 'paid' },
  { client_name: 'يوسف بن عيسى', client_phone: '+213663401255', wilaya_ar: 'أولف', financing_ref: 'CRF-2026-000106', installment_number: 3, total_installments: 6, amount_dzd: 8200, due_date: '2026-05-09', status: 'paid' },
  { client_name: 'أيوب قويدري', client_phone: '+213551203847', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000110', installment_number: 1, total_installments: 12, amount_dzd: 12500, due_date: '2026-05-10', status: 'paid' },
  { client_name: 'عبد الرحمن مولاي', client_phone: '+213551884003', wilaya_ar: 'رقان', financing_ref: 'CRF-2026-000059', installment_number: 5, total_installments: 12, amount_dzd: 11500, due_date: '2026-05-10', status: 'missed' },
  { client_name: 'محمد الأمين تواتي', client_phone: '+213551772900', wilaya_ar: 'تامست', financing_ref: 'CRF-2026-000113', installment_number: 2, total_installments: 12, amount_dzd: 18900, due_date: '2026-05-11', status: 'paid' },
  { client_name: 'نسيمة بكاي', client_phone: '+213662550719', wilaya_ar: 'تسابيت', financing_ref: 'CRF-2026-000078', installment_number: 3, total_installments: 6, amount_dzd: 16000, due_date: '2026-05-12', status: 'late' },
  { client_name: 'كريم العماري', client_phone: '+213662918334', wilaya_ar: 'رقان', financing_ref: 'CRF-2026-000115', installment_number: 4, total_installments: 12, amount_dzd: 10200, due_date: '2026-05-13', status: 'paid' },
  { client_name: 'سمية حساني', client_phone: '+213779338471', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000081', installment_number: 3, total_installments: 12, amount_dzd: 11021, due_date: '2026-05-14', status: 'late' },
  { client_name: 'خديجة عمراني', client_phone: '+213551667214', wilaya_ar: 'بودة', financing_ref: 'CRF-2026-000118', installment_number: 7, total_installments: 12, amount_dzd: 9750, due_date: '2026-05-14', status: 'paid' },

  // ── Week 3 (May 15 – May 21) — settled + 2 late ───────────
  { client_name: 'فاطمة الزهراء بلقاسم', client_phone: '+213770564219', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000120', installment_number: 4, total_installments: 12, amount_dzd: 13800, due_date: '2026-05-15', status: 'paid' },
  { client_name: 'وليد شعباني', client_phone: '+213779445026', wilaya_ar: 'تيت', financing_ref: 'CRF-2026-000122', installment_number: 2, total_installments: 12, amount_dzd: 22400, due_date: '2026-05-16', status: 'paid' },
  { client_name: 'إبراهيم سحنون', client_phone: '+213770112648', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000124', installment_number: 8, total_installments: 12, amount_dzd: 14250, due_date: '2026-05-17', status: 'paid' },
  { client_name: 'الطاهر بن زيان', client_phone: '+213663920185', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000125', installment_number: 1, total_installments: 6, amount_dzd: 16800, due_date: '2026-05-18', status: 'paid' },
  { client_name: 'يوسف بن عيسى', client_phone: '+213663401255', wilaya_ar: 'أولف', financing_ref: 'CRF-2026-000127', installment_number: 5, total_installments: 12, amount_dzd: 11000, due_date: '2026-05-19', status: 'late' },
  { client_name: 'محمد الأمين تواتي', client_phone: '+213551772900', wilaya_ar: 'تامست', financing_ref: 'CRF-2026-000128', installment_number: 6, total_installments: 12, amount_dzd: 12750, due_date: '2026-05-20', status: 'paid' },
  { client_name: 'عبد الرحمن مولاي', client_phone: '+213551884003', wilaya_ar: 'رقان', financing_ref: 'CRF-2026-000059', installment_number: 6, total_installments: 12, amount_dzd: 11500, due_date: '2026-05-20', status: 'missed' },
  { client_name: 'كريم العماري', client_phone: '+213662918334', wilaya_ar: 'رقان', financing_ref: 'CRF-2026-000130', installment_number: 3, total_installments: 12, amount_dzd: 15400, due_date: '2026-05-21', status: 'paid' },
  { client_name: 'سمية حساني', client_phone: '+213779338471', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000131', installment_number: 9, total_installments: 12, amount_dzd: 10800, due_date: '2026-05-21', status: 'paid' },

  // ── Week 4 (May 22 – May 27) — settled + 2 late ──────────
  { client_name: 'نسيمة بكاي', client_phone: '+213662550719', wilaya_ar: 'تسابيت', financing_ref: 'CRF-2026-000133', installment_number: 2, total_installments: 12, amount_dzd: 19200, due_date: '2026-05-22', status: 'paid' },
  { client_name: 'خديجة عمراني', client_phone: '+213551667214', wilaya_ar: 'بودة', financing_ref: 'CRF-2026-000135', installment_number: 3, total_installments: 12, amount_dzd: 8950, due_date: '2026-05-23', status: 'paid' },
  { client_name: 'فاطمة الزهراء بلقاسم', client_phone: '+213770564219', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000136', installment_number: 6, total_installments: 12, amount_dzd: 13100, due_date: '2026-05-24', status: 'late' },
  { client_name: 'وليد شعباني', client_phone: '+213779445026', wilaya_ar: 'تيت', financing_ref: 'CRF-2026-000138', installment_number: 4, total_installments: 12, amount_dzd: 17900, due_date: '2026-05-25', status: 'paid' },
  { client_name: 'أيوب قويدري', client_phone: '+213551203847', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000140', installment_number: 5, total_installments: 12, amount_dzd: 11250, due_date: '2026-05-25', status: 'paid' },
  { client_name: 'الطاهر بن زيان', client_phone: '+213663920185', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000141', installment_number: 7, total_installments: 12, amount_dzd: 10100, due_date: '2026-05-26', status: 'late' },
  { client_name: 'يوسف بن عيسى', client_phone: '+213663401255', wilaya_ar: 'أولف', financing_ref: 'CRF-2026-000143', installment_number: 2, total_installments: 6, amount_dzd: 14600, due_date: '2026-05-27', status: 'pending' },
  { client_name: 'كريم العماري', client_phone: '+213662918334', wilaya_ar: 'رقان', financing_ref: 'CRF-2026-000145', installment_number: 4, total_installments: 12, amount_dzd: 9300, due_date: '2026-05-27', status: 'pending' },

  // ── Week 5 (May 28 – May 31) — all future / pending ───────
  { client_name: 'إبراهيم سحنون', client_phone: '+213770112648', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000146', installment_number: 10, total_installments: 12, amount_dzd: 12400, due_date: '2026-05-28', status: 'pending' },
  { client_name: 'محمد الأمين تواتي', client_phone: '+213551772900', wilaya_ar: 'تامست', financing_ref: 'CRF-2026-000148', installment_number: 8, total_installments: 12, amount_dzd: 15750, due_date: '2026-05-28', status: 'pending' },
  { client_name: 'سمية حساني', client_phone: '+213779338471', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000081', installment_number: 3, total_installments: 12, amount_dzd: 11021, due_date: '2026-05-29', status: 'pending' },
  { client_name: 'خديجة عمراني', client_phone: '+213551667214', wilaya_ar: 'بودة', financing_ref: 'CRF-2026-000150', installment_number: 5, total_installments: 12, amount_dzd: 10500, due_date: '2026-05-29', status: 'pending' },
  { client_name: 'نسيمة بكاي', client_phone: '+213662550719', wilaya_ar: 'تسابيت', financing_ref: 'CRF-2026-000152', installment_number: 11, total_installments: 12, amount_dzd: 16400, due_date: '2026-05-30', status: 'pending' },
  { client_name: 'فاطمة الزهراء بلقاسم', client_phone: '+213770564219', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000154', installment_number: 3, total_installments: 12, amount_dzd: 8700, due_date: '2026-05-30', status: 'pending' },
  { client_name: 'وليد شعباني', client_phone: '+213779445026', wilaya_ar: 'تيت', financing_ref: 'CRF-2026-000156', installment_number: 7, total_installments: 12, amount_dzd: 19800, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'يوسف بن عيسى', client_phone: '+213663401255', wilaya_ar: 'أولف', financing_ref: 'CRF-2026-000158', installment_number: 4, total_installments: 6, amount_dzd: 13200, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'الطاهر بن زيان', client_phone: '+213663920185', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000159', installment_number: 9, total_installments: 12, amount_dzd: 11900, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'كريم العماري', client_phone: '+213662918334', wilaya_ar: 'رقان', financing_ref: 'CRF-2026-000160', installment_number: 6, total_installments: 12, amount_dzd: 14000, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'أيوب قويدري', client_phone: '+213551203847', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000161', installment_number: 4, total_installments: 12, amount_dzd: 17600, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'عبد الرحمن مولاي', client_phone: '+213551884003', wilaya_ar: 'رقان', financing_ref: 'CRF-2026-000162', installment_number: 2, total_installments: 12, amount_dzd: 9850, due_date: '2026-05-31', status: 'missed' },
  { client_name: 'محمد الأمين تواتي', client_phone: '+213551772900', wilaya_ar: 'تامست', financing_ref: 'CRF-2026-000164', installment_number: 10, total_installments: 12, amount_dzd: 13550, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'إبراهيم سحنون', client_phone: '+213770112648', wilaya_ar: 'أدرار', financing_ref: 'CRF-2026-000165', installment_number: 12, total_installments: 12, amount_dzd: 18200, due_date: '2026-05-31', status: 'pending' },
]

// ── Wilayas reference (58 Algerian wilayas) ───────────────────
// MVP scope is Adrar (code 01) only, but the admin UI exposes the
// full list so the filter component matches what the real backend's
// `/public/wilayas` endpoint will return.
export type WilayaRef = {
  code: string
  nameAr: string
  nameFr: string
  /** True for the Adrar MVP catchment. */
  serviceAvailable: boolean
}

export const WILAYAS: WilayaRef[] = [
  { code: '01', nameAr: 'أدرار', nameFr: 'Adrar', serviceAvailable: true },
  { code: '02', nameAr: 'الشلف', nameFr: 'Chlef', serviceAvailable: false },
  { code: '03', nameAr: 'الأغواط', nameFr: 'Laghouat', serviceAvailable: false },
  { code: '04', nameAr: 'أم البواقي', nameFr: 'Oum El Bouaghi', serviceAvailable: false },
  { code: '05', nameAr: 'باتنة', nameFr: 'Batna', serviceAvailable: false },
  { code: '06', nameAr: 'بجاية', nameFr: 'Béjaïa', serviceAvailable: false },
  { code: '07', nameAr: 'بسكرة', nameFr: 'Biskra', serviceAvailable: false },
  { code: '08', nameAr: 'بشار', nameFr: 'Béchar', serviceAvailable: false },
  { code: '09', nameAr: 'البليدة', nameFr: 'Blida', serviceAvailable: false },
  { code: '10', nameAr: 'البويرة', nameFr: 'Bouira', serviceAvailable: false },
  { code: '11', nameAr: 'تمنراست', nameFr: 'Tamanrasset', serviceAvailable: false },
  { code: '12', nameAr: 'تبسة', nameFr: 'Tébessa', serviceAvailable: false },
  { code: '13', nameAr: 'تلمسان', nameFr: 'Tlemcen', serviceAvailable: false },
  { code: '14', nameAr: 'تيارت', nameFr: 'Tiaret', serviceAvailable: false },
  { code: '15', nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou', serviceAvailable: false },
  { code: '16', nameAr: 'الجزائر', nameFr: 'Alger', serviceAvailable: false },
  { code: '17', nameAr: 'الجلفة', nameFr: 'Djelfa', serviceAvailable: false },
  { code: '18', nameAr: 'جيجل', nameFr: 'Jijel', serviceAvailable: false },
  { code: '19', nameAr: 'سطيف', nameFr: 'Sétif', serviceAvailable: false },
  { code: '20', nameAr: 'سعيدة', nameFr: 'Saïda', serviceAvailable: false },
  { code: '21', nameAr: 'سكيكدة', nameFr: 'Skikda', serviceAvailable: false },
  { code: '22', nameAr: 'سيدي بلعباس', nameFr: 'Sidi Bel Abbès', serviceAvailable: false },
  { code: '23', nameAr: 'عنابة', nameFr: 'Annaba', serviceAvailable: false },
  { code: '24', nameAr: 'قالمة', nameFr: 'Guelma', serviceAvailable: false },
  { code: '25', nameAr: 'قسنطينة', nameFr: 'Constantine', serviceAvailable: false },
  { code: '26', nameAr: 'المدية', nameFr: 'Médéa', serviceAvailable: false },
  { code: '27', nameAr: 'مستغانم', nameFr: 'Mostaganem', serviceAvailable: false },
  { code: '28', nameAr: 'المسيلة', nameFr: "M'Sila", serviceAvailable: false },
  { code: '29', nameAr: 'معسكر', nameFr: 'Mascara', serviceAvailable: false },
  { code: '30', nameAr: 'ورقلة', nameFr: 'Ouargla', serviceAvailable: false },
  { code: '31', nameAr: 'وهران', nameFr: 'Oran', serviceAvailable: false },
  { code: '32', nameAr: 'البيض', nameFr: 'El Bayadh', serviceAvailable: false },
  { code: '33', nameAr: 'إليزي', nameFr: 'Illizi', serviceAvailable: false },
  { code: '34', nameAr: 'برج بوعريريج', nameFr: 'Bordj Bou Arréridj', serviceAvailable: false },
  { code: '35', nameAr: 'بومرداس', nameFr: 'Boumerdès', serviceAvailable: false },
  { code: '36', nameAr: 'الطارف', nameFr: 'El Tarf', serviceAvailable: false },
  { code: '37', nameAr: 'تندوف', nameFr: 'Tindouf', serviceAvailable: false },
  { code: '38', nameAr: 'تيسمسيلت', nameFr: 'Tissemsilt', serviceAvailable: false },
  { code: '39', nameAr: 'الوادي', nameFr: 'El Oued', serviceAvailable: false },
  { code: '40', nameAr: 'خنشلة', nameFr: 'Khenchela', serviceAvailable: false },
  { code: '41', nameAr: 'سوق أهراس', nameFr: 'Souk Ahras', serviceAvailable: false },
  { code: '42', nameAr: 'تيبازة', nameFr: 'Tipaza', serviceAvailable: false },
  { code: '43', nameAr: 'ميلة', nameFr: 'Mila', serviceAvailable: false },
  { code: '44', nameAr: 'عين الدفلى', nameFr: 'Aïn Defla', serviceAvailable: false },
  { code: '45', nameAr: 'النعامة', nameFr: 'Naâma', serviceAvailable: false },
  { code: '46', nameAr: 'عين تموشنت', nameFr: 'Aïn Témouchent', serviceAvailable: false },
  { code: '47', nameAr: 'غرداية', nameFr: 'Ghardaïa', serviceAvailable: false },
  { code: '48', nameAr: 'غليزان', nameFr: 'Relizane', serviceAvailable: false },
  { code: '49', nameAr: 'تيميمون', nameFr: 'Timimoun', serviceAvailable: false },
  { code: '50', nameAr: 'برج باجي مختار', nameFr: 'Bordj Badji Mokhtar', serviceAvailable: false },
  { code: '51', nameAr: 'أولاد جلال', nameFr: 'Ouled Djellal', serviceAvailable: false },
  { code: '52', nameAr: 'بني عباس', nameFr: 'Béni Abbès', serviceAvailable: false },
  { code: '53', nameAr: 'عين صالح', nameFr: 'In Salah', serviceAvailable: false },
  { code: '54', nameAr: 'عين قزام', nameFr: 'In Guezzam', serviceAvailable: false },
  { code: '55', nameAr: 'توقرت', nameFr: 'Touggourt', serviceAvailable: false },
  { code: '56', nameAr: 'جانت', nameFr: 'Djanet', serviceAvailable: false },
  { code: '57', nameAr: 'المغير', nameFr: "El M'Ghair", serviceAvailable: false },
  { code: '58', nameAr: 'المنيعة', nameFr: 'El Meniaa', serviceAvailable: false },
]

/**
 * Client → wilaya mapping. The Client type stores only `commune` today;
 * this lookup denormalizes the wilaya for filter/display. Most clients
 * are seeded in Adrar (MVP scope), but a handful are placed in
 * neighbouring wilayas so the wilaya filter UI is testable end-to-end.
 */
export const CLIENT_WILAYA_MAP: Record<string, string> = {
  'أيوب قويدري': '01',
  'كريم العماري': '01',
  'فاطمة الزهراء بلقاسم': '01',
  'محمد الأمين تواتي': '01',
  'يوسف بن عيسى': '01',
  'سمية حساني': '01',
  'عبد الرحمن مولاي': '08',
  'نسيمة بكاي': '01',
  'إبراهيم سحنون': '49',
  'خديجة عمراني': '01',
  'الطاهر بن زيان': '01',
  'وليد شعباني': '37',
}

/** Resolve a client's wilaya from their display name. Falls back to Adrar. */
export function getClientWilayaByName(name: string): WilayaRef {
  const code = CLIENT_WILAYA_MAP[name] ?? '01'
  return WILAYAS.find((w) => w.code === code) ?? WILAYAS[0]
}

// ── "Who pays this month" — installment-level monthly view ────
// Used by the Financings page "هذا الشهر" tab. One row per installment
// due in the current calendar month (anchor: May 2026). The schema
// below will line up with the future `/admin/installments?due_month=`
// endpoint when the backend lands.
export type MonthlyView = {
  client_name: string
  client_phone: string
  client_wilaya_code: string
  client_wilaya_ar: string
  client_wilaya_fr: string
  financing_ref: string
  installment_number: number
  total_installments: number
  amount_dzd: number
  /** ISO date (YYYY-MM-DD), always inside the anchor month. */
  due_date: string
  status: 'paid' | 'pending' | 'late' | 'missed'
}

export const MOCK_THIS_MONTH_VIEW: MonthlyView[] = [
  // ── Paid (early in the month) ─────────────────────────────
  { client_name: 'خديجة عمراني', client_phone: '+213551667214', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000074', installment_number: 5, total_installments: 12, amount_dzd: 10350, due_date: '2026-05-02', status: 'paid' },
  { client_name: 'محمد الأمين تواتي', client_phone: '+213551772900', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000084', installment_number: 4, total_installments: 12, amount_dzd: 14375, due_date: '2026-05-02', status: 'paid' },
  { client_name: 'أيوب قويدري', client_phone: '+213551203847', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000089', installment_number: 2, total_installments: 12, amount_dzd: 19167, due_date: '2026-05-08', status: 'paid' },
  { client_name: 'سمية حساني', client_phone: '+213779338471', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000081', installment_number: 1, total_installments: 12, amount_dzd: 11021, due_date: '2026-04-29', status: 'paid' },
  { client_name: 'فاطمة الزهراء بلقاسم', client_phone: '+213770564219', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000091', installment_number: 1, total_installments: 6, amount_dzd: 24500, due_date: '2026-05-03', status: 'paid' },
  { client_name: 'كريم العماري', client_phone: '+213662918334', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000086', installment_number: 3, total_installments: 12, amount_dzd: 12300, due_date: '2026-05-05', status: 'paid' },
  { client_name: 'وليد شعباني', client_phone: '+213779445026', client_wilaya_code: '37', client_wilaya_ar: 'تندوف', client_wilaya_fr: 'Tindouf', financing_ref: 'CRF-2026-000093', installment_number: 2, total_installments: 12, amount_dzd: 16800, due_date: '2026-05-06', status: 'paid' },
  { client_name: 'محمد الأمين تواتي', client_phone: '+213551772900', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000095', installment_number: 1, total_installments: 12, amount_dzd: 9650, due_date: '2026-05-09', status: 'paid' },
  { client_name: 'سمية حساني', client_phone: '+213779338471', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000097', installment_number: 1, total_installments: 6, amount_dzd: 18900, due_date: '2026-05-10', status: 'paid' },
  { client_name: 'إبراهيم سحنون', client_phone: '+213770112648', client_wilaya_code: '49', client_wilaya_ar: 'تيميمون', client_wilaya_fr: 'Timimoun', financing_ref: 'CRF-2026-000099', installment_number: 2, total_installments: 12, amount_dzd: 13200, due_date: '2026-05-11', status: 'paid' },
  { client_name: 'خديجة عمراني', client_phone: '+213551667214', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000101', installment_number: 1, total_installments: 12, amount_dzd: 8750, due_date: '2026-05-14', status: 'paid' },

  // ── Late (overdue, was due before today 2026-05-27) ───────
  { client_name: 'نسيمة بكاي', client_phone: '+213662550719', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000078', installment_number: 2, total_installments: 6, amount_dzd: 16000, due_date: '2026-05-12', status: 'late' },
  { client_name: 'عبد الرحمن مولاي', client_phone: '+213551884003', client_wilaya_code: '08', client_wilaya_ar: 'بشار', client_wilaya_fr: 'Béchar', financing_ref: 'CRF-2026-000059', installment_number: 3, total_installments: 12, amount_dzd: 11500, due_date: '2026-05-04', status: 'late' },
  { client_name: 'يوسف بن عيسى', client_phone: '+213663401255', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000103', installment_number: 4, total_installments: 6, amount_dzd: 13500, due_date: '2026-05-15', status: 'late' },
  { client_name: 'كريم العماري', client_phone: '+213662918334', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000105', installment_number: 5, total_installments: 12, amount_dzd: 10800, due_date: '2026-05-18', status: 'late' },

  // ── Missed (significantly overdue) ────────────────────────
  { client_name: 'الطاهر بن زيان', client_phone: '+213663920185', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000061', installment_number: 2, total_installments: 12, amount_dzd: 9500, due_date: '2026-05-07', status: 'missed' },

  // ── Pending (due after today 2026-05-27, no payment yet) ──
  { client_name: 'سمية حساني', client_phone: '+213779338471', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000081', installment_number: 3, total_installments: 12, amount_dzd: 11021, due_date: '2026-05-29', status: 'pending' },
  { client_name: 'أيوب قويدري', client_phone: '+213551203847', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000089', installment_number: 3, total_installments: 12, amount_dzd: 19167, due_date: '2026-05-28', status: 'pending' },
  { client_name: 'محمد الأمين تواتي', client_phone: '+213551772900', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000084', installment_number: 5, total_installments: 12, amount_dzd: 14375, due_date: '2026-05-30', status: 'pending' },
  { client_name: 'فاطمة الزهراء بلقاسم', client_phone: '+213770564219', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000107', installment_number: 1, total_installments: 6, amount_dzd: 17800, due_date: '2026-05-28', status: 'pending' },
  { client_name: 'نسيمة بكاي', client_phone: '+213662550719', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000109', installment_number: 2, total_installments: 12, amount_dzd: 13900, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'وليد شعباني', client_phone: '+213779445026', client_wilaya_code: '37', client_wilaya_ar: 'تندوف', client_wilaya_fr: 'Tindouf', financing_ref: 'CRF-2026-000111', installment_number: 3, total_installments: 12, amount_dzd: 21500, due_date: '2026-05-29', status: 'pending' },
  { client_name: 'إبراهيم سحنون', client_phone: '+213770112648', client_wilaya_code: '49', client_wilaya_ar: 'تيميمون', client_wilaya_fr: 'Timimoun', financing_ref: 'CRF-2026-000113', installment_number: 1, total_installments: 12, amount_dzd: 14250, due_date: '2026-05-30', status: 'pending' },
  { client_name: 'خديجة عمراني', client_phone: '+213551667214', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000074', installment_number: 6, total_installments: 12, amount_dzd: 10350, due_date: '2026-05-28', status: 'pending' },
  { client_name: 'محمد الأمين تواتي', client_phone: '+213551772900', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000095', installment_number: 2, total_installments: 12, amount_dzd: 9650, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'كريم العماري', client_phone: '+213662918334', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000086', installment_number: 4, total_installments: 12, amount_dzd: 12300, due_date: '2026-05-30', status: 'pending' },
  { client_name: 'سمية حساني', client_phone: '+213779338471', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000097', installment_number: 2, total_installments: 6, amount_dzd: 18900, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'يوسف بن عيسى', client_phone: '+213663401255', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000115', installment_number: 1, total_installments: 6, amount_dzd: 12500, due_date: '2026-05-29', status: 'pending' },
  { client_name: 'الطاهر بن زيان', client_phone: '+213663920185', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000117', installment_number: 1, total_installments: 12, amount_dzd: 8950, due_date: '2026-05-28', status: 'pending' },
  { client_name: 'خديجة عمراني', client_phone: '+213551667214', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000101', installment_number: 2, total_installments: 12, amount_dzd: 8750, due_date: '2026-05-30', status: 'pending' },
  { client_name: 'إبراهيم سحنون', client_phone: '+213770112648', client_wilaya_code: '49', client_wilaya_ar: 'تيميمون', client_wilaya_fr: 'Timimoun', financing_ref: 'CRF-2026-000099', installment_number: 3, total_installments: 12, amount_dzd: 13200, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'عبد الرحمن مولاي', client_phone: '+213551884003', client_wilaya_code: '08', client_wilaya_ar: 'بشار', client_wilaya_fr: 'Béchar', financing_ref: 'CRF-2026-000119', installment_number: 2, total_installments: 12, amount_dzd: 15800, due_date: '2026-05-28', status: 'pending' },
  { client_name: 'فاطمة الزهراء بلقاسم', client_phone: '+213770564219', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000091', installment_number: 2, total_installments: 6, amount_dzd: 24500, due_date: '2026-05-30', status: 'pending' },
  { client_name: 'وليد شعباني', client_phone: '+213779445026', client_wilaya_code: '37', client_wilaya_ar: 'تندوف', client_wilaya_fr: 'Tindouf', financing_ref: 'CRF-2026-000093', installment_number: 3, total_installments: 12, amount_dzd: 16800, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'كريم العماري', client_phone: '+213662918334', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000105', installment_number: 6, total_installments: 12, amount_dzd: 10800, due_date: '2026-05-29', status: 'pending' },
  { client_name: 'نسيمة بكاي', client_phone: '+213662550719', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000121', installment_number: 1, total_installments: 12, amount_dzd: 11200, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'محمد الأمين تواتي', client_phone: '+213551772900', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000123', installment_number: 1, total_installments: 12, amount_dzd: 17400, due_date: '2026-05-31', status: 'pending' },
  { client_name: 'الطاهر بن زيان', client_phone: '+213663920185', client_wilaya_code: '01', client_wilaya_ar: 'أدرار', client_wilaya_fr: 'Adrar', financing_ref: 'CRF-2026-000061', installment_number: 3, total_installments: 12, amount_dzd: 9500, due_date: '2026-05-31', status: 'pending' },
]
