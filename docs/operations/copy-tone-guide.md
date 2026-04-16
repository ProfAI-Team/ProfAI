# Copy Tone Guide

Bu rehber ProfAI'ın **kullanıcıya görünen tüm metinleri** için referans. Her yeni sayfa, bildirim, e-mail veya AI çıktısı bu tonu koruyarak yazılır. i18n key'leri, error mesajları, CTA'lar — hepsi.

---

## Hedef: Hibrit — "Samimi + Akademik + Ciddi"

Üç boyut birlikte:

| Boyut | Ne demek | Ne demek DEĞİL |
|-------|----------|----------------|
| **Samimi** | Kullanıcıya doğrudan "sen" hitabı; merak uyandıran dil; empati | "Kanka", "n'aber", abartılı sempatiklik |
| **Akademik** | Veri temelli; somut rakam; profesyonel terimler | Jargon enflasyonu, pazarlama klişeleri |
| **Ciddi** | Vaad gerçekçi; mübalağasız; abartısız | Monoton, soğuk, bürokratik |

Tek cümlede test: *"Bunu bir ödev danışmanı arkadaşın söylese tuhaf olur mu?"*
- **Evet → fazla akademik.**
- **Hayır + doğal geliyor → tamam.**

---

## Yaz

- **Doğrudan "sen":** "Hocanın tarzını tanı", "Notunu buraya yükle".
- **Somut rakam:** "6 sınav analiz ettik", "%42'si klasik soru", "son 3 yıl".
- **Aktif fiil:** "Çıkardık", "topladık", "analiz ettik". Pasif değil: "edilmektedir".
- **Meraklı üslup:** "Peri hoca neyi, nasıl soruyor?" tarzı soru-cevap başlıkları.
- **Kısa cümle:** Mümkünse 20 kelime altında. Uzun açıklama gerekirse 2 kısa cümleye böl.
- **Pratik çıkış:** Bilgi ver + ne yapacağını söyle ("…bu yüzden X konusuna odaklan").

## Yazma

- **Emoji:** Ürün içinde yok. İkon için `lucide-react` kullanılır, emoji değil. (Commit/README'de de yok — bkz. `CLAUDE.md`.)
- **Motivasyonel klişe:** "Potansiyelini ortaya çıkar", "Başarı seninle", "Sınırsız öğrenme". Atın.
- **Abartılı vaad:** "Mükemmel not garantili", "Tüm soruları bil". Kırılır, güven düşer.
- **Jargon enflasyonu:** "Paradigma", "disruptif", "synergy". Açık Türkçe kullan.
- **Klişe pazarlama dili:** "Oyun değiştirici", "devrim niteliğinde". Somut konuş.
- **Pasif/formal**: "Değerlendirilmektedir", "sağlanmaktadır" — aktif yaz.

---

## Tonları Karşılaştır

Aynı bilgi, üç farklı ton:

| Ton | Cümle |
|-----|-------|
| ❌ Fazla samimi | *"Hey! Peri hocamızın tüm sınavlarına bakalım, süper olacak 🎉"* |
| ❌ Fazla akademik | *"Bu öğretim üyesinin sınav örüntülerine dair kapsamlı analiz sunulmaktadır."* |
| ❌ Pazarlama | *"Peri hoca ile sınavda zirveye çık! Devrim niteliğinde analiz!"* |
| ✅ **Hibrit** | *"Peri hoca nasıl soruyor? Son 6 sınavı analiz ettik — işte tarzı."* |

---

## Uzunluk Kılavuzu

| Alan | Hedef |
|------|-------|
| Button CTA | 1-3 kelime ("Başla", "Analizi gör") |
| Section başlığı | 1-4 kelime ("Hocanın Tarzı") |
| Subtitle / açıklama | 5-12 kelime |
| Summary / paragraf | 20-60 kelime |
| Error / empty state | 10-25 kelime, **ne olduğu + ne yapılacağı** |
| AI özeti (Gemini) | 60-100 kelime, 3-4 cümle |

---

## Türkçe Özel Kurallar

- **Sen** formu, **siz** değil (öğrenciye doğrudan hitap).
- **Yabancı terim:** İngilizce'si yerleşmişse tut (PDF, upload, dashboard zaten Türkçe'de de kullanılıyor — "kontrol paneli" zorunlu değil). Emin değilsen Türkçe sor.
- **Noktalama:** Türkçe tırnak (« » değil, " "), üç nokta "..." yerine tek karakter "…".
- **İnterpolasyon:** `{{count}} sınav analiz ettik` — hep Türkçe dilbilgisi doğru. Çoğul için `_other` varyantı (`ratingsCount`, `ratingsCount_other`).

## İngilizce Özel Kurallar

- **Second person ("you")**, conversational professional. Ne "dude" ne "hereby".
- **Concrete numbers**, active voice.
- **Avoid academicese:** "pedagogical methodology" → "how they teach".
- **Plural:** i18next `_other` suffix kullan, hard-coded "(s)" değil.

---

## AI Çıktıları (Gemini)

System instruction'da da aynı ton yazılır. Örnekler:

✅ *"Bu öğretim üyesinin sınavları ortalama 6.6/10 zorlukta. Sınavların %50'si klasik soru — kavramları derinlemesine anlamana gerek var. Özellikle Sosyal Psikoloji son 3 dönemdir ağırlığını koruyor."*

❌ *"The professor exhibits a preference for…"* (yabancı dil karışımı yok)
❌ *"Hocamız çoktan seçmeli sorulara ağırlık veriyor arkadaşlar!"* (gruba hitap + arkadaşça değil)

---

## Revizyon Ritmi

- **Faz sonu:** tüm yeni i18n key'leri bu rehbere göre sweep et.
- **Yeni feature:** copy yazan önce 3 dakika bu rehberi okur.
- **Şüphede:** Türkçe kullanan 2 kişiye (öğrenci kitlesinden) sor.

---

## İlgili

- i18n kaynak dosyaları: [`client/src/i18n/locales/{tr,en}.json`](../../client/src/i18n/locales/)
- Frontend konvansiyonları: [`../../client/CLAUDE.md`](../../client/CLAUDE.md)
- Demo planı (demo sırasında bu ton canlı gösterilir): [`demo-plan.md`](./demo-plan.md)
