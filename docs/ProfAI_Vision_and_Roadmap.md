# ProfAI — Ürün Vizyonu ve Yol Haritası

**Versiyon:** 1.0
**Yayın Tarihi:** 2026-04-16
**Durum:** Aktif — geliştirme rehberi
**Sahip:** ProfAI ekibi
**Sonraki Revizyon:** Phase 1 tamamlandığında

---

## İçindekiler

- [0. Yönetici Özeti](#0-yönetici-özeti)
- [1. Vizyon ve Konumlandırma](#1-vizyon-ve-konumlandırma)
- [2. Problem ve Fırsat](#2-problem-ve-fırsat)
- [3. Hedef Kitle ve Personalar](#3-hedef-kitle-ve-personalar)
- [4. Stratejik Sütunlar](#4-stratejik-sütunlar)
- [5. Defansibilite ve Rekabet Avantajı](#5-defansibilite-ve-rekabet-avantajı)
- [6. İş Modeli](#6-iş-modeli)
- [7. Killer Aha Anları](#7-killer-aha-anları)
- [8. Faz Faz Yol Haritası](#8-faz-faz-yol-haritası)
  - [Phase 0 — Mevcut Temel (Tamamlandı)](#phase-0--mevcut-temel-tamamlandı)
  - [Phase 1 — Hoca-Merkezli Stil Profili](#phase-1--hoca-merkezli-stil-profili)
  - [Phase 2 — Kişiselleştirilmiş Çalışma Materyalleri](#phase-2--kişiselleştirilmiş-çalışma-materyalleri)
  - [Phase 3 — Mock Exam ve Tahminler](#phase-3--mock-exam-ve-tahminler)
  - [Phase 4 — Topluluk Katmanı](#phase-4--topluluk-katmanı)
  - [Phase 5 — Akademik DNA ve Persistent Memory](#phase-5--akademik-dna-ve-persistent-memory)
  - [Phase 6 — Multimodal ve Live AI Tutor](#phase-6--multimodal-ve-live-ai-tutor)
  - [Phase 7 — B2B ve Marketplace](#phase-7--b2b-ve-marketplace)
- [9. Teknik Mimari Evrimi](#9-teknik-mimari-evrimi)
- [10. Riskler ve Mitigasyonlar](#10-riskler-ve-mitigasyonlar)
- [11. Başarı Metrikleri (KPI)](#11-başarı-metrikleri-kpi)
- [12. Açık Sorular ve Karar Bekleyen Konular](#12-açık-sorular-ve-karar-bekleyen-konular)
- [13. Ek (Appendix)](#13-ek-appendix)

---

## 0. Yönetici Özeti

ProfAI, Türk üniversite öğrencileri için **AI destekli akademik co-pilot** platformudur. Mevcut versiyonu (Phase 0) hocaların geçmiş sınav stilini analiz eder. Hedef vizyon, bu temeli kullanarak öğrencinin 4 yıllık akademik yolculuğunun kalıcı dijital partneri olmaktır.

**Üç ayağı:**

1. **Hoca İstihbaratı** — her hocanın stil/zorluk/konu profilini AI ile çıkar
2. **Kişiselleştirilmiş Yardım** — öğrencinin yüklediği konu materyali + hoca profili = ona özel çalışma notu, pratik soru, mock exam
3. **Topluluk Zekası** — crowdsource sınav verisi, peer benchmarking, study group eşleştirme

**Neden şimdi:**
- Türkçe LLM kalitesi prod-ready (Gemini 2.5 Flash)
- Türk üniversite ekosistemi global rakiplere kapalı (yerel context)
- Z kuşağı öğrenciler "ChatGPT yerine bana özel olan" araç istiyor
- KVKK uyumlu yerel platform avantajı (global edtech buraya giremez)

**MVP+'tan piyasa lideri ürüne:** 7 fazda (≈9 ay), her faz kullanılabilir bir ürün ekler ve bir önceki faza dayanır.

---

## 1. Vizyon ve Konumlandırma

### 1.1 Vizyon Cümlesi

> **"Üniversitedeki 4 yılın boyunca seninle olan, hocalarını ve seni tanıyan kişisel akademik AI partneri."**

### 1.2 Misyon

Her Türk üniversite öğrencisinin sınav öncesi karanlıkta el yordamıyla çalışmasını bitirmek; veriye dayalı, kişiselleştirilmiş ve hoca-spesifik hazırlığı standart hale getirmek.

### 1.3 Konumlandırma

| Kategori | Neyiz | Ne değiliz |
|----------|-------|------------|
| **Asıl** | Hoca-merkezli kişiselleştirilmiş AI çalışma asistanı | Genel ders notu deposu (ders.io vb.) |
| **Örnek olduğumuz** | Khan Academy + Brilliant + RateMyProfessors + ChatGPT (4'ünün kesişimi) | RateMyProfessors klonu (sadece puanlama) |
| **Ayırt eden** | Türkçe + KVKK uyumlu + hoca stiliyle hizalı içerik üretimi | Genel amaçlı ChatGPT (hocayı bilmez) |

### 1.4 Tagline Adayları

- *"Profesörünü tanı, sınava hazır gel."*
- *"Hocan nasıl soruyor? Bil, hazırlan, başar."*
- *"Akademik co-pilot'un — sınava 4 yıl boyunca yanında."*

---

## 2. Problem ve Fırsat

### 2.1 Problem

**Türk üniversite öğrencisi sınav öncesi:**
- Hocanın stilini bilmiyor → "ezberlerden mi, problemlerden mi gelecek?"
- Önceki yıl sınavlarına erişimi sınırlı (eski öğrencilerden bulmaya çalışır)
- ChatGPT cevapları **hocanın diline değil**, generic
- Konuya çalışıyor ama **hocanın o konuya nasıl yaklaştığını** bilmiyor
- Ders notları + sınav stratejisi arasında **bağlantı yok**
- Performans tahmini yok ("yetecek mi, yetmeyecek mi?")

### 2.2 Mevcut Çözümler ve Eksikleri

| Çözüm | Eksik |
|-------|-------|
| **ChatGPT/Claude** | Hocayı bilmez, generic. Türkçe akademik context zayıf. |
| **YÖK Atlas / Hoca puan siteleri** | Sadece subjektif puanlama. İçerik üretmez. |
| **Eski sınav arşivleri (PDF dolaşan)** | Dağınık, doğrulanmamış, AI analizi yok. |
| **Khan Academy / Coursera** | Hocaya/derse özel değil, jenerik. |
| **Özel ders / etüt** | Pahalı, ölçeklenmez. |

### 2.3 Pazar Boyutu (Türkiye)

- ~209 üniversite, ~8 milyon kayıtlı öğrenci
- Her yıl ~4M sınav (vize + final + bütünleme)
- Eğitim teknolojisi pazarı 2025: ~$1.2B (büyüme %30 YoY)
- TAM: 8M öğrenci × ortalama $50/yıl LTV = $400M potansiyel

---

## 3. Hedef Kitle ve Personalar

### 3.1 Birincil Persona: "Sınav Stresli Sami"

- **Kim:** Vakıf üniversitesi 2. sınıf, Bilgisayar Müh. öğrencisi, 20 yaş
- **Acı:** Hocanın stilini bilmediği için 10 saat çalışıyor, sınav farklı çıkıyor, hayal kırıklığı
- **Şu an ne yapıyor:** WhatsApp gruplarında eski sınav arıyor, ChatGPT'ye soruyor (alakasız cevaplar)
- **ProfAI ile ne kazanır:** Hocanın 5 sınavını analiz, kendi notuyla birleştirilmiş çalışma materyali, mock exam, "sınava hazırım" güveni
- **Premium ödeme niyeti:** Yüksek (final dönemi)

### 3.2 İkincil Persona: "Çalışkan Çiğdem"

- **Kim:** Devlet üniversitesi 3. sınıf, Tıp öğrencisi, 21 yaş
- **Acı:** Çok ders, az zaman. Verimli çalışma şart. Hangi konuya öncelik?
- **Şu an ne yapıyor:** Ders kitaplarına gömülmüş, prioritization yok
- **ProfAI ile ne kazanır:** Konu boşluk detektörü, panik modu, hocaya göre ağırlıklandırılmış çalışma
- **Premium niyeti:** Çok yüksek (mezuniyet sınavı)

### 3.3 Üçüncül Persona: "Yardımsever Yusuf"

- **Kim:** Mezun veya 4. sınıf öğrencisi, 23 yaş
- **Motivasyon:** Topluluğa katkı, kendi notlarını paylaşmak, kıdemli olmak
- **ProfAI'da rolü:** Sınav uploader, soru oylayıcı, study group lideri
- **Network etkisi sağlayıcısı**

### 3.4 Karar Verici (B2B — gelecek)

- **Üniversite Eğitim Direktörü:** Aggregate öğrenci verisinden ders/hoca etkinliği analizi alır
- **Hoca:** Kendi sınavlarındaki öğrenci performans heatmap'ini görür, müfredat ayarlar

---

## 4. Stratejik Sütunlar

Ürün 5 sütun üzerine kurulu. Her sütun bağımsız değer üretir, birlikte exponential.

### 4.1 Sütun 1 — İçgörü Katmanı (*"Bu hoca nasıl?"*)

Hocanın geçmiş sınavlarından çıkarılan stil profili.

**Özellikler:**
- Aggregate soru tipi dağılımı (% MC, % klasik, % T/F)
- Top konular (kümülatif)
- Zorluk profili
- **Hoca evrim grafiği:** yıllar içindeki değişim
- **Sezon analizi:** 2024 baharında AI soruları arttı
- **Trick patterns:** "Bonus sorular hep son haftadan", "Vize teori finalde uygulama"

**Status:** Backend kısmen hazır (Phase 0). UI Phase 1'de tamamlanacak.

### 4.2 Sütun 2 — Yardım Katmanı (*"Bana yardım et"*)

Öğrenciye somut, eyleme geçirilebilir içerik üretir.

**Özellikler:**
- **Personalized study notes** — öğrenci konu materyali yükler → hoca stilinde özet
- **AI Mock Exam** — gerçek sınav atmosferi, otomatik puanlama, performans raporu
- **AI Tutor Chat** — "Bu konuyu hocanın anlatış tarzında anlat" (Gemini Live opsiyonel)
- **Multimodal upload** — el yazısı not / ses kaydı / slayt → analiz

**Status:** Henüz yok. Phase 2'de başlar.

### 4.3 Sütun 3 — Topluluk Katmanı (*"Yalnız değilsin"*)

Veri network etkisi yaratır, defansibility sağlar.

**Özellikler:**
- **Sınav Borsası** — her yükleme onay görür, upload eden kredi kazanır → premium unlock
- **Sınav Sonrası Otopsi** — "Bu sınavda neler çıktı?" formu → 10 öğrencinin verisi birleşip gerçek sınav rekonstrukte edilir
- **Topluluk-onaylı pratik soru havuzu** — AI ürettiğini topluluk filtreler (👍/👎)
- **AI-mediated study groups** — aynı sınava girenler eşleştir, AI moderatör konu paylaştırır
- **"Bu hocadan A alanların stratejisi"** — başarı pattern'i

**Status:** Henüz yok. Phase 4.

### 4.4 Sütun 4 — Kişisel Katman (*"Akademik DNA'n"*)

4 yıllık journey'i takip eden persistent memory.

**Özellikler:**
- **Persistent memory** — geçen sömestr neyi öğrendin, neyi sevmedin
- **Learning style discovery** — quiz performansından öğrenme tarzını çıkar
- **Confidence map** — her konu için "hazırım" skoru
- **GPA simülatörü** — "Bu sınavdan 65 alırsam not ortalamam ne olur?"
- **Course advisor** — yeni dönem ders seçerken "DNA uyumu" skoru

**Status:** Phase 5.

### 4.5 Sütun 5 — Tahmin Katmanı (*"Geleceği gör"*)

ML/AI tahmin yetenekleri — wow faktör.

**Özellikler:**
- **"Sınava 5 saat kaldı" panik modu** — priority study plan
- **Sınav kağıdı tahmini** — "Bu sınavda %80 olasılıkla bu sorular var"
- **Konu boşluk detektörü** — notlardaki eksikleri hocanın history'siyle karşılaştırıp flag'le
- **Bireysel performans tahmini** — pratik skorlar + hoca verileri = "muhtemel sınav notun: 75-82"
- **Kariyer pathway** — akademik DNA + sektör ihtiyaçları = "ML mühendisi rolü %92 uyum"

**Status:** Phase 3 + Phase 5 üzerine kurulur.

---

## 5. Defansibilite ve Rekabet Avantajı

### 5.1 Moat Analizi

| Moat Kaynağı | Neden Önemli | Yatırım |
|--------------|--------------|---------|
| **Veri network etkisi** | 10K öğrenci × 100 sınav = 1M veri. Yeni rakip 0'dan başlar. | Phase 4 (sınav borsası) |
| **Topluluk wiki** | Stack Overflow gibi — kritik kütle sonrası rakip katlanamaz | Phase 4-5 |
| **Persistent memory** | 4 yıllık veri → yüksek switch cost. Mezun olmadan ayrılmazlar. | Phase 5 |
| **Hoca onay rozeti** | Hocaların kendileri katıldıkça resmî kaynak | Phase 7 |
| **Türkçe + Yerel context** | Global AI'lar Türk üni ekosistemini bilmiyor. KVKK uyumlu yerel avantaj | Yapısal |
| **Brand olma** | "ProfAI" = sınav hazırlığı kategori adı olur (Google, Spotify gibi) | Marketing |

### 5.2 Rakip Analizi

| Rakip | Güçlü | Zayıf | ProfAI farkı |
|-------|-------|-------|--------------|
| **ChatGPT/Claude** | Genel AI gücü | Hocayı bilmez, Türkçe akademik zayıf | Hoca stiliyle hizalı içerik |
| **Khan Academy** | Kalıcı içerik | Hoca/ders özel değil | Kişiselleştirme + Türk müfredat |
| **Coursera** | Kaliteli kurs | Üniversite sınavı odaklı değil | Sınav hazırlığı odaklı |
| **WhatsApp eski sınav grupları** | Sosyal | Dağınık, AI yok | Yapılandırılmış + AI analizi |
| **Hoca puan siteleri** | Kullanıcı tabanı | Sadece puan, değer üretmez | İçerik üretir, sadece skor değil |
| **Quizlet** | Flashcard | Hocaya özel değil | Hocaya özel pratik soru |

### 5.3 Yeni Rakip Engelleri

Bir startup ProfAI'ı taklit etmek isterse:

1. **Veri** — bizim 1M+ sınav verimiz olmadan kaliteli AI çıktısı veremez
2. **Topluluk** — önce 10K aktif öğrenci yakalamak gerekiyor
3. **Hoca markası** — hocalar ProfAI'a katılmışsa rakibe gitmez
4. **Brand recall** — "ProfAI'a baktın mı?" öğrenci konuşmalarına girmiş olur

---

## 6. İş Modeli

### 6.1 Freemium Yapı

| Tier | Fiyat | Sınırlamalar | Hedef Kullanıcı |
|------|-------|--------------|-----------------|
| **Ücretsiz** | ₺0 | 3 hoca analizi/ay, 5 pratik soru, basic study notes | Tüm öğrenciler (giriş kapısı) |
| **Premium** | ₺49/ay | Sınırsız analiz, mock exam, AI tutor chat, panic mode, predictions | Aktif sınav hazırlayan öğrenci |
| **Plus** | ₺99/ay | + Real-time voice tutor, priority Gemini, 1-on-1 study coach | Final dönemi / mezuniyet sınavı |
| **Üniversite Bursu** | Ücretsiz | Premium tüm özellikler | İhtiyaç sahibi öğrenciler (sponsorlu) |

### 6.2 B2B Modeli (Phase 7+)

| Müşteri | Ürün | Fiyat |
|---------|------|-------|
| **Üniversite Eğitim Direktörlüğü** | Aggregate öğrenci başarı analizi, ders/hoca heatmap | ₺50K-200K/yıl |
| **Hoca (bireysel)** | Kendi öğrencilerinin performans dashboard'u | ₺149/ay |
| **Özel ders kurumu** | Hoca data + öğrenci eşleştirme | Komisyon (%15) |

### 6.3 Marketplace Modeli

- **Tutoring marketplace:** Öğrenci ↔ tutor eşleştirme, %15 komisyon
- **Premium konu anlatımı satışı:** Mezunlar kendi notlarını satabilir, ProfAI %30 komisyon

### 6.4 Conversion Funnel Hedefleri

```
Ziyaretçi (10K/ay) → Kayıt (15%) → 1.500 öğrenci
Kayıt → Aktif (60%) → 900 aktif öğrenci
Aktif → Premium dönüşümü (%8) → 72 ödeme = ₺3.500/ay (yıl 1)

Yıl 2 hedef: 100K aktif, %8 premium = 8K ödeme = ₺400K/ay = ₺4.8M/yıl
```

### 6.5 Birim Ekonomi (Tahmini)

| Metrik | Değer |
|--------|-------|
| **Avg revenue per user (ARPU)** | ₺6 (free dahil) / ₺49 (premium) |
| **Gemini maliyeti / kullanıcı** | ~₺3/ay (avg) |
| **Server + DB maliyeti** | ~₺1/ay |
| **Net margin (premium)** | ~%80 |
| **CAC (organik + viral)** | Hedef ₺15 |
| **LTV** | Premium kullanıcı ortalama 6 ay = ₺294 |
| **LTV / CAC** | ~20x (sağlıklı) |

---

## 7. Killer Aha Anları

Kullanıcının "vay be" dediği UX momentleri.

### Aha #1 — İlk Yükleme

**Senaryo:** Öğrenci ilk PDF'ini yükler.
**Beklenen:** "Yüklendi."
**ProfAI verir:**

> 🎯 "Bu hoca soru tipi profilin: %50 çoktan seçmeli, %30 problem çözme, %20 teori. Sen MC'de güçlüsün, problemlere odaklan. Sıkça sorduğu konular: Veri Yapıları (%40), Algoritmalar (%25), OOP (%20)."

**Sonuç:** "Yapay zeka beni gerçekten anladı"

### Aha #2 — Sınava 3 Gün Kala Bildirimi

**Push:** "Hocanın geçmiş 5 finalini analiz ettim. Sana 90dk'lık focused çalışma planı hazırladım. Başla?"

Tıkla → kişiye özel sıralı çalışma akışı:
- 30dk: Ağaç yapıları (her sınavda %30)
- 30dk: Graf algoritmaları (geçen yıl bonus)
- 20dk: Hash tabloları (senin zayıf alanın)
- 10dk: Mock exam

### Aha #3 — Mock Exam Sonu

> 82/100 — gerçek sınavda muhtemelen 75-82 arası alırsın.
> En zayıf alan: graf algoritmaları (60% doğru).
> 2 saat verirsen 8 puan kazanırsın → işte özet → işte 5 pratik soru → çözmeye başla?

### Aha #4 — Sınav Sonrası Validation

> 10 arkadaşın bu sınavı yükledi. Senin tahminlerinin %72'si tutmuş. Bir sonraki sınav için: hoca son 6 ayda X konusuna ağırlık vermiş.

### Aha #5 — Konu Boşluk Detektörü

Öğrenci ders notlarını yükler. ProfAI:

> ⚠️ Notlarında "Dinamik Programlama" eksik. Bu konu hocanın son 3 finalinde sırasıyla %15, %20, %25 ağırlıkta. **Mutlaka çalış**. İşte kısa özet ve 3 pratik soru →

### Aha #6 — Yıllar Sonra Persistence

Mezun olmuş öğrenci 5 yıl sonra:

> "Hoş geldin Erdem. 2026'da Algoritma Analizi'nde A almıştın. Şimdi master derslerini düşünüyor musun? Akademik DNA'na uygun 3 yüksek lisans programı buldum."

---

## 8. Faz Faz Yol Haritası

Her faz **kullanılabilir bir ürün** ekler. Her fazın net giriş kriterleri, çıktıları ve başarı metriği vardır.

---

### Phase 0 — Mevcut Temel (Tamamlandı) ✅

**Süre:** Tamamlandı
**Statü:** Production'da çalışıyor

#### Kapsam (DAHİL)
- ✅ Auth (register / login / JWT)
- ✅ Profesör + ders + sınav CRUD
- ✅ Sınav PDF yükleme + Gemini 2.5 Flash analizi (questionTypes, topicDistribution, difficulty, summary)
- ✅ ProfessorDetailPage (per-exam analiz listesi)
- ✅ Frontend: Premium edu UI (light + dark, TR + EN)
- ✅ Searchable filters (city pills, faceted counts, URL sync, sort)
- ✅ Real seed: 200 üniversite, 4500 prof, 11K ders, 17K sınav
- ✅ Real overrides (Aydın Yazılım Geliştirme = 6 gerçek hoca)
- ✅ Multi-file upload + paralel analiz
- ✅ Upload sonrası analiz preview + dashboard

#### Çıktılar
- Working MVP demoyu yapabilen sistem
- Tüm temel altyapı (DB, API, Frontend, Docker, CI/CD)

---

### Phase 1 — Hoca-Merkezli Stil Profili 🎯

**Süre:** 1 hafta
**Hedef:** Ürünün **gerçek vizyonunu** ortaya çıkar — hoca sayfasını "sınav listesi"nden "stil profili"ne çevir.

#### Neden Bu Faz?
Mevcut UX hâlâ "ders/sınav merkezli". Asıl mesaj **hocanın stili** olmalı. Bu faz olmadan diğer hiçbir şey anlam kazanmaz.

#### Kapsam (DAHİL)
- **ProfessorDetailPage rebuild:**
  - Hero: "Hocanın Stili" — aggregate pie + bar chart (tek tane, hepsini birleştirilmiş)
  - 4 ana metric: Toplam sınav, Avg zorluk, Avg soru sayısı, Baskın soru tipi
  - "Hocanın Tarzı" Gemini özeti (insan gibi cümle, 3-4 satır)
  - Top 10 konu rozet listesi
- **Yeni endpoint:** `GET /api/professors/:id/style-profile` (mevcut `getProfessorAnalysis`'i geliştir)
- **Hoca evrim grafiği:** son 5 yıl, soru tipi/zorluk trendi (line chart)
- Per-exam liste opsiyonel/altta (collapsible)
- Course'lar minor section

#### Kapsam DIŞI
- Pratik soru üretimi (Phase 2)
- Konu materyali yükleme (Phase 2)
- Mock exam (Phase 3)

#### Acceptance Criteria
- [ ] Hoca sayfası açıldığında ilk gördüğü şey **stil profili**, sınav listesi değil
- [ ] "Hocanın Tarzı" özeti her hoca için Gemini ile bir kez üretilir, cache'lenir
- [ ] Evrim grafiği son 5 yılı gösterir, 0-2 yıl varsa saklanır
- [ ] Mobile responsive
- [ ] Empty state (sınav yoksa düzgün mesaj)

#### Teknik Değişiklikler
- Schema: yeni tablo `ProfessorStyleProfile` (cache için)
  ```prisma
  model ProfessorStyleProfile {
    id            String    @id @default(uuid())
    professorId   String    @unique
    professor     Professor @relation(...)
    aggregatedData Json     // pie, bar, top topics, etc.
    geminiSummary String    @db.Text
    generatedAt   DateTime  @default(now())
    examSourceCount Int
  }
  ```
- Backend service: `professorStyleService.ts` — aggregation + Gemini summary
- Frontend: tam yeni `ProfessorDetailPage` layout

#### Çıktılar
- Yenilenmiş hoca detay sayfası
- Stil profili cache sistemi (gelecekte kullanılır)
- "Hocanın Tarzı" özeti — paylaşılabilir karta dönüşebilir (viral potansiyel)

#### Riskler
- Gemini özeti hatalı/genel olabilir → prompt iteration gerekir
- 4500 hoca için style profile cache → Gemini call patlaması → lazy-generate (sadece ziyaret edilenler)

#### Başarı Metriği
- Hoca sayfası bounce rate < %30
- Avg time on page > 60 saniye
- "Hocanın Tarzı" özeti %80 kullanıcı tarafından okunur (scroll depth)

---

### Phase 2 — Kişiselleştirilmiş Çalışma Materyalleri 📚

**Süre:** 2 hafta
**Hedef:** **Asıl ürün vizyonunu** hayata geçir — hoca stili + öğrenci notu = kişiselleştirilmiş içerik.

#### Neden Bu Faz?
Bu, ürünün **çekirdek değeri**. Bu olmadan sadece "hoca hakkında bilgi sayfası"yız.

#### Kapsam (DAHİL)
- **Konu Materyali Yükleme:**
  - Yeni sayfa `/upload-notes`
  - Ders + öğrenci notu upload (PDF/DOCX/TXT/foto)
  - Notlar DB'de saklanır (kullanıcıya özel, gizli)
  - Multi-file upload (slayt + ek not)
- **AI Personalized Study Notes:**
  - Yüklenen not + hoca stili = Gemini'ye prompt
  - Çıktı: hocanın diline uygun konu özetleri, anahtar noktalar, "hocanın bu konuyu nasıl sorduğu"
  - Format: kısa, scannable, vurgulanmış
- **AI Pratik Sorular:**
  - Hoca stiline uygun 5-10 soru
  - Her sorunun: tip (MC/klasik/T/F), konu, zorluk, gerekçe (cevap dahil)
  - Topluluk için: ileride oylama altyapısı
- **Yeni Endpoints:**
  - `POST /api/notes/upload` — öğrenci konu materyali
  - `POST /api/study-pack/generate` — hoca + notlar → study pack üret
  - `GET /api/study-pack/:id` — üretilmiş paket
- **UI:** Yeni sayfa `/study-pack/:id`
  - Tab 1: Konu özeti (markdown render)
  - Tab 2: Pratik sorular (her birinde "Cevabı göster" toggle)
  - Tab 3: Hoca trick'leri (pattern detection sonuçları)

#### Kapsam DIŞI
- Mock exam (Phase 3)
- Topluluk soru oylama (Phase 4)
- Voice tutor (Phase 6)

#### Acceptance Criteria
- [ ] Öğrenci 1 PDF (ders notu) yükleyip, hoca seçince 30 saniye içinde study pack alabilir
- [ ] Study pack en az 3 konu özeti + 5 pratik soru içerir
- [ ] Pratik soru tipi dağılımı hocanın gerçek dağılımına ±%10 uyumlu
- [ ] Türkçe çıktı dil bilgisi olarak temiz
- [ ] Cache: aynı not + aynı hoca → tekrar üretmez (24h TTL)

#### Teknik Değişiklikler
- Schema:
  ```prisma
  model StudentNote {
    id          String   @id @default(uuid())
    userId      String
    user        User     @relation(...)
    title       String
    courseId    String?  // optional
    course      Course?  @relation(...)
    fileUrl     String
    extractedText String  @db.Text
    createdAt   DateTime @default(now())
  }

  model StudyPack {
    id            String   @id @default(uuid())
    userId        String
    professorId   String
    noteIds       String[]  // referenced StudentNote IDs
    topicSummaries Json     // [{topic, content}]
    practiceQuestions Json  // [{q, type, topic, answer, difficulty}]
    profStylePatterns Json  // ["bonus son haftadan", "vize teori"]
    geminiVersion  String   // model used for cache invalidation
    generatedAt    DateTime @default(now())
  }
  ```
- New Gemini prompt: structured output for study pack
- File extraction: pdf-parse for PDF, mammoth for DOCX, raw read for TXT
- New service: `studyPackService.ts`

#### Çıktılar
- "Konu Yükle" akışı
- Study Pack sayfası — ana value proposition'ın görünür yüzü
- "Hocan nasıl soruyor?" pattern detection ilk versiyon

#### Riskler
- **AI hallucination:** uydurma kavramlar, yanlış formüller → prompt'a "kaynak dışına çıkma" emri + warning banner
- **Note quality bağımlılığı:** kötü PDF → kötü çıktı → input quality check (en az 500 kelime şart)
- **KVKK:** öğrenci notları telif hakkı içerebilir → "sadece kişisel kullanım" disclaimer
- **Maliyet patlaması:** her study pack ~$0.05 Gemini. 1000 üretim = $50. Cache şart.

#### Başarı Metriği
- Study pack üretim sayısı > 100/hafta (Phase 2 sonu)
- "Faydalı buldum" oranı > %70 (1-tık feedback)
- Tekrar üretim oranı < %20 (cache başarısı)

---

### Phase 3 — Mock Exam ve Tahminler 🎮

**Süre:** 2 hafta
**Hedef:** **Killer demo özelliği** — viral potansiyel + önemli engagement.

#### Neden Bu Faz?
Mock exam = sosyal medyada paylaşılabilir, "geçtim" anı yaratır. Tahminler = "vay be" momentum.

#### Kapsam (DAHİL)
- **Mock Exam Generator:**
  - Hocanın gerçek sınav format'ı (soru sayısı, tip dağılımı, zorluk)
  - Öğrencinin study pack'inden konular alınır
  - Çıktı: tam sınav (20-30 soru), Gemini ile üretilir
  - Cevap key'i AI tarafından da hazırlanır
- **Mock Exam Session UI:**
  - Timer (gerçek sınav süresi: ~90dk)
  - Soru navigasyon (1, 2, 3, ...)
  - Mark for review
  - Submit → AI değerlendirme + skor
- **Auto-Grading:**
  - MC + T/F: otomatik
  - Klasik: Gemini değerlendirir (rubric ile)
  - Skor + her soruya feedback
- **Performans Tahmini:**
  - Mock exam skoru + hocanın geçmiş ortalaması = "muhtemel gerçek sınav notun"
  - Confidence interval ("75-82 arası")
- **Konu Boşluk Detektörü:**
  - Mock exam yanlış cevapları → "şu konularda zayıfsın"
  - Her zayıflık için: study notes link
- **Panik Modu** (basit versiyon):
  - "Sınava kaç saat var?" sorusu
  - Cevaba göre: priority study plan (en önemli konuyu en üstte)

#### Kapsam DIŞI
- Sosyal paylaşım (Phase 4)
- Real-time AI tutor chat (Phase 6)
- Spaced repetition (Phase 5)

#### Acceptance Criteria
- [ ] Mock exam üretimi < 60sn
- [ ] Auto-grade % doğruluk > 85% (manuel kontrol)
- [ ] Performans tahmini, gerçek sınav notuyla ±10 puan uyumlu (kullanıcı bildirimi ile)
- [ ] Panik modu süreyi alıp planı 5 saniyede üretir
- [ ] Mobile UX: telefon üzerinden mock exam çözülebilir

#### Teknik Değişiklikler
- Schema:
  ```prisma
  model MockExam {
    id           String   @id @default(uuid())
    userId       String
    professorId  String
    studyPackId  String?
    questions    Json     // [{q, type, options, correctAnswer, topic}]
    createdAt    DateTime @default(now())
  }

  model MockExamSession {
    id           String    @id @default(uuid())
    mockExamId   String
    userId       String
    answers      Json      // [{qIdx, answer, timeSpent}]
    score        Float?
    feedback     Json?     // per-question
    completedAt  DateTime?
    startedAt    DateTime  @default(now())
  }
  ```
- New Gemini prompts:
  - Mock exam generation
  - Auto-grading (rubric-based)
  - Performance prediction
- Frontend: yeni `/mock-exam/:id/session` sayfası (timer, navigation)

#### Çıktılar
- Mock exam ekosistemi
- Performance prediction motoru (basit)
- Konu boşluk detektörü
- Panic mode v1

#### Riskler
- **Auto-grade hatası:** klasik soruda Gemini yanlış puan → "cevabı tartış" butonu
- **Soru kalitesi:** AI'nin ürettiği soru saçma olabilir → topluluk oylama Phase 4'te ekle
- **Maliyet:** mock exam ~$0.10 Gemini → cache + 1 saatlik rate limit

#### Başarı Metriği
- Mock exam tamamlama oranı > %60 (başlayan/biten)
- "Tahmin tutmuştu" feedback > %50 (sınav sonrası)
- Mock exam → study pack tıklama oranı > %40 (loop kapsama)

---

### Phase 4 — Topluluk Katmanı 🤝

**Süre:** 3 hafta
**Hedef:** **Network etkisi yaratmak** — moat + viral büyüme.

#### Neden Bu Faz?
Phase 1-3 öğrenciye değer verir, ama platform tek başına ölür. Topluluk olmadan rakipler hızla yetişir.

#### Kapsam (DAHİL)
- **Sınav Borsası (Credit System):**
  - Her onaylanmış yükleme = 10 kredi
  - Premium özellikler kredi ile unlock (mock exam = 5 kredi, study pack = 3 kredi)
  - Free user kredi kazanarak premium özellikleri kullanır
- **Sınav Onaylama:**
  - Yüklenen sınav 3 farklı kullanıcı tarafından "doğru" oylanırsa onaylanır
  - Onay rozeti
- **Sınav Sonrası Otopsi:**
  - Sınavdan çıkan öğrenci form doldurur: "neler çıktı?"
  - 10 öğrencinin verisi birleşince → AI gerçek sınavı rekonstrukte eder (yaklaşık)
  - Bir sonraki sömestr için altın değerinde
- **Topluluk Soru Havuzu:**
  - AI'nin ürettiği pratik soruları öğrenciler oylar (👍/👎/"sınavda çıktı")
  - En iyiler (>10 👍) "verified" havuzuna geçer
  - Free tier kullanıcılar verified soruları görebilir
- **Çalışma Grupları (basit):**
  - Aynı hocadan sınava gireceğini işaretle
  - Eşleştirme: aynı hocadan 5+ kişi → grup
  - WhatsApp grup linki + AI önerilen tartışma konuları
- **"Bu hocadan A alanların stratejisi":**
  - Yüksek not alan kullanıcıların (self-reported) hangi konulara odaklandığını göster
  - Anonimleştirilmiş, aggregated

#### Kapsam DIŞI
- Tutoring marketplace (Phase 7)
- Real moderasyon AI (basit upvote/downvote)
- Gerçek sosyal feed (sadece grup eşleştirme)

#### Acceptance Criteria
- [ ] Yeni kullanıcı 1 sınav yükleyip 10 kredi kazanır
- [ ] Sınav 3 onay aldıktan sonra "verified" rozeti alır
- [ ] AI üretilen soruda her öğrenci oy kullanabilir
- [ ] Aynı hocadan 5+ kişi varsa eşleştirme önerisi çıkar

#### Teknik Değişiklikler
- Schema:
  ```prisma
  model UserCredit {
    userId     String   @id
    user       User     @relation(...)
    balance    Int      @default(0)
    history    Json[]   // tx history
  }

  model ExamApproval {
    examId   String
    userId   String
    approved Boolean
    @@id([examId, userId])
  }

  model QuestionVote {
    questionId String  // synthetic ID for AI question
    userId     String
    vote       Int     // -1, 0, 1
    cameOnExam Boolean? // "sınavda çıktı"
    @@id([questionId, userId])
  }

  model PostExamReport {
    id          String   @id @default(uuid())
    userId      String
    professorId String
    courseId    String?
    examDate    DateTime
    reportedTopics Json   // [{topic, frequency}]
    notes       String?
    createdAt   DateTime @default(now())
  }

  model StudyGroup {
    id           String   @id @default(uuid())
    professorId  String
    examDate     DateTime?
    members      User[]
    externalLink String?  // whatsapp/discord
  }
  ```

#### Çıktılar
- Credit ekonomisi
- Onay sistemi
- Verified soru havuzu (zamanla büyür)
- Sınav otopsisi (asynchronous, kümülatif)

#### Riskler
- **Spam yüklemeler:** kredi için saçma şey yüklemek → moderasyon (manuel + AI)
- **Yanlış onay:** kötü niyetli grup oylar → onay eşiği yükseltme
- **WhatsApp linki paylaşımı:** PII riski → opt-in
- **Gerçek sınav rekonstrukte etiği:** akademik dürüstlük çizgisi → "geçmiş sınavlar yalnızca çalışma içindir, kopya çekilemez" disclaimer + üniversite onayı

#### Başarı Metriği
- Aktif yükleme yapan kullanıcı oranı > %30
- Onay süreci ortalaması < 48 saat
- Verified soru havuzu > 1000 soru (faz sonu)
- Çalışma grubu eşleştirme > 100 grup

---

### Phase 5 — Akademik DNA ve Persistent Memory 🧬

**Süre:** 2 hafta
**Hedef:** **Stickiness** — 4 yıllık veri = yüksek switch cost.

#### Neden Bu Faz?
Topluluk büyüdükçe, öğrenci bireysel deneyimini kaybetmemeli. Persistent memory = retention.

#### Kapsam (DAHİL)
- **Akademik DNA Profili:**
  - Sayfa: `/me/profile`
  - Tracked: çözülen pratik soru sayısı, doğru/yanlış oranı, en güçlü/zayıf konular, sevilen ders türleri
  - Görsel: skill graph (radar chart), strengths/weaknesses
- **Learning Style Discovery:**
  - Quiz performansından çıkar:
    - Görsel öğrenen (chart soruları başarılı)
    - Okuyarak öğrenen (uzun metin başarılı)
    - Yaparak öğrenen (problem çözme başarılı)
  - Bu bilgi → study pack format'ını ayarlar (default'tan farklı)
- **Confidence Map:**
  - Her ders/konu için "hazırım?" skoru (0-100)
  - Quiz cevaplarından otomatik güncellenir
  - Görsel: heatmap (yeşil = hazır, kırmızı = riskli)
- **GPA Simülatörü:**
  - Mevcut notlar girilir
  - "Bu sınavdan X alırsam genel notum?" hesaplar
  - Hedef GPA için "bu sınavda en az X almalısın" calc
- **Course Advisor:**
  - Yeni sömestr ders seçimi öncesi
  - Adı yazılan dersi tara: hocanın stili + senin DNA = uyum skoru
  - "Bu ders senin için %85 uygun" + gerekçe
- **Spaced Repetition:**
  - Mock exam'lerden zayıf konular → 3-7-21 gün sonra hatırlatma
  - "Bu konuyu 5 gün önce yanlış cevapladın, hadi tekrar dene"

#### Acceptance Criteria
- [ ] Kullanıcı her giriş yaptığında DNA güncellenir
- [ ] Confidence map mock exam sonrası otomatik güncellenir
- [ ] GPA simulator doğru hesaplar (test cases)
- [ ] Spaced repetition bildirim doğru tarihte gelir

#### Teknik Değişiklikler
- Schema:
  ```prisma
  model AcademicDNA {
    userId        String   @id
    user          User     @relation(...)
    learningStyle String?  // "visual" | "reading" | "kinesthetic" | "auditory"
    strengths     Json     // [{topic, score}]
    weaknesses    Json
    totalQuestionsAnswered Int @default(0)
    correctRate   Float?
    updatedAt     DateTime @updatedAt
  }

  model ConfidenceScore {
    userId    String
    topic     String
    score     Float    // 0-100
    updatedAt DateTime @updatedAt
    @@id([userId, topic])
  }

  model GradeRecord {
    id        String   @id @default(uuid())
    userId    String
    courseId  String?
    courseName String  // free-text if no course id
    grade     Float
    credit    Int
    semester  String
  }

  model SpacedRepetition {
    id           String   @id @default(uuid())
    userId       String
    questionId   String   // refs AI question or DB
    nextReview   DateTime
    interval     Int      // days
    easiness     Float    // SM-2 algorithm
  }
  ```
- New service: `dnaService.ts` — aggregation + updates
- Frontend: `/me/profile`, `/me/grades`, `/me/confidence`
- Background job: spaced repetition reminder

#### Çıktılar
- Kullanıcının akademik kimliği
- Spaced repetition motoru
- GPA simülatörü
- Course advisor

#### Riskler
- **DNA yanılması:** yeni kullanıcıda yetersiz veri → "DNA henüz oluşuyor" message
- **Bildirim yorgunluğu:** spaced repetition spammer → user'ın istediği frekansa ayarla
- **GPA formülü:** her üniversite farklı → opsiyonel ayar

#### Başarı Metriği
- DNA oluşturmuş kullanıcı oranı > %50
- 30 günlük retention > %40
- Spaced repetition bildirim CTR > %20

---

### Phase 6 — Multimodal ve Live AI Tutor 🎙️

**Süre:** 3 hafta
**Hedef:** Premium WOW factor — ücretli tier'ın asıl differentiator'ı.

#### Kapsam (DAHİL)
- **Sesli AI Tutor (Gemini Live API):**
  - Real-time voice conversation
  - "Bu konuyu anlat" → ses ile cevap
  - Türkçe akıcı diksiyon
  - Konuşma sırasında konu kartı görsel olarak güncellenir
- **El Yazısı Not OCR:**
  - Defter sayfası fotoğrafla → metin çıkar
  - Math formüllerini LaTeX'e dönüştür
  - Otomatik dijital nota dönüş
- **Ders Kaydı Analiz:**
  - Audio upload (45 dk-90 dk)
  - Transcript + key topics + "hocanın bu sınavda çıkar dedi" cümleleri
  - Slayt OCR ile kombinasyon
- **Multimodal Search:**
  - "Şu denkleme benzer soru var mı?" — formül fotoğrafla → benzer soru bul

#### Acceptance Criteria
- [ ] Sesli tutor 5 sn içinde cevap vermeye başlar
- [ ] OCR > %90 doğruluk (basit notlar)
- [ ] Ders kaydı transcripti < 5 dk işlenir (60dk audio için)

#### Teknik Değişiklikler
- Gemini Live API entegrasyonu (yeni)
- WebRTC + ses streaming
- OCR: Google Vision API veya Tesseract + Gemini multimodal
- Transcript: Gemini multimodal audio

#### Çıktılar
- Premium tier'ın asıl satış noktası
- Yüksek engagement (sesli interaksiyon viral)

#### Riskler
- **Ses kalitesi:** sınav öncesi ortam gürültülü → fallback to text
- **Maliyet:** Live API pahalı → premium-only
- **Latency:** real-time = network duyarlı

#### Başarı Metriği
- Premium dönüşüm oranı %2 → %8 (Phase 6 etkisi)
- Sesli tutor kullanım > 10 dk/oturum

---

### Phase 7 — B2B ve Marketplace 🏢

**Süre:** 4 hafta
**Hedef:** Gelir çeşitlendirme, kategori liderliği.

#### Kapsam (DAHİL)
- **Hoca Portal (B2B bireysel):**
  - Hoca kayıt + onay (üniversite email doğrulama)
  - Dashboard: kendi sınavlarındaki öğrenci performansı
  - "Bu sömestr öğrencilerin en çok zorlandığı 3 konu"
  - Müfredat ayarlama önerileri
  - Verified hoca rozeti
- **Üniversite Portal (B2B kurumsal):**
  - Aggregate insights (anonimleştirilmiş)
  - Hangi derslerde başarısızlık yüksek
  - Hangi hocaların yöntemleri etkili
  - Subscription: ₺50K-200K/yıl
- **Tutoring Marketplace:**
  - Tutor profili + saatlik ücret
  - Öğrenci eşleştirme (hocaya/derse göre)
  - %15 komisyon
- **Premium Notes Marketplace:**
  - Mezunlar kendi notlarını satabilir
  - ProfAI %30 komisyon
  - Quality control (rating sistemi)

#### Acceptance Criteria
- [ ] Üniversite resmî email doğrulama çalışır
- [ ] Tutor onboarding < 10 dk
- [ ] Marketplace ödeme entegre (iyzico/paddle)

#### Teknik Değişiklikler
- Yeni roller: HOCA, UNIVERSITY_ADMIN, TUTOR
- Ödeme entegrasyonu (iyzico)
- KYC/onay süreci
- Faturalama

#### Riskler
- **Hoca onay zorluğu:** kim gerçekten hoca → email doğrulama + manuel inceleme
- **KVKK:** anonim aggregation gerçekten anonim mi → 5+ kişi grupları
- **Marketplace kalite:** kötü tutor/notlar → rating + ban

#### Başarı Metriği
- 100+ doğrulanmış hoca (faz sonu)
- 10+ üniversite müşterisi
- Marketplace GMV > ₺100K/ay

---

## 9. Teknik Mimari Evrimi

### 9.1 Mevcut Durum (Phase 0)

```
┌─────────────────────────────────────────────┐
│              React + Vite SPA               │
│   (Tailwind, Framer Motion, Recharts)       │
└──────────────────┬──────────────────────────┘
                   │ REST + JWT
┌──────────────────▼──────────────────────────┐
│         Express + TypeScript Server         │
│   ┌──────────┬──────────┬──────────────┐    │
│   │   Auth   │ Upload   │  Analysis    │    │
│   │ (JWT)    │ (Multer) │  (Gemini)    │    │
│   └──────────┴──────────┴──────────────┘    │
└──────────────────┬──────────────────────────┘
                   │ Prisma
┌──────────────────▼──────────────────────────┐
│              PostgreSQL 15                  │
│   User, Professor, Course, Exam,            │
│   ExamAnalysis, ProfessorRating             │
└─────────────────────────────────────────────┘
```

### 9.2 Hedef Mimari (Phase 5+)

```
┌─────────────────────────────────────────────┐
│      React SPA + Mobile (React Native)      │
└──────────┬──────────────────────────────────┘
           │
┌──────────▼─────────┬─────────────┬──────────┐
│   API Gateway      │  WebSocket  │  CDN     │
│   (Express + RL)   │  (Socket.io)│ (assets) │
└──────────┬─────────┴──────┬──────┴──────────┘
           │                │
┌──────────▼─────────┐ ┌────▼─────────────────┐
│  Core Services     │ │  AI Pipeline         │
│  - Auth            │ │  - Gemini Provider   │
│  - User/Prof CRUD  │ │  - Prompt Library    │
│  - Exam            │ │  - Cache Layer       │
│  - Notes           │ │  - Cost Tracker      │
│  - StudyPack       │ │  - Quality Monitor   │
│  - MockExam        │ │                      │
│  - Community       │ │                      │
│  - DNA             │ │                      │
└──────────┬─────────┘ └──────────┬───────────┘
           │                      │
           └─────────┬────────────┘
┌────────────────────▼──────────────────────┐
│           PostgreSQL (Prisma)             │
│  + Redis (cache, sessions, rate limiting) │
│  + S3 (file storage, uploads)             │
│  + BullMQ (background jobs, reminders)    │
└───────────────────────────────────────────┘
```

### 9.3 Yeni Tabloların Eklenme Sırası

| Phase | Yeni Tablolar |
|-------|---------------|
| Phase 1 | `ProfessorStyleProfile` |
| Phase 2 | `StudentNote`, `StudyPack` |
| Phase 3 | `MockExam`, `MockExamSession` |
| Phase 4 | `UserCredit`, `ExamApproval`, `QuestionVote`, `PostExamReport`, `StudyGroup` |
| Phase 5 | `AcademicDNA`, `ConfidenceScore`, `GradeRecord`, `SpacedRepetition` |
| Phase 6 | `VoiceSession`, `OCRResult` |
| Phase 7 | `Tutor`, `TutoringSession`, `MarketplaceItem`, `Payment`, `UniversityAccount` |

### 9.4 AI Pipeline Soyutlaması

Phase 1'den itibaren her AI çağrısı `aiService` katmanından geçer:

```ts
interface AIService {
  analyzeExam(file): Promise<ExamAnalysis>          // Phase 0 ✓
  generateStyleSummary(profile): Promise<string>     // Phase 1
  generateStudyPack(notes, profile): Promise<Pack>   // Phase 2
  generateMockExam(profile, pack): Promise<Exam>     // Phase 3
  gradeAnswer(q, answer, rubric): Promise<Grade>     // Phase 3
  voiceTutor(audio, context): Promise<AudioResponse> // Phase 6
}
```

Her metot:
- Input validation
- Cache check
- Provider abstraction (Gemini → Claude → local fallback)
- Cost tracking
- Quality logging

### 9.5 Performans Hedefleri

| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| Page load | 200ms | 500ms | 1s |
| Search | 100ms | 300ms | 500ms |
| Exam upload + analyze | 5s | 15s | 30s |
| Study pack generate | 15s | 45s | 90s |
| Mock exam generate | 30s | 90s | 180s |

### 9.6 Ölçeklenme Stratejisi

| Kullanıcı sayısı | Stack |
|------------------|-------|
| 0-1K | Mevcut (single VPS) |
| 1K-10K | + Redis cache, CDN, optimized queries |
| 10K-100K | + Read replicas, Gemini batch API, queue background jobs |
| 100K+ | Microservices, K8s, multi-region |

---

## 10. Riskler ve Mitigasyonlar

### 10.1 Hukuki / Privacy

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **KVKK ihlali (gerçek hoca isim + öğrenci puanları)** | Yüksek | Kritik | Hocaların onayı + içerik moderasyonu + KVKK aydınlatma metni + DPO |
| **Telif (öğrenci notu içerik)** | Orta | Yüksek | "Sadece kişisel kullanım" disclaimer + DMCA takedown sistemi |
| **Üniversite akademik dürüstlük itirazı** | Orta | Yüksek | "Geçmiş sınavlar = yalnızca çalışma" + üniversite ortaklık programı |
| **Sınav rekonstrukte etik konusu** | Düşük | Orta | Onaylı geçmiş sınavlar değil, "tahminler" framing'i |

### 10.2 Teknik

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **Gemini API kesintisi** | Orta | Yüksek | Multi-provider fallback (Claude, Llama lokal) |
| **AI hallucination** | Yüksek | Orta | Prompt engineering, kullanıcı feedback loop, "AI üretimidir" badge |
| **Cost explosion** | Yüksek | Yüksek | Aggressive caching, tier limits, batch processing |
| **Performance (10K+ kullanıcı)** | Orta | Orta | Redis cache, CDN, query optimization |

### 10.3 Ürün

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **Düşük topluluk katılımı** | Yüksek | Yüksek | Gamification, kredi sistemi, ilk 1K kullanıcıya manuel onboarding |
| **AI çıktı kalitesi yetersiz** | Orta | Yüksek | A/B test, kullanıcı oylama, prompt iteration |
| **Mobile UX yokluğu** | Yüksek | Orta | Phase 6'da React Native priority |

### 10.4 İş Modeli

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **Premium dönüşüm düşük** | Orta | Yüksek | Sınırlı free tier + premium-only killer features (mock exam, voice tutor) |
| **Üniversiteler engelleyebilir** | Düşük | Yüksek | Önden university partnership outreach |
| **ChatGPT free tier kullanıcı çeker** | Yüksek | Orta | Yerel context + Türkçe + KVKK avantajı vurgulama |

---

## 11. Başarı Metrikleri (KPI)

### 11.1 North Star Metric

**"Sınavdan önce ProfAI'ı kullanmış öğrenci sayısı / hafta"**

Bu metrik:
- Kullanıcının core value'ya ulaştığını gösterir
- Topluluk büyümesini ölçer
- Aha moment'in yakalandığını doğrular

### 11.2 Faz Bazlı Hedefler

| Faz | Toplam Kullanıcı | Aktif (haftalık) | Premium | Net Promoter |
|-----|------------------|-------------------|---------|--------------|
| Phase 1 | 500 | 100 | 0 | 30 |
| Phase 2 | 2K | 400 | 10 | 40 |
| Phase 3 | 5K | 1K | 50 | 50 |
| Phase 4 | 15K | 3K | 200 | 55 |
| Phase 5 | 30K | 6K | 600 | 60 |
| Phase 6 | 50K | 10K | 1.5K | 65 |
| Phase 7 | 100K | 20K | 5K | 70 |

### 11.3 Funnel Metrikleri

| Aşama | Hedef Conversion |
|-------|------------------|
| Ziyaretçi → Kayıt | %15 |
| Kayıt → İlk yükleme | %50 |
| İlk yükleme → 7 gün retention | %60 |
| 7d retention → 30d retention | %50 |
| Aktif → Premium | %8 |
| Premium → 6 ay churn | <%30 |

### 11.4 Kalite Metrikleri

| Metrik | Hedef |
|--------|-------|
| AI çıktı "faydalı" oranı (kullanıcı oylaması) | >%75 |
| Mock exam tahmin doğruluğu (gerçek sınav vs tahmin) | ±10 puan içinde >%70 |
| Süre ortalaması (page load) | <500ms |
| Crash rate | <%0.1 |

---

## 12. Açık Sorular ve Karar Bekleyen Konular

### 12.1 Ürün

- [ ] **AI çıktı tarzı:** Resmi/akademik mi, samimi/genç mi? (öğrencinin sevdiği)
- [ ] **Free tier sınırı:** ne kadar açık olsun? (çok cömert = premium dönüşüm düşer, çok kısıtlı = kullanıcı kaybı)
- [ ] **Hoca opt-out:** hocalar kendi adlarını kaldırmak isterse? (bu durumda anonim "Hoca A" göster?)
- [ ] **Sınav cevap key paylaşımı:** etik açıdan tartışmalı (kopya destek sayılabilir)
- [ ] **Mobile-first vs desktop-first:** öncelik?

### 12.2 Teknik

- [ ] **Cache strategy:** Redis vs in-process? (Redis = scalable, in-process = simple)
- [ ] **File storage:** S3 mi local mi? (S3 = production, local = development)
- [ ] **Background jobs:** BullMQ vs node-cron vs cron? (BullMQ = robust)
- [ ] **AI provider stratejisi:** Sadece Gemini mi, Claude+OpenAI fallback mı?
- [ ] **Mobile:** React Native, Flutter, native?

### 12.3 İş

- [ ] **İlk hedef üniversite:** İstanbul Aydın (mevcut user base) mı, Boğaziçi (prestij) mi?
- [ ] **Pricing:** ₺49 doğru mu? (öğrenci alım gücü düşük)
- [ ] **Yatırım stratejisi:** Bootstrap vs seed funding?
- [ ] **Co-founder/team:** kim katılacak?

### 12.4 Hukuki

- [ ] **KVKK aydınlatma metni** kim yazacak? (avukat şart)
- [ ] **Üniversite ortaklık modeli:** revenue share mi, lisans mı?
- [ ] **Hoca onay süreci:** email + ID kart fotoğrafı yeterli mi?

---

## 13. Ek (Appendix)

### 13.1 Glossary

| Terim | Tanım |
|-------|-------|
| **Hoca stili** | Profesörün soru sorma kalıpları (tip dağılımı, konu tercihi, zorluk) |
| **Study Pack** | Hoca stili + öğrenci notu birleşiminden üretilen kişisel çalışma materyali |
| **Mock Exam** | AI'nın hocanın stilini taklit ederek ürettiği pratik sınav |
| **Akademik DNA** | Öğrencinin learning style + güçlü/zayıf konuları + tercih profilinin agregasyonu |
| **Confidence Map** | Her konu için "hazırım" yüzdesi |
| **Sınav Otopsisi** | Sınav sonrası "neler çıktı?" kullanıcı raporu |
| **Verified Soru** | Topluluk tarafından onaylanmış AI üretimi pratik soru |

### 13.2 Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın — vizyon, 7 faz roadmap, mimari, riskler |

### 13.3 İlgili Dokümanlar

- [`ProfAI_Product_Documentation.md`](./ProfAI_Product_Documentation.md) — mevcut ürün spec'i
- [`ProfAI_Risk_Analysis_v2.md`](./ProfAI_Risk_Analysis_v2.md) — detaylı risk matrisi
- [`ProfAI_Testing_and_Success_Criteria.md`](./ProfAI_Testing_and_Success_Criteria.md) — test stratejisi
- [`JIRA_TASK_STRUCTURE.md`](./JIRA_TASK_STRUCTURE.md) — sprint task'ları
- [`ProfAI_Demo_Plan.md`](./ProfAI_Demo_Plan.md) — demo senaryosu

### 13.4 Araç ve Kütüphaneler (Mevcut + Planlanan)

| Katman | Mevcut | Planlanan |
|--------|--------|-----------|
| Frontend | React 18, Vite, Tailwind, Framer Motion, Recharts, react-i18next | + React Native (Phase 6) |
| Backend | Express, Prisma, JWT, bcrypt | + BullMQ (Phase 4), Socket.io (Phase 6) |
| Database | PostgreSQL 15 | + Redis (Phase 3+) |
| AI | Gemini 2.5 Flash | + Gemini Live (Phase 6), Claude fallback |
| File Storage | Local | S3 / R2 (Phase 4+) |
| Auth | JWT | + OAuth (Phase 5+) |
| Payments | — | iyzico (Phase 7) |
| Monitoring | — | Sentry, Plausible (Phase 1) |
| CI/CD | GitHub Actions | + preview deploys |

---

## 🎯 Şimdiki Karar

Bu doküman onaylandıktan sonra:

1. **Phase 1 başlama**: ProfessorDetailPage rebuild (hoca-merkezli stil profili)
2. Sprint planning: 5 task'a böl, her birini ayrı PR yap
3. Doc her faz sonunda update edilir (Versiyon Geçmişi'ne kayıt)

**Son söz:** Bu doküman canlı bir kaynak. Her sprint sonunda, bir önceki fazın gerçekleşen sonuçlarına göre revizyon yap. Vizyon sabit, taktikler esnek.
