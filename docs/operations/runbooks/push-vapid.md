# Runbook — Web Push VAPID Keys

**Son güncelleme:** 2026-04-19 (Phase 7 task 7.9)
**Sorumlu:** Erdem (backend).

## Özet

Web Push (Phase 6 task 6.14) browser'lara bildirim göndermek için VAPID (Voluntary Application Server Identification) kimlik doğrulaması kullanır. Sunucuda 3 env var gereklidir:

- `VAPID_PUBLIC_KEY` — public key (base64url, ~65 karakter).
- `VAPID_PRIVATE_KEY` — private key (base64url, ~43 karakter).
- `VAPID_SUBJECT` — `mailto:ops@profai.local` veya `https://profai.local` formatında operatör iletişim URL'i.

Bu üç değer yoksa `POST /api/push/devices` çağrıları 500 `PUSH_NOT_CONFIGURED` döner ve client `PushPermissionCard` "not-configured" state'inde kalır.

---

## Initial provisioning

```bash
cd server
npx tsx scripts/generate-vapid.ts
```

Çıktıyı `.env` dosyasına kopyala (dev) veya Cloudflare / Vercel / Fly secret manager'a yaz (prod). `VAPID_SUBJECT` zaten scriptte default olarak `mailto:ops@profai.local` ama prod için gerçek bir mailbox ya da web sayfası URL'i vermek gerekir — browser'lar bu değeri push servis operatörüyle iletişime geçmek için kullanır.

Doğrula:

```bash
# Sunucu ayağa kalktıktan sonra
curl http://localhost:5000/api/push/vapid-public-key
# { "publicKey": "BJ..." }   ← VAPID_PUBLIC_KEY ile aynı olmalı
```

Frontend smoke: `/me/reviews > Settings` sekmesinde "Bildirimleri aç" CTA tıklanır, browser permission prompt çıkar, izin verince cihaz `PushDevice` tablosuna düşer.

---

## Rotation (key compromise)

Private key sızdığı ya da ops şüphelendiği durumda:

1. `npx tsx scripts/generate-vapid.ts` ile yeni pair üret.
2. Yeni pair'i secret manager'a yaz (eski pair'i hemen silme — adım 4'te).
3. Sunucu restart'la (yeni pair aktifleşir).
4. `PushDevice` tablosundaki mevcut abonelikler otomatik geçersizleşir (browser'lar yeni public key'le re-subscribe gerektirir). Arka planda spaced-repetition push delivery 410 Gone alıp ilgili PushDevice row'larını siler — kullanıcılar bir sonraki girişte yeniden opt-in isteyecek.
5. Eski pair'i secret manager'dan kaldır.

**Hassas not:** Rotation kullanıcıyı etkiler (push abonelikleri sıfırlanır). Sızıntı kanıtı olmadan rotation yapma — sadece düzenli kontrol olarak yılda 1 kez opsiyonel.

---

## Troubleshooting

**`PushPermissionCard` "not-configured" gösteriyor:** VAPID env'leri eksik. `server/.env` dosyasını kontrol et, yukarıdaki 3 değerin dolu olduğunu doğrula, container'ı yeniden başlat.

**Browser permission prompt çıkıyor ama registration fail:** Private key yanlış çiftlenmiş olabilir. `scripts/generate-vapid.ts` bir defada üç değeri birden üretir — pair'i kısmen kopyaladıysan regenerate et.

**`POST /api/push/devices` 500 dönüyor:** Pino log'una bak (`feature: "pushNotification"` filtresi). En sık sorun `web-push` paketinin private key'i base64 yerine binary bekliyor olması — scriptin ürettiği formatta bırak, manuel yazma.

**Subject reddediliyor:** `mailto:` veya `https:` prefix'i zorunlu. Sadece email adresi çalışmaz.

---

## Secret manager notes

**Cloudflare Pages/Workers:** `wrangler secret put VAPID_PUBLIC_KEY` (ve diğerleri). VAPID_PUBLIC_KEY public olduğu için `VAR` olarak da tutulabilir ama ayırma kolaylığı için hepsini secret olarak tut.

**Fly.io:** `fly secrets set VAPID_PUBLIC_KEY="..." VAPID_PRIVATE_KEY="..." VAPID_SUBJECT="mailto:..."`.

**Vercel:** Project Settings → Environment Variables → Add (her env için production/preview/development ayrı yazılabilir; development için dev pair, production için prod pair).

**Supabase / GCP Secret Manager:** `vapid-public-key`, `vapid-private-key`, `vapid-subject` üç ayrı secret olarak yaz; ortam değişkeni mapping'i ile enjekte et.

---

## History

| Tarih | Olay |
|-------|------|
| 2026-04-19 | Runbook oluşturuldu (Phase 7 task 7.9). |
