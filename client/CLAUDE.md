# ProfAI — Frontend Rehberi

Bu dosya `client/` altında çalışırken yüklenir. Genel proje bağlamı için: [`../CLAUDE.md`](../CLAUDE.md).

**Scratchpad (her session başı oku, her session sonu güncelle):**
- [`./SCRATCHPAD.md`](./SCRATCHPAD.md) — frontend-özel çalışma defteri
- [`../SCRATCHPAD.md`](../SCRATCHPAD.md) — kök / cross-cutting
- [`../server/SCRATCHPAD.md`](../server/SCRATCHPAD.md) — backend tarafında neler olduğunu bilmek için

---

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (CSS variable tabanlı tokens — `tailwind.config.js`)
- **Framer Motion** (micro-interactions), **Recharts** (pie/bar/line)
- **react-i18next** (TR + EN, browser detector, default EN)
- **BoringAvatars** (avatar üretimi)
- **Axios** (`services/api.ts` — JWT interceptor)

---

## Dosya Organizasyonu

```
client/src/
├── main.tsx                   ← entry; i18n + ThemeProvider wrap
├── App.tsx                    ← router
├── index.css                  ← Tailwind + theme CSS variables (light/dark)
├── components/                ← atomic + composite UI
│   ├── Avatar.tsx, AnalysisCard.tsx, CityPills.tsx, …
│   └── ProtectedRoute.tsx     ← auth guard
├── pages/                     ← route-level components
│   ├── HomePage.tsx, ProfessorListPage.tsx, ProfessorDetailPage.tsx
│   └── LoginPage.tsx, RegisterPage.tsx, UploadPage.tsx, DashboardPage.tsx
├── services/                  ← API istemcileri (axios)
│   ├── api.ts                 ← base axios instance + token injection
│   └── {auth,professor,course,exam,rating}Service.ts
├── context/                   ← React Context
│   └── ThemeContext.tsx       ← light/dark, localStorage persist
├── i18n/                      ← react-i18next
│   ├── index.ts               ← init, detector, fallback
│   └── locales/{tr,en}.json
├── lib/                       ← pure helpers (no React)
│   └── utils.ts               ← cn(), formatters
└── types/                     ← shared TS types
```

**Pattern:** yeni sayfa ekleniyor → `pages/` altına; shared UI parçası → `components/`; API çağrısı → `services/`; pure helper → `lib/`.

---

## Design System

- **Palette:** Edu-premium violet primary (`#7C3AED`). Tüm renkler CSS variable olarak `index.css`'te tanımlı — light + dark için ayrı set.
- **Tipografi:** `Inter` (body), `Plus Jakarta Sans` (display).
- **Tokens:** `tailwind.config.js` içindeki `colors.primary`, `colors.surface`, `colors.border`, `colors.text-*` hepsi CSS variable referansı. Hardcoded hex kullanma.
- **Karanlık mod:** `<html class="dark">` toggle; `ThemeContext` `localStorage.theme`'i yönetir.
- **Motion:** Framer Motion ile kartlarda `whileHover`, sayfa geçişlerinde `initial/animate`. Abartma — eğitim tonu.

---

## i18n Kuralları

- **Key dili:** İngilizce, nokta notasyonu (`nav.signIn`, `home.hero.title`).
- **Çeviri dosyaları:** `src/i18n/locales/{tr,en}.json`. Yeni key → **her iki** dosyaya ekle.
- **Varsayılan:** EN (browser TR ise TR otomatik seçilir); fallback EN.
- **Dinamik içerik:** `{count}`, `{name}` interpolasyonu kullan, string concat yapma.
- **Kullanıcıya görünen her string çeviriden geçer** — `aria-label`, `title`, `placeholder` dahil.

---

## State ve Data Flow

- **Auth token:** `localStorage.token`; `api.ts` interceptor ile her request'e eklenir.
- **URL state:** Liste sayfaları (ProfessorList) query param'larla senkron (`?q=`, `?city=`, `?sort=`, `?page=`). React Router `useSearchParams`.
- **Global state:** Sadece theme ve i18n context. Redux/Zustand henüz gerek yok.
- **Server state:** Ayrı bir lib yok (TanStack Query değerlendir Phase 2+). Şimdilik `useEffect` + local state.

---

## Performans Konvansiyonları

- **Code split:** Route-level lazy henüz yok; Phase 2+'da eklenebilir.
- **Liste sayfalarında pagination** (default 20, max 200). Sonsuz scroll henüz yok.
- **Resim/asset:** BoringAvatars client-side SVG üretir; hoca resmi için placeholder kullan.
- **Recharts:** Dynamic import henüz yok — gerekirse sonra.

---

## Dev Komutları

```bash
cd client
npm install
npm run dev           # Vite dev, port 3001
npm run build         # production build
npm run preview       # built artifact preview
npm run lint          # ESLint
```

Docker ile (önerilen): `docker compose up -d client`.

---

## Konvansiyonlar

- **Dosya isimlendirme:** Component `PascalCase.tsx`, hook `useCamelCase.ts`, util `camelCase.ts`.
- **Component pattern:** Default export yerine **named export** tercih et (kolay refactor).
- **Prop types:** `interface ComponentNameProps` — `type` yerine `interface`.
- **Server response tipi:** Backend'den gelen shape'i `types/` altına koy; service dosyasında `as ResponseType` cast et.
- **Form:** Controlled inputs, validation client-side + backend hata mesajı i18n ile çevrilir.
- **Accessibility:** Her `<button>`'da aria, `<input>`'ta `id/htmlFor`, focus state görünür.

---

## Önemli Linkler

- Genel proje rehberi: [`../CLAUDE.md`](../CLAUDE.md)
- Backend API kontratı: [`../server/CLAUDE.md`](../server/CLAUDE.md)
- Mevcut mimari: [`../docs/architecture/current-stack.md`](../docs/architecture/current-stack.md)
- Aktif faz (Phase 1 UI değişiklikleri): [`../docs/roadmap/phase-1-style-profile.md`](../docs/roadmap/phase-1-style-profile.md)
- Performans hedefleri: [`../docs/architecture/performance-targets.md`](../docs/architecture/performance-targets.md)
- Demo senaryosu (UI gösterim sırası): [`../docs/operations/demo-plan.md`](../docs/operations/demo-plan.md)

---

## Yapma!

- Hardcoded renk/font — CSS variable veya Tailwind token kullan.
- Sadece TR veya sadece EN bir string — ikisi de güncellenir.
- `any` tipinde API response — backend tipini import et veya yaz.
- Route-level component'ı `components/` altına koymak — `pages/` altına.
- `npm install` ile yeni dependency eklerken danışmadan — paket büyüklüğü önemli.
