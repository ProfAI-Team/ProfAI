import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link2, AlertTriangle, X, Loader2 } from 'lucide-react';

import { studyGroupService } from '../services/studyGroupService';

interface Props {
  groupId: string;
  onClose: () => void;
}

const ExternalLinkModal: React.FC<Props> = ({ groupId, onClose }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [url, setUrl] = React.useState('');
  const [localError, setLocalError] = React.useState<string | null>(null);

  const submit = useMutation({
    mutationFn: () => studyGroupService.submitLink(groupId, { url: url.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studyGroups'] });
      onClose();
    },
    onError: (err: { response?: { data?: { error?: { code?: string } } } }) => {
      const code = err?.response?.data?.error?.code;
      setLocalError(
        code === 'LINK_NOT_ALLOWED'
          ? t('community.studyGroup.linkModal.errors.notAllowed')
          : t('community.studyGroup.linkModal.errors.generic')
      );
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={() => !submit.isPending && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="card-base p-6 max-w-md w-full space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              {t('community.studyGroup.linkModal.title')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t('community.studyGroup.linkModal.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submit.isPending}
            aria-label={t('community.studyGroup.linkModal.close')}
            className="p-1 rounded-md hover:bg-secondary text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-lg bg-warning/10 border border-warning/30 p-3 text-xs text-foreground flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
          <span>{t('community.studyGroup.linkModal.piiWarning')}</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLocalError(null);
            if (url.trim()) submit.mutate();
          }}
          className="space-y-3"
        >
          <label className="block text-sm space-y-1">
            <span className="font-medium">
              {t('community.studyGroup.linkModal.urlLabel')}
            </span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder={t('community.studyGroup.linkModal.urlPlaceholder')}
              className="input-field"
              autoFocus
            />
          </label>

          {localError && (
            <div className="text-sm text-destructive flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submit.isPending}
              className="btn-secondary text-sm"
            >
              {t('community.studyGroup.linkModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={submit.isPending || !url.trim()}
              className="btn-primary text-sm gap-1.5"
            >
              {submit.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('community.studyGroup.linkModal.submitting')}
                </>
              ) : (
                t('community.studyGroup.linkModal.submit')
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ExternalLinkModal;
