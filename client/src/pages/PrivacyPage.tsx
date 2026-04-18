import { useTranslation } from 'react-i18next';

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-text-base">
          {t('privacy.title')}
        </h1>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
          Bu sayfa KVKK aydınlatma metninin kullanıcı dostu özetidir.
          Tam metin <code>docs/operations/kvkk-aydinlatma.md</code>
          altında — avukat review bekliyor.
        </p>
      </header>

      <section className="space-y-6 text-sm leading-relaxed text-text-base">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Canlı Tutor
          </h2>
          <p className="mt-2 text-text-muted">
            {t('privacy.voiceTranscripts')}
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">
            OCR / Defter Fotoğrafları
          </h2>
          <p className="mt-2 text-text-muted">{t('privacy.ocrImages')}</p>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Ders Kayıtları</h2>
          <p className="mt-2 text-text-muted">{t('privacy.lectureAudio')}</p>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">
            Görselle Arama
          </h2>
          <p className="mt-2 text-text-muted">
            {t('privacy.multimodalSearch')}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="font-display text-lg font-semibold">
            {t('privacy.deleteAll')}
          </h2>
          <p className="mt-2 text-text-muted">
            Profil sayfasından tek tek silme + avukat review sonrası
            "tüm verileri sil" endpoint'i aktif olacak. Bu arada
            doğrudan e-posta: {t('privacy.contact').replace(
              /.*?(\S+@\S+).*/,
              '$1'
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
