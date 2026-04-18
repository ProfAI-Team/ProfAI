import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DeleteAccountDialog from '../components/settings/DeleteAccountDialog';

export default function PrivacyPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
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
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            Tehlikeli bölge: Hesabımı ve verilerimi sil
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Hesabını tamamen kaldırabilir ve tüm ilişkili veriyi (voice
            transkriptleri, OCR görselleri, ders kayıtları, notlar, mock
            sınav sonuçları, marketplace ürünleri, ödemeler, tutor oturumları)
            geri dönüşsüz şekilde silebilirsin. Onay için parolan + 10 saniyelik
            bekleme süresi istenir.
          </p>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 dark:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              Hesabımı sil
            </button>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Bu butonu görmek için giriş yapmalısın.
            </p>
          )}
        </div>
      </section>

      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
