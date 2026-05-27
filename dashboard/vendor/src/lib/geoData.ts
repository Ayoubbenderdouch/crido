// ─────────────────────────────────────────────────────────────
// Algerian wilayas + Adrar communes — used by forms that need
// a geographic picker (financing requests, customer onboarding).
//
// Source: backend/database/seeders/data/{wilayas,communes}.json
// (mirrored here so the vendor mock works without an API).
//
// MVP rule: only Adrar (wilaya code 01) is service-available.
// All 58 wilayas are listed so the dropdown shows the full country,
// but non-service wilayas are flagged → UI can show a notice and
// block submission (see docs/ALGERIA_CONTEXT.md §1).
// ─────────────────────────────────────────────────────────────

export type WilayaOption = {
  id: number
  code: string
  nameAr: string
  nameFr: string
  serviceAvailable: boolean
}

export type CommuneOption = {
  wilayaId: number
  code: string
  nameAr: string
  nameFr: string
}

export const WILAYAS: WilayaOption[] = [
  { id: 1, code: '01', nameAr: 'أدرار', nameFr: 'Adrar', serviceAvailable: true },
  { id: 2, code: '02', nameAr: 'الشلف', nameFr: 'Chlef', serviceAvailable: false },
  { id: 3, code: '03', nameAr: 'الأغواط', nameFr: 'Laghouat', serviceAvailable: false },
  { id: 4, code: '04', nameAr: 'أم البواقي', nameFr: 'Oum El Bouaghi', serviceAvailable: false },
  { id: 5, code: '05', nameAr: 'باتنة', nameFr: 'Batna', serviceAvailable: false },
  { id: 6, code: '06', nameAr: 'بجاية', nameFr: 'Béjaïa', serviceAvailable: false },
  { id: 7, code: '07', nameAr: 'بسكرة', nameFr: 'Biskra', serviceAvailable: false },
  { id: 8, code: '08', nameAr: 'بشار', nameFr: 'Béchar', serviceAvailable: false },
  { id: 9, code: '09', nameAr: 'البليدة', nameFr: 'Blida', serviceAvailable: false },
  { id: 10, code: '10', nameAr: 'البويرة', nameFr: 'Bouira', serviceAvailable: false },
  { id: 11, code: '11', nameAr: 'تمنراست', nameFr: 'Tamanrasset', serviceAvailable: false },
  { id: 12, code: '12', nameAr: 'تبسة', nameFr: 'Tébessa', serviceAvailable: false },
  { id: 13, code: '13', nameAr: 'تلمسان', nameFr: 'Tlemcen', serviceAvailable: false },
  { id: 14, code: '14', nameAr: 'تيارت', nameFr: 'Tiaret', serviceAvailable: false },
  { id: 15, code: '15', nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou', serviceAvailable: false },
  { id: 16, code: '16', nameAr: 'الجزائر', nameFr: 'Alger', serviceAvailable: false },
  { id: 17, code: '17', nameAr: 'الجلفة', nameFr: 'Djelfa', serviceAvailable: false },
  { id: 18, code: '18', nameAr: 'جيجل', nameFr: 'Jijel', serviceAvailable: false },
  { id: 19, code: '19', nameAr: 'سطيف', nameFr: 'Sétif', serviceAvailable: false },
  { id: 20, code: '20', nameAr: 'سعيدة', nameFr: 'Saïda', serviceAvailable: false },
  { id: 21, code: '21', nameAr: 'سكيكدة', nameFr: 'Skikda', serviceAvailable: false },
  { id: 22, code: '22', nameAr: 'سيدي بلعباس', nameFr: 'Sidi Bel Abbès', serviceAvailable: false },
  { id: 23, code: '23', nameAr: 'عنابة', nameFr: 'Annaba', serviceAvailable: false },
  { id: 24, code: '24', nameAr: 'قالمة', nameFr: 'Guelma', serviceAvailable: false },
  { id: 25, code: '25', nameAr: 'قسنطينة', nameFr: 'Constantine', serviceAvailable: false },
  { id: 26, code: '26', nameAr: 'المدية', nameFr: 'Médéa', serviceAvailable: false },
  { id: 27, code: '27', nameAr: 'مستغانم', nameFr: 'Mostaganem', serviceAvailable: false },
  { id: 28, code: '28', nameAr: 'المسيلة', nameFr: "M'Sila", serviceAvailable: false },
  { id: 29, code: '29', nameAr: 'معسكر', nameFr: 'Mascara', serviceAvailable: false },
  { id: 30, code: '30', nameAr: 'ورقلة', nameFr: 'Ouargla', serviceAvailable: false },
  { id: 31, code: '31', nameAr: 'وهران', nameFr: 'Oran', serviceAvailable: false },
  { id: 32, code: '32', nameAr: 'البيض', nameFr: 'El Bayadh', serviceAvailable: false },
  { id: 33, code: '33', nameAr: 'إليزي', nameFr: 'Illizi', serviceAvailable: false },
  { id: 34, code: '34', nameAr: 'برج بوعريريج', nameFr: 'Bordj Bou Arréridj', serviceAvailable: false },
  { id: 35, code: '35', nameAr: 'بومرداس', nameFr: 'Boumerdès', serviceAvailable: false },
  { id: 36, code: '36', nameAr: 'الطارف', nameFr: 'El Tarf', serviceAvailable: false },
  { id: 37, code: '37', nameAr: 'تندوف', nameFr: 'Tindouf', serviceAvailable: false },
  { id: 38, code: '38', nameAr: 'تيسمسيلت', nameFr: 'Tissemsilt', serviceAvailable: false },
  { id: 39, code: '39', nameAr: 'الوادي', nameFr: 'El Oued', serviceAvailable: false },
  { id: 40, code: '40', nameAr: 'خنشلة', nameFr: 'Khenchela', serviceAvailable: false },
  { id: 41, code: '41', nameAr: 'سوق أهراس', nameFr: 'Souk Ahras', serviceAvailable: false },
  { id: 42, code: '42', nameAr: 'تيبازة', nameFr: 'Tipaza', serviceAvailable: false },
  { id: 43, code: '43', nameAr: 'ميلة', nameFr: 'Mila', serviceAvailable: false },
  { id: 44, code: '44', nameAr: 'عين الدفلى', nameFr: 'Aïn Defla', serviceAvailable: false },
  { id: 45, code: '45', nameAr: 'النعامة', nameFr: 'Naâma', serviceAvailable: false },
  { id: 46, code: '46', nameAr: 'عين تموشنت', nameFr: 'Aïn Témouchent', serviceAvailable: false },
  { id: 47, code: '47', nameAr: 'غرداية', nameFr: 'Ghardaïa', serviceAvailable: false },
  { id: 48, code: '48', nameAr: 'غليزان', nameFr: 'Relizane', serviceAvailable: false },
  { id: 49, code: '49', nameAr: 'تيميمون', nameFr: 'Timimoun', serviceAvailable: false },
  { id: 50, code: '50', nameAr: 'برج باجي مختار', nameFr: 'Bordj Badji Mokhtar', serviceAvailable: false },
  { id: 51, code: '51', nameAr: 'أولاد جلال', nameFr: 'Ouled Djellal', serviceAvailable: false },
  { id: 52, code: '52', nameAr: 'بني عباس', nameFr: 'Béni Abbès', serviceAvailable: false },
  { id: 53, code: '53', nameAr: 'عين صالح', nameFr: 'In Salah', serviceAvailable: false },
  { id: 54, code: '54', nameAr: 'عين قزام', nameFr: 'In Guezzam', serviceAvailable: false },
  { id: 55, code: '55', nameAr: 'توقرت', nameFr: 'Touggourt', serviceAvailable: false },
  { id: 56, code: '56', nameAr: 'جانت', nameFr: 'Djanet', serviceAvailable: false },
  { id: 57, code: '57', nameAr: 'المغير', nameFr: "El M'Ghair", serviceAvailable: false },
  { id: 58, code: '58', nameAr: 'المنيعة', nameFr: 'El Meniaa', serviceAvailable: false },
]

/** Communes for Adrar (wilaya 01) — the only service-available wilaya in MVP. */
export const ADRAR_COMMUNES: CommuneOption[] = [
  { wilayaId: 1, code: '0101', nameAr: 'أدرار', nameFr: 'Adrar' },
  { wilayaId: 1, code: '0102', nameAr: 'تامست', nameFr: 'Tamest' },
  { wilayaId: 1, code: '0103', nameAr: 'شروين', nameFr: 'Charouine' },
  { wilayaId: 1, code: '0104', nameAr: 'رقان', nameFr: 'Reggane' },
  { wilayaId: 1, code: '0105', nameAr: 'إنزغمير', nameFr: 'Inozghmir' },
  { wilayaId: 1, code: '0106', nameAr: 'تيت', nameFr: 'Tit' },
  { wilayaId: 1, code: '0107', nameAr: 'قصر قدور', nameFr: 'Ksar Kaddour' },
  { wilayaId: 1, code: '0108', nameAr: 'تسابيت', nameFr: 'Tsabit' },
  { wilayaId: 1, code: '0109', nameAr: 'تيمي', nameFr: 'Timi' },
  { wilayaId: 1, code: '0110', nameAr: 'أولاد أحمد تيمي', nameFr: 'Ouled Ahmed Timmi' },
  { wilayaId: 1, code: '0111', nameAr: 'بودة', nameFr: 'Bouda' },
  { wilayaId: 1, code: '0112', nameAr: 'أولف', nameFr: 'Aoulef' },
  { wilayaId: 1, code: '0113', nameAr: 'تيمقتن', nameFr: 'Timokten' },
  { wilayaId: 1, code: '0116', nameAr: 'سبع', nameFr: 'Sebaa' },
  { wilayaId: 1, code: '0117', nameAr: 'أولاد سعيد', nameFr: 'Ouled Saïd' },
  { wilayaId: 1, code: '0118', nameAr: 'زاوية كنتة', nameFr: 'Zaouiet Kounta' },
  { wilayaId: 1, code: '0119', nameAr: 'تيمياوين', nameFr: 'Timiaouine' },
  { wilayaId: 1, code: '0120', nameAr: 'أقبلي', nameFr: 'Aqbli' },
  { wilayaId: 1, code: '0121', nameAr: 'متاريف', nameFr: 'Metarfa' },
  { wilayaId: 1, code: '0122', nameAr: 'الفنوغيل', nameFr: 'Fenoughil' },
  { wilayaId: 1, code: '0123', nameAr: 'سالي', nameFr: 'Sali' },
  { wilayaId: 1, code: '0124', nameAr: 'أقادمي', nameFr: 'Akabli' },
  { wilayaId: 1, code: '0125', nameAr: 'سبخة الزوي', nameFr: 'Sebkhat Zoui' },
  { wilayaId: 1, code: '0126', nameAr: 'تنرقوق', nameFr: 'Tinerkouk' },
  { wilayaId: 1, code: '0127', nameAr: 'ديلدول', nameFr: 'Deldoul' },
  { wilayaId: 1, code: '0128', nameAr: 'سيدي عمر', nameFr: 'Sidi Aman' },
]

/** Helper — return all communes for the given wilaya id. */
export function getCommunesForWilaya(wilayaId: number): CommuneOption[] {
  if (wilayaId === 1) return ADRAR_COMMUNES
  // Other wilayas have no communes in the local dataset (not service-available
  // in MVP) — UI should block submission anyway.
  return []
}

export function getWilayaById(id: number): WilayaOption | undefined {
  return WILAYAS.find((w) => w.id === id)
}

/** Wilaya name in the active locale. */
export function wilayaName(w: WilayaOption, locale: 'ar' | 'fr'): string {
  return locale === 'ar' ? w.nameAr : w.nameFr
}

/** Commune name in the active locale. */
export function communeName(c: CommuneOption, locale: 'ar' | 'fr'): string {
  return locale === 'ar' ? c.nameAr : c.nameFr
}
