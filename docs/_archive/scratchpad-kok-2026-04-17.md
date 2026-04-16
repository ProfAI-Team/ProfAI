# Scratchpad — Kök (Genel)

Bu dosya **yaşayan çalışma defteridir.** Cross-cutting işler, proje geneli düşünceler, session arası hafıza.

> Frontend'e özel notlar → [`client/SCRATCHPAD.md`](./client/SCRATCHPAD.md)
> Backend'e özel notlar → [`server/SCRATCHPAD.md`](./server/SCRATCHPAD.md)

---

## Kullanım Kuralları

- **Her session başında** üç scratchpad'i de kontrol et (bu + client + server).
- **Her session sonunda** üzerinde çalıştığın alanın scratchpad'ini güncelle.
- Open question'a döndüğünde: scratchpad'den `docs/tasks/open-questions.md`'e taşı.
- Karar netleştiğinde: scratchpad'den ilgili `docs/` dosyasına taşı, scratchpad'den sil.
- Milestone / faz sonunda: `docs/_archive/scratchpad-kok-YYYY-MM-DD.md` olarak dondur, yenisini aç.

---

## Şu An Üzerinde Çalışılan

- Dokümantasyon yeniden yapılandırması tamamlandı (2026-04-16).
  - 3 CLAUDE.md + 22 docs/ dosyası + 8 arşiv dosyası.
  - Yapı: `docs/README.md` indeks + `vision/`, `roadmap/`, `architecture/`, `operations/`, `tasks/`.
- Scratchpad sistemi yeni kuruldu (kök + client + server).

---

## Düşünceler / Keşifler

- **Walkthrough yapılmadı henüz**: yazdığımız 25 dosyanın linkleri / akışı gerçek kullanımda test edilmedi. Phase 1'e başlamadan önce "yeni ekip üyesi" + "kod yazarı" rolleriyle bir geçiş yapılmalı.
- **Docs'ta hâlâ v1 master**: `docs/ProfAI_Vision_and_Roadmap.md` kök seviyede duruyor. Snapshot `_archive/`'te var. Tek kopya bırakma kararı açık — walkthrough sırasında karar ver.
- **xlsx ve drawio dosyaları güncel değil**: `ProfAI_Project_Plan.xlsx` + `ProfAI_UML_Diagrams.drawio`. Manuel güncelleme gerekir, kodla senkronize olmaz.

---

## Blocker

- Yok.

---

## Açık Soruların Hızlı Takibi

Sadece "yeni ortaya çıkan" açık sorular buraya. Olgunlaştığında [`docs/tasks/open-questions.md`](./docs/tasks/open-questions.md)'e taşı.

- **Dependabot: 22 vulnerability** (15 high, 7 moderate) — GitHub push sırasında raporlandı (2026-04-16). `https://github.com/ProfAI-Team/ProfAI/security/dependabot` → liste. Phase 1 ilerlerken `npm audit fix` ile toplu halledilir; breaking changes yoksa basit PR. Major bump gerekiyorsa ayrı karar.

---

## Bir Sonraki Session İçin

1. **Docs walkthrough** (20dk): "yeni ekip üyesi" + "kod yazarı" akışı simüle et, kopuk linkler ve eksik bilgiyi düzelt.
2. **Phase 1 Task 1.1** başlat: Prisma schema + migration (`ProfessorStyleProfile`, `AICallLog`, `AIFeedback`).
3. **KVKK aydınlatma metni** öncelik — Top 5 kritik risk. Phase 1 öncesi tamamlanmalı (avukat + hazır template).
4. Demo hazırlığı: `ProfAI_Project_Plan.xlsx` güncelle (manuel).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu; doc restructure tamam + Phase 1 planı hazır. |
