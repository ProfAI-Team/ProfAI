# Scratchpad — Frontend

Frontend'e özel yaşayan çalışma defteri. UI, component, i18n, theme, performans notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Backend notları → [`../server/SCRATCHPAD.md`](../server/SCRATCHPAD.md)
> Genel frontend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 6 arşivi: [`../docs/_archive/scratchpad-client-2026-04-19-phase-6.md`](../docs/_archive/scratchpad-client-2026-04-19-phase-6.md)

---

## Kullanım Kuralları

- Sadece **frontend-spesifik** notlar buraya. Backend'i etkileyen karar → kök scratchpad.
- Yeni component / sayfa başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Design system değişikliği → not al, sonra `client/CLAUDE.md` design system bölümünü güncelle.

---

## Şu An Üzerinde Çalışılan

- Phase 6 tamamlandı. Frontend tarafında Phase 7'ye geçiş bekleniyor.
- **Phase 7 scope (frontend):** B2B onboarding akışı, üniversite admin paneli, marketplace listeleme + satın alma flow, payment UI, tutor profil + eşleştirme.

---

## Phase 7 Hazırlık Notları

- **Bundle size:** Phase 6 sonu initial ~44KB gzipped + KaTeX 77KB ayrı chunk (sadece OCR). Phase 7 payment form + marketplace grid Stripe elements getirebilir — Stripe JS 60KB gzipped, ayrı chunk'ta tutulmalı.
- **Shared components (Phase 6'dan):** `VoiceRecorder`, `TranscriptView`, `CameraCapture`, `LatexRenderer`, `PushPermissionCard`. Phase 7 tutor matching için `CompatibilityScore` + `TutorCard` + `PaymentBadge` component'leri gerekir.
- **i18n:** 653 key parity TR↔EN. Phase 7 `b2b.*` / `marketplace.*` / `payment.*` / `tutor.*` namespace için sweep pattern hazır.

---

## Düşünceler / Keşifler

- Phase 6 `ThemeContext` evaluate ile flip edilemedi — Playwright smoke'ta light mode toggle için butona click gerekiyor. Phase 7 smoke template'i buna göre düzenlenecek.
- KaTeX CSS dynamic import pattern (6.17) Phase 7 math formülleri (tutoring session) için reuse. İlk render sonrası CSS cache'li.
- `PushPermissionCard` "not-configured" branşı VAPID env eksikse göze hoş görünüyor — Phase 7 benzer "setup incomplete" card'ları için pattern.

---

## UI Borçları (Geçmiş Fazlardan)

- **TanStack Query session page entegrasyonu** — Phase 3'teki `MockExamSessionPage` hâlâ localStorage + useState ile gidiyor. Phase 7'de tutor oturumları için aynı pattern gerekir, migrate et.
- **Light mode Playwright smoke** — `document.documentElement.classList.remove('dark')` yetersiz. Theme toggle butonuna click ile test et.
- **VoteButtons 47KB** — react-markdown + remark-gfm import'ları hâlâ şişik. Phase 7'de tutoring review render ederse fırsat.

---

## Performans Notları

- Phase 6 sonu initial ~44KB gzipped (Phase 5'ten ~4KB artış, dashboard quick actions + Phase 6 sayfaların lazy import lagging bundle sürükleme).
- Chunks: KaTeX 77KB (OCR), Recharts 94KB (dashboard + DNA), VoteButtons 47KB (mock exam).
- Playwright visual smoke: 9 screenshot (1440 + 390), 0 gerçek bug (1 bug anında fix'lendi: /api/health 401).
- TanStack Query staleTime'ları: OCR 30s, voice usage 15s (streaming sırasında auto-refetch 30s).

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Frontend)

1. Phase 7 breakdown'da frontend işlerinin sırası.
2. Stripe JS / TR payment gateway entegrasyonu (İyzico?) değerlendirilmeli.
3. Tutor card grid layout — ProfessorCard pattern'i reuse.
4. Marketplace liste sayfası pagination + filter (ProfessorListPage pattern'i).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1-5 kapanışları arşive donduruldu. |
| 2026-04-19 | Phase 6 kapanışı — içerik arşive donduruldu, Phase 7 için reset. |
