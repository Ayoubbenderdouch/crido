# Crido Landing — Tamara-Inspired Redesign Plan

## 1. Vision

We're keeping Crido's distinctive dark-teal interactive hero, but adopting Tamara's information density and structure — adding 3 new sections (App Showcase, Categories, Customer Stories) and refactoring 3 existing sections (Why Crido, Merchants, Footer) for a 5-column Tamara-style footer + bigger benefit cards + sticky download banner. The redesign keeps Crido's voice (Murabaha, Adrar-first, no-interest) while matching Tamara's polish through richer imagery, a clearer download flow, and a tighter editorial rhythm.

---

## 2. Final Section Order

1. **Sticky Nav** — current `Nav`, lightly polished. Keep.
2. **Hero** — current `Hero` (dark teal + interactive financing card). Add hero illustration **P01** on the right, behind the card on tablet+.
3. **Trust Strip** — NEW thin horizontal bar: "بدون فوائد" + "متوافق مع الشريعة" + "موافقة سريعة" + "أدرار" with small inline icons.
4. **App Showcase** — NEW. Three floating phone mockups (**P02–P04**) + download CTA + App Store / Play Store badges.
5. **How It Works** — refactor. Place illustrations **P06–P09** inside each of the 4 step cards.
6. **Categories** — NEW. "اشترِ من جميع الأقسام" — 6-tile category grid using **P10** sub-images.
7. **Two Paths** — current `TwoPaths`. Keep, light polish on dividers/spacing.
8. **Why Crido** — refactor to 6 benefit cards with icon illustrations **P11**.
9. **Plans** — current `Plans`. Keep.
10. **Customer Story** — NEW. Real-world example "أيوب اشترى iPhone 16 بـ 19,166 دج/شهر" with small **P01** character on the left.
11. **For Merchants** — refactor `MerchantBand`. Add merchant scene **P12** and turn into a full CTA section.
12. **Adrar Section** — NEW. "نبدأ من أدرار" with **P13** illustration + minimal map + "soon to other wilayas" note.
13. **FAQ** — refactor accordion (smoother motion, 8 questions, Tamara-style typography).
14. **Footer** — refactor to 5-column Tamara-style: brand + product + company + legal + socials/app-badges.
15. **Sticky Download Banner** — NEW. Appears on scroll, dismissable; "حمّل التطبيق الآن" with iOS / Android buttons.

---

## 3. Per-Section Visual Brief

| # | Section | Background | Image | Component | Layout | CTA |
|---|---------|------------|-------|-----------|--------|-----|
| 1 | Nav | translucent cream | none | `Nav.tsx` | sticky bar, logo left, links center, "حمّل التطبيق" right | Download |
| 2 | Hero | deep teal | P01 | `Hero.tsx` | 2-col: text + interactive financing card; P01 illustration behind card on the right | "اطلب التمويل" + "حمّل التطبيق" |
| 3 | Trust Strip | cream | inline icons | `TrustStrip.tsx` | single row, 4 inline pills with icon + label | none |
| 4 | App Showcase | soft teal gradient | P02, P03, P04 | `AppShowcase.tsx` | 2-col: copy + 3 staggered floating phones | App Store + Play Store |
| 5 | How It Works | cream | P06–P09 | `HowItWorks.tsx` | 4 cards, each with illustration on top, step number, title, body | none |
| 6 | Categories | white | P10 (6 sub-images) | `Categories.tsx` | 6-tile responsive grid; tile = image + label | "تصفّح الكل" |
| 7 | Two Paths | cream | none | `TwoPaths.tsx` | 2 side-by-side cards (Partner vs Ad-hoc) | none |
| 8 | Why Crido | white | P11 (6 icons) | `WhyCrido.tsx` | 3x2 benefit grid, big icon + headline + body | none |
| 9 | Plans | cream | none | `Plans.tsx` | 3 plan cards (4 / 6 / 12 months) | "ابدأ الآن" |
| 10 | Customer Story | deep teal | P01 small | `CustomerStory.tsx` | quote-style card + character on left, breakdown numbers on right | "احسب قسطك" |
| 11 | For Merchants | white | P12 | `MerchantBand.tsx` | 2-col: copy + merchant scene illustration | "كن شريكاً" |
| 12 | Adrar Section | cream | P13 | `AdrarSection.tsx` | 2-col: copy + Adrar illustration with subtle map background | "اعرف المزيد" |
| 13 | FAQ | white | none | `Faq.tsx` | single column accordion, 8 items | "اسألنا" |
| 14 | Footer | deep teal | logo + store badges | `Footer.tsx` | 5 columns + bottom legal row | App badges |
| 15 | Sticky Banner | dark teal blur | mini app icon | `StickyDownloadBanner.tsx` | fixed bottom bar, dismiss "x" + 2 buttons | iOS + Android |

---

## 4. Image-to-Section Mapping

| Image | File Name | Goes To | Position | Component File |
|-------|-----------|---------|----------|----------------|
| P01 | `hero-character.png` | Hero | Right column, behind financing card on tablet+, hidden on mobile | `Hero.tsx` |
| P01 (sm) | `hero-character.png` | Customer Story | Left side, small variant | `CustomerStory.tsx` |
| P02 | `app-screen-home.png` | App Showcase | Left phone frame | `AppShowcase.tsx` |
| P03 | `app-screen-installments.png` | App Showcase | Center phone frame (front) | `AppShowcase.tsx` |
| P04 | `app-screen-merchant.png` | App Showcase | Right phone frame | `AppShowcase.tsx` |
| P05 | `app-icon.png` | Sticky Banner | Mini icon next to text | `StickyDownloadBanner.tsx` |
| P06 | `step-browse.png` | How It Works | Card 1 illustration | `HowItWorks.tsx` |
| P07 | `step-choose-plan.png` | How It Works | Card 2 illustration | `HowItWorks.tsx` |
| P08 | `step-confirm.png` | How It Works | Card 3 illustration | `HowItWorks.tsx` |
| P09 | `step-pay-monthly.png` | How It Works | Card 4 illustration | `HowItWorks.tsx` |
| P10 | `categories-grid.png` (6 sub) | Categories | One per tile | `Categories.tsx` |
| P11 | `benefits-icons.png` (6 sub) | Why Crido | One per benefit card | `WhyCrido.tsx` |
| P12 | `merchant-scene.png` | For Merchants | Right column illustration | `MerchantBand.tsx` |
| P13 | `adrar-illustration.png` | Adrar Section | Right column with map backdrop | `AdrarSection.tsx` |
| P14 | `app-store-badge.svg` | App Showcase + Footer + Sticky | Standard badge | multi |
| P15 | `play-store-badge.svg` | App Showcase + Footer + Sticky | Standard badge | multi |

---

## 5. New Components to Create

- `TrustStrip.tsx` — 4-pill horizontal trust bar under hero.
- `AppShowcase.tsx` — 3 floating phones with parallax float animation + download CTAs.
- `Categories.tsx` — responsive 6-tile category grid.
- `CustomerStory.tsx` — narrative card with real-world example numbers.
- `AdrarSection.tsx` — Adrar-first messaging with map backdrop.
- `StickyDownloadBanner.tsx` — scroll-triggered, dismissable bottom banner.

---

## 6. Existing Components to Refactor

- `Hero.tsx` — add hero illustration P01 on the right side (tablet+).
- `HowItWorks.tsx` — embed P06–P09 illustrations inside each step card.
- `WhyCrido.tsx` — expand to 6 benefit cards using P11 icon set.
- `MerchantBand.tsx` — add merchant scene P12; expand to a full CTA section with side copy.
- `Faq.tsx` — polish accordion (smoother open/close, better type scale, 8 questions).
- `Footer.tsx` — 5-column Tamara-style: brand, product, company, legal, social + app badges.

---

## 7. Responsive Notes

- **Mobile (<768px):** single column everywhere; hero illustration hides; sticky download banner becomes prominent; categories collapse to 2 columns; phones in App Showcase stack vertically.
- **Tablet (768–1024px):** two-column layouts; hero illustration visible but smaller; categories 3 columns; benefits 2 columns.
- **Desktop (>1024px):** full Tamara structure; categories 3x2 or 6x1; benefits 3x2; App Showcase 3 phones side-by-side staggered.

---

## 8. Animation Cues

- Reuse existing `Reveal` component for fade-in-on-scroll on all new sections.
- New: subtle parallax / `floaty` keyframe variant on App Showcase phones (independent offsets).
- New: counter animation on Customer Story numbers (if scrolled into view).
- Keep existing `floaty`, `glow-pulse`, `rise` keyframes — extend them, don't replace.
- Sticky banner: slide up from bottom with 200ms ease-out when scroll > 600px.

---

## 9. RTL Handling Notes

- All directional spacing uses logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) — already in place.
- Icons with direction (arrows, chevrons, "next" indicators) flip via `[dir=rtl]` selectors.
- Phone mockups in App Showcase: stagger order mirrors in RTL so the "front" phone sits on the visually-leading side.
- FAQ chevrons flip; Footer column order preserved (read order is column-by-column, not directional).

---

## 10. Timeline

- **Phase 1 (now):** Scaffold all new sections with placeholders, refactor `Faq.tsx` + `Footer.tsx`, wire `StickyDownloadBanner.tsx`. No images required.
- **Phase 2 (after user provides P01–P15):** Drop images into their slots per Section 4 table; polish spacing, shadows, and float offsets.
- **Phase 3:** Cross-test mobile + tablet + desktop in both RTL (ar) and LTR (fr); verify all CTAs route correctly; verify sticky banner dismiss persistence.
