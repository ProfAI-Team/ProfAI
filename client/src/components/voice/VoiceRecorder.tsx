import { useEffect, useRef, useState } from 'react';

// Phase 6 (6.17) — MediaRecorder + AnalyserNode-driven volume bar.
// Kept tiny on purpose: the waveform is an animated width-% bar, not a
// full oscilloscope. That shaves the initial JS chunk for users who
// never open /tutor. Components that need a fuller viz can extend this
// file with a Canvas overlay — the hook exposes `getByteTimeDomainData`
// via `analyserRef.current`.

export interface VoiceRecorderProps {
  active: boolean;
  onStream?: (stream: MediaStream) => void;
  onError?: (err: Error) => void;
  label?: string;
}

export function VoiceRecorder({ active, onStream, onError, label }: VoiceRecorderProps) {
  const [level, setLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
        streamRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setLevel(0);
      return;
    }

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        streamRef.current = stream;
        setHasPermission(true);
        onStream?.(stream);

        const AudioCtor =
          typeof window !== 'undefined'
            ? window.AudioContext ||
              (window as typeof window & { webkitAudioContext?: typeof AudioContext })
                .webkitAudioContext
            : undefined;
        if (!AudioCtor) return;
        const ctx = new AudioCtor();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const buffer = new Uint8Array(analyser.frequencyBinCount);
        function tick() {
          analyser.getByteTimeDomainData(buffer);
          let sumSq = 0;
          for (const v of buffer) {
            const x = (v - 128) / 128;
            sumSq += x * x;
          }
          const rms = Math.sqrt(sumSq / buffer.length);
          setLevel(Math.min(1, rms * 3));
          rafRef.current = requestAnimationFrame(tick);
        }
        tick();
      } catch (err) {
        setHasPermission(false);
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }

    start();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
        streamRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, onStream, onError]);

  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div
        aria-hidden="true"
        className="relative h-2 w-48 overflow-hidden rounded-full bg-border"
      >
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-75"
          style={{ width: `${Math.round(level * 100)}%` }}
        />
      </div>
      <span className="text-sm text-text-muted">
        {label ??
          (hasPermission === false
            ? 'Mikrofon izni reddedildi'
            : active
              ? 'Dinliyor'
              : 'Bekliyor')}
      </span>
    </div>
  );
}

export default VoiceRecorder;
