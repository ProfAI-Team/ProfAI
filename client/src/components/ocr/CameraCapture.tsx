import { useRef, useState } from 'react';

// Phase 6 (6.17) — lightweight dual-mode picker. Mobile browsers that
// support `capture="environment"` open the rear camera; desktop
// browsers fall back to the standard file chooser. No getUserMedia
// here on purpose — we just need a still image, and the native UI is
// the most reliable path across Safari/Chrome/Firefox + mobile.

export interface CameraCaptureProps {
  accept?: string;
  maxSizeMB?: number;
  onSelect: (file: File) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  label?: string;
  helperText?: string;
}

export function CameraCapture({
  accept = 'image/png,image/jpeg,image/webp,image/heic',
  maxSizeMB = 10,
  onSelect,
  onError,
  disabled,
  label = 'Fotoğraf seç / çek',
  helperText,
}: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(
        `Dosya çok büyük. En fazla ${maxSizeMB}MB yükleyebilirsin.`
      );
      event.target.value = '';
      return;
    }
    setPreview(URL.createObjectURL(file));
    onSelect(file);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-base transition hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
      {helperText && (
        <p className="text-xs text-text-muted">{helperText}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={handlePick}
        className="hidden"
      />
      {preview && (
        <img
          src={preview}
          alt="Seçilen dosya önizlemesi"
          className="max-h-64 rounded-lg border border-border object-contain"
        />
      )}
    </div>
  );
}

export default CameraCapture;
