# Sonraki Session İçin Handoff Prompt

> **Kullanım:** Bu dosyanın **içeriğini** kopyalayıp yeni Claude Code session'ına yapıştır. Tüm bağlam ve sıradaki işler dahildir.

---

## 🎯 Hızlı Bağlam

Sen ProfAI projesinde çalışıyorsun. Önceki session'da büyük bir **vizyon pivotu** yaptık ve **kapsamlı bir Vision & Roadmap dokümanı** yazdık. Şimdi diğer dokümanları bu yeni vizyona göre güncellemen gerekiyor.

**Proje:** ProfAI — Türk üniversite öğrencileri için AI destekli akademik co-pilot platformu. Hocanın geçmiş sınav stilini analiz eder, öğrencinin konu materyalini hoca stiline göre özelleştirir, mock sınav üretir, topluluk verisiyle ölçeklenir.

**Ben kimim:** Erdem Acar — İstanbul Aydın Üniversitesi, Bilgisayar Mühendisliği öğrencisi. Bu projeyi UYG338 — Software Project Management dersi kapsamında geliştiriyorum (gerçek hocam: Dr. Öğr. Üyesi Peri Güneş).

**Sen ne yapacaksın:** Bu session'da SADECE dokümantasyon güncellemeleri yapacağız. Kod değişikliği yok. Mevcut dokümanları yeni vizyona göre senkronize edeceğiz.

---

## 📚 Mevcut Dokümantasyon

`/home/erdemacar6/ProfAI/docs/` altında:

| Dosya | Durum | Açıklama |
|-------|-------|----------|
| **`ProfAI_Vision_and_Roadmap.md`** ⭐ | YENİ (1215 satır) | **Ana referans** — yeni vizyon, 7 faz roadmap, mimari, riskler, KPI'lar |
| `ProfAI_Product_Documentation.md` | ESKİ (Phase 0 versiyonu) | Mevcut MVP spec'i — yeni vizyona göre **güncellenmeli** |
| `ProfAI_Risk_Analysis_v2.md` | ESKİ | Risk matrisi — yeni fazlardaki riskler eklenmeli |
| `ProfAI_Risk_Analysis.md` | ESKİ v1 | İlk versiyon — eski |
| `ProfAI_Testing_and_Success_Criteria.md` | ESKİ | Test planı — yeni özelliklere göre genişletilmeli |
| `ProfAI_Demo_Plan.md` | ESKİ | 15dk demo senaryosu — yeni özelliklere göre revize |
| `JIRA_TASK_STRUCTURE.md` | ESKİ | 30 task/4 sprint — Phase 1+ task'larıyla değiştirilmeli |
| `ProfAI_Project_Plan.xlsx` | ESKİ | Excel proje planı — güncelleme dışında bırak (manuel) |
| `ProfAI_UML_Diagrams.drawio` | ESKİ | UML diyagramı — yeni mimariye göre güncellenmeli |
| `_NEXT_SESSION_PROMPT.md` | Bu dosya | Handoff dokümanı |

---

## 🚀 Bu Session'da Yapılacaklar (Sıralı)

### Doküman Güncelleme Görevleri

**1. ProfAI_Product_Documentation.md güncelle (öncelik: yüksek)**
- Yeni vizyon cümlesi ve konumlandırma ekle
- "5 Stratejik Sütun" yapısını yansıt
- Mevcut MVP açıklamalarını "Phase 0" başlığına taşı
- Phase 1+ için planlanan özellikleri "Roadmap" bölümüne ekle (Vision_and_Roadmap'e link ver)
- Eski "30 üniversite, sadece İstanbul" referanslarını kaldır → "200+ Türkiye geneli"

**2. ProfAI_Risk_Analysis_v2.md güncelle**
- Yeni fazlardaki riskleri ekle:
  - Phase 2: AI hallucination, telif hakkı, KVKK
  - Phase 4: spam yüklemeler, akademik dürüstlük itirazı, sınav rekonstrukte etiği
  - Phase 5: persistent memory privacy
  - Phase 6: ses kaydı KVKK
  - Phase 7: B2B regulasyonu
- Vision_and_Roadmap'teki Bölüm 10'u referans alarak genişlet

**3. ProfAI_Testing_and_Success_Criteria.md güncelle**
- Phase bazlı test planları ekle
- Yeni endpoint'ler için test case'leri (study pack, mock exam, vb.)
- Vision_and_Roadmap'teki Bölüm 11 (KPI) ile senkronize et

**4. ProfAI_Demo_Plan.md güncelle**
- Yeni özellikleri demo'ya ekle (en az: aggregated hoca stili, study pack, mock exam preview)
- 15dk → 20-25dk demo senaryosu
- "Killer Aha Anları" (Vision Bölüm 7) demo'da kullanılacak

**5. JIRA_TASK_STRUCTURE.md güncelle**
- Mevcut Sprint 0-3 yapısını "Phase 0" olarak işaretle
- Phase 1 için detaylı task breakdown ekle (5-7 task)
- Phase 2-7 için epic seviyesinde özet ekle (her faz için 1-3 satır)
- Vision_and_Roadmap'teki "Phase X — Acceptance Criteria" bölümlerini kaynak olarak kullan

**6. (Opsiyonel) Yeni dokümanlar yaratılabilir**
- `ProfAI_Phase1_Spec.md` — Phase 1 detaylı implementation spec'i
- `ProfAI_API_Reference.md` — Endpoint dokümantasyonu
- `ProfAI_Architecture_Decision_Records.md` — ADR formatında teknik kararlar

---

## 🎨 Bu Session'da Yapılan Geliştirmeler (Bağlam)

Önceki session'da kod tarafında çok şey yapıldı. **Bu session'da bunlara DOKUNMA**, sadece dokümante et.

### Frontend (Edu-Premium UI)

**Design system:**
- `client/tailwind.config.js` — CSS variable based design tokens
- `client/src/index.css` — light + dark theme variables
- Inter (body) + Plus Jakarta Sans (display) fontları
- Edu-premium violet primary (#7C3AED) palette

**Components yapıldı:**
- `client/src/context/ThemeContext.tsx` — light/dark toggle, localStorage persist
- `client/src/components/ThemeToggle.tsx`
- `client/src/components/LanguageSwitcher.tsx` (TR/EN)
- `client/src/components/Avatar.tsx` (BoringAvatars)
- `client/src/components/SearchableSelect.tsx` (faceted dropdowns)
- `client/src/components/CourseCombobox.tsx` (debounced course search)
- `client/src/components/CityPills.tsx` (top cities with counts)

**i18n:**
- `client/src/i18n/index.ts`
- `client/src/i18n/locales/{en,tr}.json`
- react-i18next + browser language detector
- Default: EN, fallback: EN, persist localStorage

**Sayfalar redesign edildi:**
- HomePage (hero + stats + how-it-works + popular)
- ProfessorListPage (URL sync, faceted counts, city pills, sort, discovery rows, "benim üniversitem" pin, pagination)
- ProfessorDetailPage (hero + per-exam analiz + ratings)
- UploadPage (multi-file + post-upload preview cards)
- DashboardPage (real /api/exams/mine data)
- LoginPage / RegisterPage (premium forms)
- AnalysisCard (Recharts pie + bar)
- RatingForm (star ratings)

### Backend (Yeni endpoint'ler)

**Yeni endpoint'ler:**
- `GET /api/professors/filters` — counts + cities
- `GET /api/professors/discovery?university=X` — topRated + byUserUni
- `GET /api/professors/:id/style-profile` — *PHASE 1'DE EKLENECEK*
- `GET /api/exams/mine` — user's uploads
- Search artık name + dept + university'de birden arar
- `GET /api/courses` artık `search`, `university`, `professorId` filters destekler
- Pagination max 200, default 20

**Server config:**
- Gemini integration: `server/src/services/llm/geminiProvider.ts`
- Mevcut model: `gemini-2.5-flash-lite` (env: `.env`'de `GEMINI_MODEL`)
- API key: `server/.env` ve root `.env` (gitignored)
- Real PDF analysis çalışıyor (OCR + structured output)

### Veritabanı

**Mevcut seed:**
- 200 Türk üniversitesi (`server/src/data/turkish-universities.ts`)
- ~4500 fictional professor (Türkçe isimler + unvanlar)
- 11K+ ders, 17K+ sınav, 27K+ değerlendirme
- 11 demo kullanıcı

**Real overrides** (gerçek veriler):
- İstanbul Aydın Üniversitesi → "Yazılım Geliştirme (İngilizce)" bölümü
- 6 gerçek hoca + 6 gerçek ders:
  - UMI332 Research Methodology — Doç. Dr. Burçin Kaplan
  - UYG314 Data Mining and Business Intelligence — Dr. Öğr. Üyesi Kağan Okatan
  - UYG316 Statistical Analysis on Data Science — Dr. Öğr. Üyesi Özlem Öztürk
  - UYG332 Image Processing — Prof. Dr. Ali Okatan
  - UYG338 Software Project Management — Dr. Öğr. Üyesi Peri Güneş
  - YUM304 Work Placement-II — Prof. Dr. Ali Güneş
- Override sistemi: `REAL_OVERRIDES` array → `prisma/seed.ts`

**Seed çalıştırma:**
```bash
cd server && npm run seed   # 30 saniye, tüm veriyi yeniler
```

**Demo kullanıcılar (şifre: `password123`):**
- `erdemacar1@stu.aydin.edu.tr` (Erdem Acar — İst. Aydın, Bilgisayar Müh.)
- `demo@profai.com` (Demo Öğrenci — YTÜ)
- `ali@bogazici.edu.tr`, `ayse@itu.edu.tr`, `mehmet@marmara.edu.tr`, `zeynep@ku.edu.tr`, vb.

---

## 🏗️ Mevcut Sistem Mimarisi

```
React + Vite SPA  ──REST/JWT──>  Express + TS Server  ──Prisma──>  PostgreSQL 15
       │                              │
       │                              ├── Gemini 2.5 Flash Lite (analiz)
       │                              └── Multer (file upload)
       │
       └── i18n (TR + EN)
       └── ThemeProvider (light + dark)
       └── BoringAvatars
       └── Framer Motion + Recharts
```

**Docker:**
```bash
docker compose up -d            # tüm servisler ayağa
docker compose ps               # durum
docker compose build server client && docker compose up -d --force-recreate server client
```

**Portlar:**
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:5000`
- DB: `localhost:5432` (user/pass: `profai/profai123`, db: `profai`)

---

## 🔑 Önemli Bilgiler

**API Key (`.env` — gitignored):**
- Gemini API key proje root'taki `.env`'de
- Production-ready, AI Studio'dan ücretsiz tier
- Model: `gemini-2.5-flash-lite` (stabil; `gemini-2.5-flash` 503 veriyordu)

**Konvansiyonlar:**
- Türkçe naming: dosya/değişken/yorum İngilizce, kullanıcı görür Türkçe
- i18n key'leri İngilizce (örn: `nav.signIn`)
- Dosya isimlendirme: `ProfAI_TopicName.md` pattern'i (mevcut docs)
- Git: main branch, commit mesajları İngilizce

**Henüz yapılmamış (Phase 1-7 işleri):**
- ProfessorStyleProfile cache tablosu
- StudentNote / StudyPack tabloları
- MockExam tabloları
- AcademicDNA / ConfidenceScore
- Topluluk özellikleri (kredi, oylama, gruplar)
- Voice tutor
- B2B portal

---

## 🎯 Sıradaki Adımlar (Bu Session'da)

**Tavsiye edilen sıra:**

1. **İlk önce:** `ProfAI_Vision_and_Roadmap.md`'i baştan sona oku (1215 satır, 49 KB) — bu ana referans.

2. **Diğer doküman güncellemelerini sırayla yap:**
   - Önce `ProfAI_Product_Documentation.md` (en kritik, en eski)
   - Sonra `ProfAI_Risk_Analysis_v2.md`
   - Sonra `ProfAI_Testing_and_Success_Criteria.md`
   - Sonra `JIRA_TASK_STRUCTURE.md` (Phase 1 task breakdown)
   - Son olarak `ProfAI_Demo_Plan.md`

3. **Her doküman güncellemesi için:**
   - Önce dosyayı oku (Read tool)
   - Hangi bölümlerin güncellenmesi gerektiğini bana sun
   - Onayım sonrası güncelle (Edit veya Write)
   - Versiyon notu ekle (örn: "v2.1 — yeni vizyon entegrasyonu")

4. **Karar bekleyen sorular:**
   - Eski dokümanları "v1 — historical" olarak işaretleyip yeni v2 yazsak mı, yoksa in-place güncelleme mi?
   - JIRA task yapısı hâlâ kullanılıyor mu, yoksa GitHub Issues'a mı geçiyoruz?
   - Demo Plan'daki süre 15dk mı kalacak, 25dk'ya mı uzayacak?

---

## ⚠️ Yapma!

- Kod değiştirme — bu session sadece dokümantasyon
- Seed çalıştırma — DB stabil, dokunma
- Yeni özellik geliştirme — Phase 1 başlamadan önce dokümantasyon
- `ProfAI_Vision_and_Roadmap.md`'i değiştirme — eğer değiştirmek gerekirse bana danış (kapsamlı, dikkatli yazıldı)

---

## 💡 Çalışma Tarzım

- **Türkçe iletişim**, kod İngilizce
- Adım adım profesyonel ilerlemek istiyorum (auto mode değil, plan + onay)
- Yaratıcı fikirleri seviyorum — proaktif öneri yap
- Hızlı, sonuç odaklı, gereksiz uzun açıklama istemem
- Dokümantasyon kaliteli ve scannable olsun (tablo, başlık, kısa paragraflar)

---

## 🚦 İlk Mesajın

Yeni session'a başladığında ilk mesajın şöyle olabilir:

> "Önceki session'ı `docs/_NEXT_SESSION_PROMPT.md` üzerinden devraldım. Vision_and_Roadmap dokümanını inceleyeceğim, sonra `ProfAI_Product_Documentation.md`'i nasıl güncellemek istediğini sun. Hazır mısın?"

---

**Hazırlayan:** Önceki session — 2026-04-16
**Sahip:** Erdem Acar (`erdemacar1@stu.aydin.edu.tr`)
**Lokasyon:** `/home/erdemacar6/ProfAI/`
