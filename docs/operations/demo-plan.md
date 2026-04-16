# Demo Planı — 20-25 dk Senaryosu

**Hedef kitle:** Dr. Öğr. Üyesi Peri Güneş (UYG338 hocası), jüri, üniversite yetkilileri, potansiyel B2B müşterisi.
**Süre:** 20-25dk sunum + 5dk Q&A.
**Hazırlık:** Demo hesabı + seed DB + internet (Gemini call).

---

## 1. Hikâye Akışı (Narrative)

Demo **senaryo-bazlı**, feature-by-feature değil. Öğrencinin bir günü:

> Erdem, İstanbul Aydın Bilgisayar Müh. 2. sınıf öğrencisi. Yarın **UYG338 Software Project Management** vizesi var. Panik halinde ProfAI'ı açıyor.

---

## 2. Demo Adımları

### Sahne 1 — Açılış (2 dk)

- HomePage aç. Tagline'ı göster. "Bu, ChatGPT değil — Türk üniversiteliye özel AI."
- 200 üniversite + 4500 hoca + 17K sınav seed verisini vurgula.
- Dark mode toggle. TR/EN switch.

**Mesaj:** Premium bir deneyim, gerçek veri tabanı.

### Sahne 2 — Hoca Keşif (3 dk)

- ProfessorListPage'e git. City pills, faceted filter.
- "Istanbul Aydin" filtrele → 6 gerçek hoca görünür.
- "Peri Güneş" ara. Sonuç tıkla.

**Mesaj:** Kullanıcı kendi hocasını kolayca buluyor.

### Sahne 3 — Hocanın Stili (5 dk) — **Phase 1 killer**

- ProfessorDetailPage. **Hero: "Hocanın Stili"**
- Aggregate pie + bar chart: "%50 klasik, %30 MC, %20 T/F"
- 4 metric kartı: Toplam sınav, avg zorluk, avg soru sayısı, baskın tip.
- "Hocanın Tarzı" Gemini özeti oku: *"Peri hocam genelde proje yönetimi framework sorularını klasik formatta sorar, scrum ve agile'a ağırlık verir..."*
- Hoca evrim grafiği: son 3 yılın trendi.
- Top 10 konu rozeti.

**Mesaj (vurgulanır):** *"Bu bilgi, ChatGPT'nin bilemeyeceği bir şey. Peri hocamın gerçek sınav verisinden çıkıyor."*

### Sahne 4 — Kişisel Çalışma Paketi (5 dk) — **Phase 2 preview**

- Upload Notes sayfası (Phase 2 mock ekran göster).
- "Ders notumu yüklüyorum..." → study pack üretimi.
- Üretilen study pack:
  - **Tab 1:** Konu özetleri (hocanın diliyle).
  - **Tab 2:** 5 pratik soru (hocanın tipiyle).
  - **Tab 3:** Hoca pattern'leri: "Scrum rolleri her finalde çıkar."

**Mesaj:** *"Ben notumu yükledim, hocanın stiline göre özet ve sorular aldım — 30 saniyede."*

> Not: Phase 2 henüz yok, mock/slide göster.

### Sahne 5 — Mock Exam Preview (3 dk) — **Phase 3 preview**

- Mock exam screenshot / video:
  - Timer 90dk.
  - 25 soru, hocanın formatında.
  - Submit → AI grade.
  - Sonuç: 78/100 — tahmin "gerçek sınavda 72-80 arası".
  - "Konu boşluğun: Risk yönetimi → çalışma öneriyorum."

**Mesaj:** *"AI sınava girmeden önce nerede olduğumu söylüyor."*

### Sahne 6 — Topluluk + Kredi (2 dk) — **Phase 4 preview**

- "Ben sınav yükledim, 10 kredi kazandım." Credit dashboard screenshot.
- "Arkadaşım Ahmet de yükledi → sınav verified oldu."
- Study group eşleştirme: "Peri hocamdan 12 kişi daha var, WhatsApp grubu kuruldu."

**Mesaj:** *"Yalnız değilim — topluluk benimle çalışıyor."*

### Sahne 7 — 4 Yıllık DNA (2 dk) — **Phase 5 preview**

- Akademik DNA profili screenshot.
- Skill graph (radar chart).
- Confidence map (heatmap).
- GPA simulator: "Bu vizeden 70 alırsam yarıyıl notum 85, genel GPA 3.24."

**Mesaj:** *"ProfAI beni 4 yıl boyunca tanıyacak — Khan Academy artı LinkedIn gibi."*

### Sahne 8 — Vizyon + B2B (2 dk)

- Roadmap: 7 faz, 9 ay.
- Business model: freemium + B2B + marketplace.
- Üniversite dashboard mockup: "Eğitim direktörleri için anonim aggregation."

**Mesaj:** *"Bugün: öğrenci yardımcısı. 1 yıl sonra: Türkiye'nin akademik platformu."*

### Sahne 9 — Kapanış (1-2 dk)

- "Neden şimdi?" sorusuna cevap: teknoloji hazır, pazar boş, KVKK avantajı, yerel context.
- Jüri mesajı: bu project management dersi proje, ama **gerçek bir startup vizyonu**.
- Q&A aç.

---

## 3. Demo Hazırlık Checklist

**1 hafta önce:**

- [ ] Demo hesap hazırla: `erdemacar1@stu.aydin.edu.tr` / `password123`
- [ ] Seed DB güncel (`npm run seed`)
- [ ] Peri Güneş hoca profili 5-6 sınav analizli hazır olsun
- [ ] Phase 2/3 screenshot / mock ekran hazırla (henüz kod yok)
- [ ] Slaytlar: hikâye + feature + roadmap + business model
- [ ] Internet test — Gemini call 2 kere sorunsuz çalışsın

**1 gün önce:**

- [ ] Docker `up -d` ve smoke test.
- [ ] Tarayıcı bookmark'ları: Home, Peri Güneş detay, dashboard.
- [ ] Yedek plan: Gemini down olursa local cached response göster.

**Demo günü:**

- [ ] Laptop fan test (overheat demo crash'i).
- [ ] HDMI adapter + yedek cable.
- [ ] Projektör: 1920×1080 test.
- [ ] Dark mode default aç (öğleden sonra parlaklık).
- [ ] Zoom seviyesi 110% (jüri arka sırada görsün).

---

## 4. Soru-Cevap Hazırlığı

**Beklenen sorular + cevaplar:**

**Q: "KVKK uyumlu mu? Hocaların adları açık."**
A: Public bilgi + resmi email onay süreci + opt-out. Aydınlatma metni hazırlanacak.

**Q: "Gemini ücretli. Maliyet nasıl sürdürülür?"**
A: Aggressive caching + freemium limit + premium tier. Birim ekonomi: ARPU ₺49, cost ₺3 → margin %80.

**Q: "ChatGPT'den farkı ne?"**
A: ChatGPT hocayı bilmez. Biz 17K sınav verisinden hoca stilini çıkarıyoruz.

**Q: "Akademik dürüstlük?"**
A: "Geçmiş sınav analizi" değil, "stil profili". Üniversite partnership ile meşruiyet.

**Q: "Kopyalanır mı?"**
A: Veri moat, topluluk network, yerel ilişki. Yeni başlayan 0'dan başlar.

**Q: "B2B ne zaman?"**
A: Phase 7 (≈9 ay). İlk B2C ölçeği (50K aktif) gerekli.

**Q: "Kendi başına mı yapıyorsun?"**
A: Şu an solo. Phase 4-5 için co-founder arıyorum.

---

## 5. Demo Metrik Hedefleri

**Demo sırasında ölç:**

- [ ] Gülümseme / ilgi görece tepki (gözlem)
- [ ] Jürinin sorduğu soru sayısı (> 3 iyi sinyal)
- [ ] "Vay be" anı (Aha #1, Aha #3 için hazır)

**Demo sonrası:**

- [ ] Takip email: slaytlar + demo hesap erişimi + roadmap PDF
- [ ] 48 saat içinde jüri feedback topla

---

## 6. Alternatif Demo Seçenekleri

**Kısa versiyon (10dk):** Sahne 1 + 2 + 3 + 8 + 9. Sadece Phase 0-1.
**Uzun versiyon (45dk):** Her sahne + teknik deep dive + canlı kod demo.
**Video version:** Kaydedilmiş versiyonu YouTube'a yükle (async paylaşım).

---

## 7. Killer Anlar (Öncelik)

Demo'da en önemli **3 moment**:

1. **"Hocanın Tarzı" Gemini özeti** okunur → jüri "vay be, bu gerçekten hocaya özel" der.
2. **Mock exam tahmin sonucu** → "gerçek sınavda 72-80" = viral feature.
3. **Roadmap sonu slayt** → "bugün öğrenci → yarın platform" vizyon sıçraması.

Bunlar zamanını aşan yerlerde ödün verme — diğer sahneleri kes.

Detay: [`../killer-moments.md`](../killer-moments.md).

---

## İlgili

- Demo hesap bilgileri: [`../../CLAUDE.md`](../../CLAUDE.md#geliştirme-komutları)
- Killer moments: [`../killer-moments.md`](../killer-moments.md)
- KPI: [`kpis.md`](./kpis.md)
- Vizyon özeti: [`../vision/00-executive-summary.md`](../vision/00-executive-summary.md)
