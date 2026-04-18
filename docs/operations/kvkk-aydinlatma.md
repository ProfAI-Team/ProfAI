# KVKK Aydınlatma Metni (Taslak — Avukat Review Bekliyor)

> ⚠️ **Avukat review bekliyor (2026-04-XX).** Bu metin teknik ekip tarafından hazırlanan taslaktır; üretim ortamına alınmadan önce KVKK uzmanı bir avukat tarafından incelenmesi ve onaylanması gerekir. Phase 6 task 6.25.

## Amaç

ProfAI (`profai.local` / mobil uygulama, bundan sonra "Platform") üzerinden hizmet aldığınız sürece toplanan kişisel verilerinizin hangi kategoride olduğunu, neden toplandığını, ne kadar süre saklandığını ve haklarınızı açıklar.

## Veri Sorumlusu

- **Veri Sorumlusu:** Erdem Acar (bağımsız öğrenci projesi — tüzel kişilik kurulmadı).
- **İletişim:** `kvkk@profai.local`
- **Ticari faaliyet:** Yok (akademik proje), ancak kullanıcılar tarafından üretilen içerik kişisel veri niteliğindedir.

## İşlenen Kişisel Veri Kategorileri

### A. Üyelik ve Kimlik Verileri
- Ad soyad, e-posta adresi, üniversite ve bölüm bilgileri (kayıt formu)
- Parola (bcrypt hash; orijinal saklanmaz)

### B. Akademik Veriler (Phase 1-5'te toplanıyor)
- Yüklediğiniz sınavlar, not fotoğrafları, çalışma paketleri
- Mock sınav cevaplarınız, skorlarınız, konu bazlı performansınız
- Hoca puanlamaları (difficulty, fairness skorları + isteğe bağlı yorum)
- Akademik DNA profili (çözülen soru istatistiği, learning style)
- Not kayıtları (GPA hesaplamak için ders × harf notu)

### C. Phase 6 ile Genişleyen Veriler

#### C.1. Canlı Tutor Konuşma Transkriptleri
- **Ne toplanıyor:** Canlı tutor oturumunda konuştuğunuz metinlerin transkripti + yapay zeka tutorun cevapları + oturumun süresi + interrupt sayısı.
- **Ses dosyası saklanıyor mu?** Hayır. Yalnızca metin transkript kaydedilir; ses dalgası depolanmaz. Streaming sırasında Gemini Live API'ye gönderilir, oturum bittikten sonra ağ üzerinden kaybolur.
- **Saklama süresi:** 30 gün. Sonra otomatik silinir. İsteğe bağlı olarak daha erken silebilirsiniz (profil > gizlilik).
- **Biyometrik veri statüsü:** Ses dosyası tutulmadığı için biyometrik veri statüsü tetiklenmez.

#### C.2. OCR (Defter Fotoğrafları)
- **Ne toplanıyor:** Yüklediğiniz el yazısı / basılı not fotoğrafları + AI tarafından çıkarılan metin + LaTeX formüller.
- **Görsel saklanıyor mu?** Evet. `/uploads/ocr/` dizininde sadece sizin erişebildiğiniz URL altında tutulur. Başka kullanıcı veya 3. taraf göremez.
- **Saklama süresi:** Siz silene kadar. OCR sayfasından tek tıkla silebilirsiniz; hesabınızı kapatırsanız kademeli olarak temizlenir (onDelete cascade).
- **3. şahıs PII:** Not fotoğrafları genellikle sadece sizin el yazınızı içerir, ancak sınıf arkadaşlarının / hocaların adlarını da içerebilir — bu durumda veri sorumluluğu sizde kalır.

#### C.3. Ders Kayıtları (Lecture Audio)
- **Ne toplanıyor:** Yüklediğiniz ders kaydı ses dosyası + Gemini transcribe çıktısı (tam transkript + konu başlıkları + "sınavda çıkar" ipuçları).
- **Ses dosyası saklanıyor mu?** Evet. Uzun (60-90dk) kayıtlar `/uploads/lectures/` altında tutulur. Başka kullanıcı veya 3. taraf göremez.
- **3. şahıs hassasiyeti:** Ders kayıtlarında sınıf arkadaşlarınız da konuşuyor olabilir. **Kendi notlarınız dışında paylaşmayın.** Platformun topluluk özellikleri bu ses dosyalarına erişim açmaz.
- **Saklama süresi:** Siz silene kadar. Phase 7'de uzun-vadeli arşivleme stratejisi netleşecek.

#### C.4. Görselle Benzer Soru Arama
- **Ne toplanıyor:** Tek sorgu için yüklediğiniz formül / soru fotoğrafı.
- **Saklanıyor mu?** Hayır. Analiz sonrası diske kayıt yapılmaz — sadece Gemini API çağrısı için geçici olarak bellekten geçer.

#### C.5. Push Bildirimi Abonelik Verileri
- **Ne toplanıyor:** Tarayıcınızın push endpoint URL'si + p256dh + auth anahtarları + user-agent.
- **Amaç:** Yalnızca siz opt-in olduğunuzda günlük tekrar bildirimi göndermek.
- **Saklama süresi:** Siz opt-out olana veya tarayıcı aboneliği iptal edene kadar.

## Verilerin İşlenme Amaçları

| Amaç | Veri kategorileri |
|------|-------------------|
| Kimlik doğrulama + JWT oturum yönetimi | A |
| Kişisel akademik analiz (DNA, confidence, advisor) | B |
| Hoca stili analizi (aggregation) | B (anonymized_hash ile k-anonymity ≥ 10) |
| Canlı tutor / OCR / ders kaydı analizi | C.1, C.2, C.3 |
| Görselle benzer soru arama | C.4 |
| Tekrar bildirimleri (opt-in) | C.5 |

## Paylaşım

- **3. taraf paylaşımı:** Yok. Platform dışına satmıyoruz, reklam partnerleriyle paylaşmıyoruz.
- **Yapay zeka sağlayıcıları:** Sınav analizi, DNA narrative, canlı tutor, OCR, ders transkripti, görselle arama için [Google Gemini API](https://ai.google.dev/terms) ve yedek olarak [Anthropic Claude API](https://www.anthropic.com/legal/commercial-terms) kullanılır. Bu sağlayıcılara **yalnızca sizin o call için ürettiğiniz içerik** gönderilir (oturum transkripti, not görseli, vs.). Her ikisi de veriyi kendi modellerini eğitmek için kullanmadıklarını taahhüt eder (API ticari şartları).
- **Bulut altyapısı:** Veritabanı ve dosya depolama kendi sunucumuzda (gelecekte Cloudflare R2 / Google Cloud'a taşınabilir; taşındığında bu metin güncellenir).

## Haklarınız (KVKK Madde 11)

- Hangi verilerin toplandığını öğrenme
- Verileri düzeltme / silme
- İşlemenin durdurulmasını talep etme
- İşlenmenin yasal dayanağını öğrenme
- Veri aktarımının kime yapıldığını öğrenme

### Nasıl talep ederim?

- **Kısa yol:** Profil > Gizlilik sekmesinden:
  - Tek tek veriler için "Sil" butonu.
  - Tüm hesap için "Hesabımı ve tüm verilerimi sil" (yalnızca confirmation sonrası).
- **Uzun yol:** `kvkk@profai.local` adresine yazın. 30 gün içinde dönüş yapılır.

## Veri Saklama Özeti

| Kategori | Saklama süresi |
|----------|----------------|
| Üyelik (A) | Hesap aktif olduğu sürece |
| Akademik veri (B) | Hesap aktif olduğu sürece, "verileri sil" tercihiniz hariç |
| Canlı tutor transkriptleri (C.1) | 30 gün, sonra otomatik silme |
| OCR görselleri (C.2) | Siz silene / hesap kapatılana kadar |
| Ders kayıtları (C.3) | Siz silene / hesap kapatılana kadar |
| Görselle arama fotoğrafları (C.4) | Saklanmaz (analiz sonrası silinir) |
| Push abonelik verileri (C.5) | Opt-out veya abonelik iptaline kadar |

## Çerez ve Yerel Depolama

- `localStorage.token` — JWT oturum anahtarı
- `localStorage.theme` — karanlık / aydınlık mod tercihi
- `i18nextLng` — dil tercihi

Bu değerler tarayıcınızda tutulur, hesabınızla ilişkilendirilmez.

## Çocuklar

Platform 18 yaş üstü üniversite öğrencileri için tasarlanmıştır. Lise / altı için hesap açılmaz. 18 altı bir kullanıcı olduğunuzu fark edersek hesabı kapatıp verileri sileriz.

## Değişiklikler

Bu metin değiştiğinde en üstte tarih güncellenir ve kayıtlı e-postanıza bilgilendirme gönderilir. Kritik değişikliklerde (örn. yeni AI sağlayıcı) 30 gün önceden bildirim yapılır.

## Versiyon

| Versiyon | Tarih | Notlar |
|----------|-------|--------|
| Taslak | 2026-04-19 | Phase 6 task 6.25 — voice / OCR / lecture / multimodal kapsamları eklendi. Avukat review bekliyor. |
