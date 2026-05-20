# Design System

The single source of truth for Crido's visual identity across the mobile app, admin dashboard, and vendor dashboard.

---

## 1. Brand identity

### Name
**Crido** (pronounced "creedo") — short, easy to remember in Arabic, French, and English. Not yet trademarked; assume available.

### Tagline
- Arabic: **قسّطها بسهولة** (Qassit-ha bisuhula — "Pay it in installments, easily")
- French: **Achetez maintenant, payez en plusieurs fois**

### Voice
- **Confident, friendly, simple.** Like a trusted local merchant.
- Avoid corporate-bank stiffness. Avoid hype/marketing fluff.
- Use direct sentences. Short paragraphs.
- Arabic: prefer **MSA-light** with Algerian familiarity ("شكراً" not "نعتذر لإزعاجك").
- French: standard polite French — no English loanwords where French exists.

---

## 2. Color system

### Primary
- **Crido Teal** `#0F6E56` — primary CTAs, brand color, active states
- Lighter teal `#1D9E75` — hover/secondary
- Lightest teal `#E1F5EE` — backgrounds, badges, soft surfaces
- Darkest teal `#04342C` — text on light teal backgrounds

### Semantic colors

| Purpose | Hex | Notes |
|---------|-----|-------|
| Success | `#1D9E75` | Same as light teal — payments verified, KYC approved |
| Warning | `#EF9F27` (amber) | Upcoming installments, mild issues |
| Danger | `#E24B4A` (red) | Defaults, rejections, errors |
| Info | `#378ADD` (blue) | Tips, neutral statuses |

### Neutrals (light mode)
- Background: `#FFFFFF`
- Surface (cards): `#FFFFFF` with `0.5px` border `#E5E5E0`
- Background secondary (page bg): `#F7F6F1`
- Text primary: `#1A1A18`
- Text secondary: `#5F5E5A`
- Text tertiary: `#888780`
- Border tertiary: `rgba(0,0,0,0.08)`
- Border secondary: `rgba(0,0,0,0.15)`

### Neutrals (dark mode)
- Background: `#1A1A18`
- Surface: `#222220`
- Text primary: `#F2EFE7`
- Text secondary: `#B4B2A9`
- Border tertiary: `rgba(255,255,255,0.08)`

### Don't
- Don't use pure black `#000` for text (too harsh)
- Don't use bright saturated colors (corporate financial = calm)
- Don't introduce a new brand color without updating this doc
- Don't use gradients (we are a flat, modern brand)

---

## 3. Typography

### Fonts

#### Mobile (Flutter)
- **Arabic:** `IBM Plex Sans Arabic` (Google Fonts)
- **Latin (French/English):** `Inter` (Google Fonts)
- Set per-locale automatically via `easy_localization`

#### Web (Dashboards)
- **Arabic:** `IBM Plex Sans Arabic` (load from Google Fonts CDN)
- **Latin:** `Inter` (load from Google Fonts CDN)
- Use CSS `font-family: 'IBM Plex Sans Arabic', 'Inter', system-ui, sans-serif`

### Sizes (web)

| Token | Size | Weight | Line height | Use |
|-------|------|--------|-------------|-----|
| `text-xs` | 12px | 400 | 1.5 | Small captions, badges |
| `text-sm` | 13px | 400 | 1.55 | Secondary info |
| `text-base` | 14px | 400 | 1.6 | Body text |
| `text-md` | 15px | 500 | 1.5 | Card titles |
| `text-lg` | 17px | 500 | 1.4 | Section headers |
| `text-xl` | 20px | 500 | 1.3 | Page titles |
| `text-2xl` | 24px | 500 | 1.25 | Big numbers (credit limit, total) |
| `text-3xl` | 32px | 500 | 1.2 | Dashboard hero numbers |

**Weights:** only `400` (regular) and `500` (medium). Never `600`/`700` — too heavy.

### Sizes (Flutter)

Use Material 3 type scale, customized:
- displayLarge: 32 (rare)
- displaySmall: 24
- titleLarge: 20
- titleMedium: 17
- titleSmall: 15
- bodyLarge: 14 (default body)
- bodyMedium: 13
- bodySmall: 12
- labelLarge: 14 (buttons)

---

## 4. Spacing scale

Use multiples of 4px:
```
xs:  4px
sm:  8px
md:  12px
base: 16px
lg:  20px
xl:  24px
2xl: 32px
3xl: 48px
```

In Tailwind: use standard spacing scale (`p-1` = 4px, `p-4` = 16px, etc.).

In Flutter: define `AppSpacing` in `core/theme/spacing.dart`.

---

## 5. Corners (border-radius)

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 6px | Small badges, pills |
| `radius-md` | 8px | Default buttons, inputs |
| `radius-lg` | 12px | Cards |
| `radius-xl` | 16px | Hero cards, sheets |
| `radius-2xl` | 20px | Phone container, large surfaces |
| `radius-full` | 9999px | Avatars, full pills |

Default for most components: `radius-md` (8px). For cards: `radius-lg` (12px).

---

## 6. Components

### Buttons

#### Primary
- Background: `#0F6E56` (Crido teal)
- Text: white
- Padding: 12px 24px
- Border-radius: 10px
- Font: 14px / 500
- Hover (web): darken to `#0C5B47`
- Active: scale 0.98

#### Secondary
- Background: transparent
- Border: 1px solid `#0F6E56`
- Text: `#0F6E56`
- Same padding/radius

#### Destructive
- Background: `#E24B4A`
- Text: white

#### Ghost
- Background: transparent
- Text: primary color
- Hover bg: `var(--color-background-secondary)`

#### Disabled
- Opacity 0.5, cursor not-allowed

### Cards
- Background: `--color-background-primary` (white in light)
- Border: 0.5px solid `--color-border-tertiary`
- Border-radius: 12px
- Padding: 16px–20px
- No shadow (flat design)

### Inputs
- Height: 40px (web), 48px (mobile)
- Border: 1px solid `--color-border-secondary`
- Border-radius: 8px
- Padding: 0 12px
- Font: 14px
- Focus: ring 2px `rgba(15, 110, 86, 0.2)` + border `#0F6E56`
- Error: border `#E24B4A`

### Badges (status pills)
- Padding: 4px 8px
- Border-radius: 6px
- Font: 11–12px / 500
- Color: text 800 stop / bg 50 stop (e.g., `bg-[#FAEEDA] text-[#854F0B]` for warning)

### Status badge color map

| Status | BG | Text |
|--------|----|----|
| `draft`, `pending` | gray-50 (`#F1EFE8`) | gray-800 (`#444441`) |
| `submitted`, `under_review` | blue-50 (`#E6F1FB`) | blue-800 (`#0C447C`) |
| `approved`, `verified`, `active`, `paid` | teal-50 (`#E1F5EE`) | teal-800 (`#085041`) |
| `late`, `documents_required` | amber-50 (`#FAEEDA`) | amber-800 (`#633806`) |
| `rejected`, `defaulted`, `missed` | red-50 (`#FCEBEB`) | red-800 (`#791F1F`) |
| `completed` | teal-100 (`#9FE1CB`) | teal-900 (`#04342C`) |
| `cancelled`, `expired` | gray-100 (`#D3D1C7`) | gray-800 (`#444441`) |

---

## 7. Iconography

### Web (Admin + Vendor dashboards)
Use **Lucide Icons** (`lucide-react`):
- Imports: `import { Home, Search, CreditCard, Bell, User, ChevronRight, ... } from 'lucide-react'`
- Default size: 20px (inline), 24px (decorative)
- Stroke width: 1.5

### Mobile (Flutter)
Use **Material Icons** (built-in) + **lucide_icons_flutter** package:
- Material for system icons (home, settings, search)
- Lucide for everything else (consistency with web)
- Default size: 22px

### Icon usage guidelines
- Use **outline** style only (no filled).
- Pair icons with text labels in most cases — icon-only only for top-bar actions (bell, search) or bottom nav.
- Never invent custom icons — pick from the libraries.

---

## 8. RTL (Right-to-Left) for Arabic

### Web
- Set `dir="rtl"` on `<html>` when `i18n.language === 'ar'`
- Use logical CSS properties:
  - `margin-inline-start` instead of `margin-left`
  - `padding-inline-end` instead of `padding-right`
- Tailwind 4 supports `me-`/`ms-`/`ps-`/`pe-` modifiers
- Icons that imply direction (arrows, chevrons) must flip — use `rtl:rotate-180` modifier

### Flutter
- Set `Directionality(textDirection: TextDirection.rtl, ...)` based on locale
- Or rely on `EasyLocalization` to handle this automatically per locale
- Use `EdgeInsetsDirectional` instead of `EdgeInsets` for spacing
- Use `AlignmentDirectional` instead of `Alignment`

### Mixed content (Arabic + numbers)
Arabic text with Western digits is **normal** and accepted. Don't try to convert digits to Arabic-Indic numerals — this is the Algerian convention.

Example (correct):
```
المبلغ: 200,000 دج
```

---

## 9. Layout — Mobile (Flutter)

### Bottom navigation (client app)
4 items, never more:
1. **الرئيسية** (Home) — icon: `home`
2. **بحث** (Search) — icon: `search`
3. **تمويلاتي** (My Financings) — icon: `credit-card`
4. **الحساب** (Account) — icon: `user`

Active item: teal `#0F6E56` icon + label.
Inactive: gray.

### App bar
- Background: white (or `--color-background-secondary` for nested screens)
- Height: 56dp
- Title: 18px / 500
- Back button: 24px chevron in primary text color
- Action icons on trailing (RTL: right side becomes "leading" actually — be careful)

### Card list pattern
Each item:
- Padding: 12px
- Border: 0.5px between items (no full border per item)
- Tap state: ripple in teal-50

---

## 10. Layout — Web dashboards (Admin + Vendor)

### Shell
- Left sidebar (RTL: right sidebar): 240px fixed
- Top bar: 60px high
- Content: max-width 1200px, auto-padding

### Sidebar
- Logo at top
- Nav items: 12px padding, 8px radius, hover bg `--color-background-secondary`
- Active item: teal-50 background + teal-800 text
- Icons: 18px, paired with label
- User info at bottom (avatar + name + logout)

### Top bar
- Page title (left in RTL = right)
- Right (in RTL = left): search, notifications, locale toggle, user menu

### Tables
- Header: bg `#F7F6F1`, text 12px / 500, all caps NO (we use sentence case)
- Row: 56px tall, hover bg `--color-background-secondary`
- Border: 0.5px between rows
- Action column: pinned to end (RTL: left side becomes end)

### Empty states
- Centered illustration (use Lucide icons, large 64px)
- Heading: "لا توجد عناصر بعد"
- Subtext: brief explanation
- CTA button if applicable

---

## 11. Logo

For MVP, use a simple wordmark in Crido Teal:

```
Crido
```

Font: **Inter** 600 (only place we allow 600 weight — for the logo itself).
Size variants: 24px, 32px, 48px.

A small mark/icon version:
- A "C" shape stylized as an arrow/swoosh
- Solid `#0F6E56`
- Designed later by a designer; placeholder is fine for MVP

---

## 12. Voice & content guidelines

### App copy patterns

#### Confirmation messages
✅ DO: "تم إرسال طلبك بنجاح" (Your request has been sent successfully)
❌ DON'T: "تم استلام طلبك وسيتم معالجته من قبل فريقنا في أقرب وقت ممكن" (too formal)

#### Error messages
✅ DO: "تعذّر تحميل الصورة. حاول مرة أخرى." (Couldn't upload the image. Try again.)
❌ DON'T: "An error occurred." (English fallback — translate everything)

#### Empty states
✅ DO: "ما عندك طلبات بعد. ابدأ بطلبك الأول من متجر." (You have no requests yet. Start your first one from a shop.)

### Numbers and money
- Use `,` for thousands in Arabic (Western convention common in Algeria)
- Use ` ` (space) for thousands in French
- Always with currency suffix: `200,000 دج` / `200 000 DZD`
- Big numbers: prefer the full number over abbreviations (`200,000` not `200K`)

### Dates
- Relative for recent: "منذ 5 دقائق", "أمس", "اليوم"
- Absolute for older: "15 مارس 2026"

---

## 13. Accessibility

- Color contrast: WCAG AA minimum (4.5:1 for body text)
- Touch targets: min 44×44 dp (Flutter), 40×40 px (web)
- Form labels: always visible, not just placeholders
- Error messages: linked to inputs with `aria-describedby`
- Focus states: visible 2px ring in teal for keyboard navigation
- Dynamic Type / system font scale: respect on mobile

---

## 14. Animation

- Subtle and purposeful only
- Duration: 200ms standard, 350ms for larger transitions
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard)
- No bounces, no springs (out of brand)
- Reduce motion: respect `prefers-reduced-motion`
