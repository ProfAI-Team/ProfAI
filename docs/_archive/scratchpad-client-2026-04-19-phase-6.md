# Scratchpad — Frontend

Frontend'e özel yaşayan çalışma defteri. UI, component, i18n, theme, performans notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Backend notları → [`../server/SCRATCHPAD.md`](../server/SCRATCHPAD.md)
> Genel frontend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 5 arşivi: [`../docs/_archive/scratchpad-client-2026-04-17-phase-5.md`](../docs/_archive/scratchpad-client-2026-04-17-phase-5.md)

---

## Kullanım Kuralları

- Sadece **frontend-spesifik** notlar buraya. Backend'i etkileyen karar → kök scratchpad.
- Yeni component / sayfa başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Design system değişikliği → not al, sonra `client/CLAUDE.md` design system bölümünü güncelle.
- Tasarım kararı netleştiğinde: ilgili `docs/architecture/` veya `client/CLAUDE.md`'ye taşı.

---

## Şu An Üzerinde Çalışılan

- Phase 5 tamamlandı. Frontend tarafında Phase 6'ya geçiş bekleniyor.
- **Phase 6 scope (frontend kısmı):** Voice tutor UI (mic + waveform + transcript), OCR upload flow (kamera/görsel seçici), mobile-friendly multimodal surface.

---

## Phase 6 Hazırlık Notları

- **Bundle size durumu:** initial ~40KB gzipped (Phase 5 sonu, vite 8 tree-shake sayesinde Phase 4'ten ~130KB düştü). Phase 6 voice/audio + MediaRecorder + waveform component'leri bu hediyeyi tüketecek — her audio comp ayrı chunk olmalı.
- **TanStack Query çok olgun:** Phase 5'te optimistic mutation + rollback + invalidate hiyerarşisi 5+ sayfada reuse edildi. Voice tutor'da real-time transcript için daha kompleks — `useInfiniteQuery` + WebSocket veya SSE değerlendirilmeli.
- **Shared components hazır:** `DNARadar` lazy, `ConfidenceHeatmap`, `ReviewCard`, `GpaCalculator`, `InsufficientDataBanner`, `PremiumLockCard`. Phase 6 voice + OCR için yeni component'ler olacak (`VoiceRecorder`, `TranscriptView`, `CameraCapture`).
- **i18n envanteri:** 549 key parity TR↔EN (Phase 4: 447 → Phase 5: 549, +102 key). Phase 6 `voice.*` / `ocr.*` / `multimodal.*` için sweep pattern hazır.

---

## Düşünceler / Keşifler

- Phase 5'te `React.lazy` + `Suspense` + ayrı skeleton file pattern (EvolutionChart + StyleHero + AnalysisCard) Recharts'ı 97KB'dan ayrı chunk'a çıkardı. Phase 6'da voice waveform'a aynı pattern — `VoiceRecorder` heavy audio lib'i ayrı chunk'ta.
- `Tabs` component'i (Credit + Grades + Reviews sayfalarında kullanıldı) simple CSS yaklaşım — Phase 6 voice session tab'larında da reuse.
- `AxiosError<{error: {code, message}}>` typing pattern (Phase 5'te CourseAdvisor page'te ilk kez kullanıldı) — 402/403 branch'i doğru render ettirdi. Phase 6 premium gated endpoint'lerde aynı pattern.

---

## UI Borçları (Geçmiş Fazlardan)

- **TanStack Query session page entegrasyonu** — Phase 3'teki `MockExamSessionPage` hâlâ localStorage + useState ile gidiyor. Phase 5'te dokunulmadı; Phase 6 voice session şablonu gerekecekse migrate edilmeli.
- **`ProfessorDetailPage` 24KB** (Phase 5'te 114 → 24 düştü, Recharts lazy) — daha inebilir: EvolutionChart skeleton duplicate'i + AnalysisCard içerik. Phase 6'da dokunulursa temizlenir.
- **`VoteButtons` 47KB gzipped** — react-markdown + remark-gfm import'ları nedeniyle şişik. Phase 4'ten beri bu. Phase 6'da voice transcript markdown işlerse fırsat.

---

## Performans Notları

- Phase 5 sonu initial chunk ~40KB gzipped (Phase 4'ten ~130KB düşüş, vite 8 tree-shake).
- Recharts 94KB ayrı chunk (`generateCategoricalChart-*.js`); ProfessorDetail + DNA profile + grades simulator sadece o sayfa açıldığında yükler.
- Playwright visual smoke 6 senaryo, 0 bug.
- TanStack Query staleTime'ları: DNA 60s, grades 30s, confidence 60s, weakest 5min, reviews 60s.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Frontend)

1. Phase 6 breakdown'da frontend işlerinin sırası (muhtemelen 6.14+).
2. MediaRecorder / getUserMedia browser compatibility kontrolü (mobile Safari quirks).
3. Voice transcript real-time UI pattern — WebSocket + optimistic append?
4. OCR upload: camera capture vs file picker, multipart upload (Phase 0'da Multer var, Phase 6'da büyük görseller için chunked).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik arşive donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik arşive donduruldu, Phase 3 için reset. |
| 2026-04-17 | Phase 3 kapanışı — içerik arşive donduruldu, Phase 4 için reset. |
| 2026-04-17 | Phase 4 kapanışı — içerik arşive donduruldu, Phase 5 için reset. |
| 2026-04-17 | Phase 5 kapanışı — içerik arşive donduruldu, Phase 6 için reset. |
