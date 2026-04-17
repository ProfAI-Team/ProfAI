# Scratchpad — Frontend

Frontend'e özel yaşayan çalışma defteri. UI, component, i18n, theme, performans notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Backend notları → [`../server/SCRATCHPAD.md`](../server/SCRATCHPAD.md)
> Genel frontend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 1 arşivi: [`../docs/_archive/scratchpad-client-2026-04-17.md`](../docs/_archive/scratchpad-client-2026-04-17.md)

---

## Kullanım Kuralları

- Sadece **frontend-spesifik** notlar buraya. Backend'i etkileyen karar → kök scratchpad.
- Yeni component / sayfa başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Design system değişikliği → not al, sonra `client/CLAUDE.md` design system bölümünü güncelle.
- Tasarım kararı netleştiğinde: ilgili `docs/architecture/` veya `client/CLAUDE.md`'ye taşı.

---

## Şu An Üzerinde Çalışılan

- Phase 1 tamamlandı. Frontend tarafında Phase 2'ye geçiş bekleniyor.
- **Phase 2 scope (frontend kısmı):** `/upload-notes` sayfası, multi-file upload, `/study-pack/:id` sayfası (3 tab: özet / pratik sorular / hoca trick'leri).

---

## Phase 2 Hazırlık Notları

- **Study Pack UI** tab yapısı — `Tabs` component'i yok, yeni yazılacak (headlessui benzeri accessible pattern).
- **Markdown render** — study pack summary markdown → `marked` veya `react-markdown` kullan. Pre-existing dep yok.
- **File upload multi** — `UploadPage` pattern'ini genişlet, drag-drop + preview.
- **Practice questions UI** — her soru için "Cevabı göster" accordion. `<details>` yeterli olur.

---

## Düşünceler / Keşifler

- Phase 1'de `copy-tone-guide.md` kuruldu. Phase 2 UI copy'si bu rehbere göre yazılacak — aynı ton.
- `StyleProfile` types'ı `professorService.ts` içinde, Phase 2 StudyPack types'ı benzer pattern izlemeli.

---

## UI Borçları (Geçmiş Fazlardan — Phase 2+ değerlendir)

- **TanStack Query yok**, `useEffect + useState` devam. Phase 2'de study pack + study pack generation aynı anda birden fazla state yönetilecek — TanStack Query ekleme kararı verilmeli.
- **Route-level code split** yok. Phase 3+ bundle büyüyünce değerlendir.
- **Recharts bundle ağır** (~80KB gzip). Phase 2'de study pack'ta grafik yoksa tree-shake etkili mi kontrol et.

---

## Performans Notları

- Phase 1 endpoint'leri: cache hit 2-5ms, cache miss 1.44sn. Phase 2 study pack üretimi: ~30sn (Gemini + markdown). Async generation + progress UI gerekecek.
- Bundle analiz henüz yapılmadı — Phase 2 sonu öncelik.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Frontend)

1. Phase 2 task breakdown'da frontend işlerinin sırası: 2.7+ (genelde backend+data önce, UI sonra).
2. Tabs component pattern belirle.
3. Markdown dep (`react-markdown` önerisi).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik arşive donduruldu, Phase 2 için reset. |
