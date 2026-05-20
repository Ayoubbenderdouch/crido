# Dashboards — Shared Conventions (Admin + Vendor)

> **Read `../CLAUDE.md` and all of `../docs/` BEFORE touching this folder.**

This folder contains **two separate React applications** that share the same tech stack and design system:

- `admin/` — for Crido staff (KYC review, request approval, payouts, etc.)
- `vendor/` — for merchants (their requests, payouts, products, staff)

They are **two separate Vite apps** that live in `admin/` and `vendor/`. They share conventions defined here, but have independent `package.json`, `node_modules`, builds, and deployments.

> Don't try to merge them into a monorepo. Keep them separate for deployment simplicity.

---

## Tech stack (both apps)

| Concern | Choice |
|---------|--------|
| Build tool | **Vite 7** |
| Language | **TypeScript 5** (strict mode) |
| Framework | **React 19** |
| Routing | **React Router 7** (file-based via custom config — NOT Next.js) |
| Styling | **Tailwind CSS 4** |
| Components | **shadcn/ui** (manually copied components) |
| Icons | **lucide-react** |
| Forms | **react-hook-form** + **zod** |
| Data fetching | **TanStack Query v5** |
| State | TanStack Query + minimal **zustand** for global UI state only |
| HTTP | **Axios** instance with interceptors |
| i18n | **i18next** + **react-i18next** |
| Date | **dayjs** with `ar` and `fr` locales |
| Tables | **TanStack Table v8** |
| Charts | **Recharts** |
| Notifications | **sonner** (toasts) |
| Tests | **Vitest** + **React Testing Library** |
| Linting | **ESLint** (flat config) + **Prettier** |

> Do NOT use Next.js (we don't need SSR). Do NOT use Redux. Do NOT use Material UI or Chakra. Stick to this stack.

---

## Setup commands (run inside each app folder)

```bash
npm create vite@latest . -- --template react-ts
npm install

# Core
npm i react-router@7 axios @tanstack/react-query @tanstack/react-table
npm i react-hook-form zod @hookform/resolvers
npm i i18next react-i18next i18next-browser-languagedetector
npm i dayjs zustand lucide-react sonner recharts

# Tailwind 4
npm i -D tailwindcss @tailwindcss/vite
# Add to vite.config.ts: import tailwindcss from '@tailwindcss/vite'

# shadcn/ui — use the CLI to add components on demand
npx shadcn@latest init
# Then per-component: npx shadcn@latest add button card dialog input ...
```

After setup, configure `tailwind.config.ts`, `tsconfig.json` paths (`@/*`), and the i18n init.

---

## Shared folder structure inside each app

```
admin/ (or vendor/)
├── public/
├── src/
│   ├── main.tsx                  ← Entry: providers + router
│   ├── App.tsx
│   ├── routes.tsx                ← Route definitions
│   ├── env.ts                    ← Typed env access
│   ├── lib/
│   │   ├── api.ts                ← Axios instance
│   │   ├── queryClient.ts        ← TanStack Query setup
│   │   ├── i18n.ts               ← i18next init
│   │   ├── auth.ts               ← Token store, login/logout helpers
│   │   ├── format.ts             ← formatDzd, formatDate
│   │   ├── utils.ts              ← cn() etc.
│   │   └── constants.ts          ← Statuses, enums, route names
│   ├── components/
│   │   ├── ui/                   ← shadcn/ui primitives (button, card, etc.)
│   │   ├── layout/               ← AppShell, Sidebar, Topbar
│   │   ├── data/                 ← DataTable, EmptyState, StatusBadge
│   │   └── forms/                ← FormField, FileInput, etc.
│   ├── features/                 ← Feature folders (clients, financings, ...)
│   │   └── {feature}/
│   │       ├── api.ts            ← Query hooks for this feature
│   │       ├── types.ts          ← Type defs
│   │       ├── components/
│   │       └── pages/
│   ├── hooks/                    ← Cross-feature hooks
│   ├── i18n/
│   │   ├── ar.json
│   │   └── fr.json
│   └── styles/
│       └── globals.css           ← Tailwind directives + CSS vars
├── .env.example
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Coding conventions

### TypeScript
- `tsconfig.json` strict mode ON.
- Path alias `@/*` → `./src/*`.
- Use `type` for object shapes, `interface` only when extending or for class-like contracts.
- Never use `any`. Use `unknown` for "I don't know yet" and narrow with type guards.

### Components
- One component per file (default export).
- File name matches component name: `FinancingRequestCard.tsx`.
- Use function components with explicit return type only when complex.

```tsx
type Props = {
  request: FinancingRequest
  onConfirm?: () => void
}

export default function FinancingRequestCard({ request, onConfirm }: Props) {
  return <div className="rounded-lg border border-border bg-card p-4">...</div>
}
```

### Hooks
- Custom hooks live next to their feature: `features/clients/api.ts` exports `useClients`, `useClient(id)`, `useApproveKyc()`.
- TanStack Query hooks naming:
  - Queries: `useClients`, `useClient(id)`
  - Mutations: `useApproveKyc()`, `useUpdateClient(id)`

```tsx
// features/clients/api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useClients(params: ClientsFilters) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: async () => (await api.get('/admin/clients', { params })).data,
  })
}

export function useApproveKyc() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, creditLimit }: { id: number; creditLimit?: number }) =>
      api.post(`/admin/clients/${id}/kyc/approve`, { credit_limit_dzd: creditLimit }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['client', id] })
    },
  })
}
```

### API client (Axios)

```tsx
// lib/api.ts
import axios from 'axios'
import { getToken, clearToken } from './auth'
import i18n from './i18n'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['Accept-Language'] = i18n.language
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
```

### Forms (react-hook-form + zod)

```tsx
const schema = z.object({
  product_name: z.string().min(2),
  product_amount_dzd: z.number().min(10000).max(500000),
  plan_id: z.number(),
})

type FormValues = z.infer<typeof schema>

export default function NewRequestForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

### Internationalization

```tsx
// i18n/ar.json
{
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "approve": "موافقة",
    "reject": "رفض"
  },
  "financingRequests": {
    "title": "طلبات التمويل",
    "empty": "لا توجد طلبات بعد"
  }
}

// Component
const { t } = useTranslation()
<h1>{t('financingRequests.title')}</h1>
```

### RTL handling

```tsx
// In main.tsx or a Locale provider:
useEffect(() => {
  document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = i18n.language
}, [i18n.language])
```

Tailwind: use logical properties (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`) instead of `ml-`/`mr-`/etc.

### Status badges

```tsx
// components/data/StatusBadge.tsx
const STATUS_MAP: Record<string, { bg: string; text: string; labelKey: string }> = {
  approved: { bg: 'bg-[#E1F5EE]', text: 'text-[#085041]', labelKey: 'status.approved' },
  rejected: { bg: 'bg-[#FCEBEB]', text: 'text-[#791F1F]', labelKey: 'status.rejected' },
  // ...
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.default
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {t(cfg.labelKey)}
    </span>
  )
}
```

### Tables (TanStack Table)
- Use `DataTable` wrapper component for consistency.
- Column definitions per feature.
- Server-side pagination via URL params + TanStack Query.

### Formatters

```tsx
// lib/format.ts
export function formatDzd(amount: number, locale: 'ar' | 'fr' = 'ar'): string {
  const n = new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ').format(amount)
  return locale === 'ar' ? `${n} دج` : `${n} DZD`
}

export function formatDate(iso: string, locale: 'ar' | 'fr' = 'ar'): string {
  return dayjs(iso).locale(locale === 'ar' ? 'ar-dz' : 'fr').format('DD MMMM YYYY')
}
```

### Theme — CSS variables

In `src/styles/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Brand */
  --color-primary: #0F6E56;
  --color-primary-hover: #0C5B47;
  --color-primary-fg: #FFFFFF;
  
  /* Semantic */
  --color-success: #1D9E75;
  --color-warning: #EF9F27;
  --color-danger: #E24B4A;
  --color-info: #378ADD;
  
  /* Neutrals — light */
  --color-background: #FFFFFF;
  --color-background-secondary: #F7F6F1;
  --color-foreground: #1A1A18;
  --color-foreground-secondary: #5F5E5A;
  --color-border: rgba(0, 0, 0, 0.08);
  --color-card: #FFFFFF;
  
  /* Spacing extras already covered by Tailwind defaults */
  
  /* Fonts */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-arabic: 'IBM Plex Sans Arabic', 'Inter', system-ui, sans-serif;
}

html[dir="rtl"] {
  --font-sans: var(--font-arabic);
}

body {
  font-family: var(--font-sans);
  background: var(--color-background-secondary);
  color: var(--color-foreground);
}
```

---

## Environment variables

`.env.example`:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Crido Admin
VITE_DEFAULT_LOCALE=ar
```

Access via `import.meta.env.VITE_API_BASE_URL` (typed in `src/env.ts`).

---

## Commit / dev conventions

- Branches: `feat/<feature>`, `fix/<thing>`, `refactor/<area>`
- Don't commit `node_modules/`, `dist/`, `.env`
- Run `npm run lint` and `npm run typecheck` before commits

---

## Don't do

- ❌ Don't use Next.js (we don't need SSR/SSG for these dashboards)
- ❌ Don't use MUI, Chakra, Ant Design, etc. — only shadcn/ui
- ❌ Don't use Redux — TanStack Query + zustand is enough
- ❌ Don't use moment.js — dayjs only
- ❌ Don't put business logic in components — use hooks
- ❌ Don't hard-code English strings — translate everything
- ❌ Don't use `ml-`/`mr-` Tailwind classes — use logical `ms-`/`me-` for RTL safety
