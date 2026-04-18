# Scratchpad — Frontend

Frontend'e özel yaşayan çalışma defteri. UI, component, i18n, theme, performans notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Backend notları → [`../server/SCRATCHPAD.md`](../server/SCRATCHPAD.md)
> Genel frontend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 7 arşivi: [`../docs/_archive/scratchpad-client-2026-04-19-phase-7.md`](../docs/_archive/scratchpad-client-2026-04-19-phase-7.md)

---

## Kullanım Kuralları

- Sadece **frontend-spesifik** notlar buraya. Backend'i etkileyen karar → kök scratchpad.
- Yeni component / sayfa başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Design system değişikliği → not al, sonra `client/CLAUDE.md` design system bölümünü güncelle.

---

## Şu An Üzerinde Çalışılan

- Phase 7 tamamlandı. Frontend tarafında Phase 8'e geçiş bekleniyor.
- **Phase 8 scope (frontend, taslak):** In-app messaging, mobile native (React Native veya PWA iOS+Android install prompt), payment e-Fatura UI, international i18n (EN marketing copy revise + de/fr opsiyonel), SUPER_ADMIN moderation paneli.

---

## UI Borçları (Phase 7 sonundan kalan)

- **TutorListPage auth gate** — `tutorService.match()` logged-out kullanıcı için 401 → login redirect. `isAuthenticated` gate + public preview mode (puan + konu + fiyat aralığı yeterli) Phase 8 başı.
- **Navbar overflow** — 16+ link 1440 viewport'ta cramped; Phase 7 smoke'ta "Tekrar" link'i cut off. Menu grouping ("Öğrenci" / "B2B" / "Araçlar") dropdown Phase 8.
- **Checkout iyzico iframe** — sandbox stub URL şu an basit `<iframe>`; gerçek iyzico'nun cross-origin + postMessage handshake'i Phase 8'de eklenecek.
- **MarkdownRenderer Suspense fallback** — 7.7'de lazy chunk, fallback `<div>{markdown}</div>` düz metin gösteriyor; Phase 8'de skeleton shimmer daha iyi olabilir.

---

## Performans Notları

- Phase 7 initial bundle ~44KB gzipped korundu (Phase 6 ile aynı). react-markdown 112KB/34KB gzipped ayrı chunk (7.7). remark-gfm 38KB/12KB ayrı.
- Client vite build süresi 665ms (Phase 6: ~670ms, değişmedi).
- Phase 7 yeni sayfalar (TutorList, TutorDetail, MarketplaceList, MarketplaceItem, HocaDashboard, UniversityAdmin, CheckoutPage, TutoringSession) hepsi lazy chunk — initial load etkilemiyor.

---

## Düşünceler / Keşifler

- RoleGuard + api.ts interceptor ikilisi: RoleGuard client-side flash engelliyor, interceptor 401 → /login redirect. İkisi bazen çakışıyor (auth gate eksik page'de). Phase 8'de tek protection katmanına indirmek düşünülebilir.
- PaymentBadge component 5 renk tonu kullanıyor (pending amber, succeeded emerald, failed red, refunded blue, disputed purple). Aynı palette Phase 8 moderation badge'lerinde reuse.
- TutorCard + CompatibilityScore kombini tutor listesinde çalışıyor; marketplace itemları aynı CompatibilityScore benzeri "buyer fit" skorunu Phase 8'de alabilir (DNA × item topic tag benzerliği).

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Frontend)

1. Phase 8 planı — mobile + messaging + moderation UI eksenleri.
2. TutorListPage auth gate fix (Phase 7 retro borç).
3. Navbar overflow / grouping (Phase 7 retro borç).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1-5 kapanışları arşive donduruldu. |
| 2026-04-19 | Phase 6 + Phase 7 kapanışı — içerik arşive donduruldu, Phase 8 için reset. |
