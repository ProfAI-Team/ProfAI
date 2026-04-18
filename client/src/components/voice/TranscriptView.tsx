import { useEffect, useRef } from 'react';

export interface TranscriptTurn {
  id: string;
  speaker: 'user' | 'tutor';
  text: string;
  timestampSec?: number;
}

export interface TranscriptViewProps {
  turns: TranscriptTurn[];
  autoScroll?: boolean;
}

export function TranscriptView({ turns, autoScroll = true }: TranscriptViewProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autoScroll) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, autoScroll]);

  return (
    <div
      ref={scrollRef}
      className="max-h-96 space-y-3 overflow-y-auto rounded-lg bg-surface p-4"
      role="log"
      aria-live="polite"
    >
      {turns.length === 0 ? (
        <p className="text-sm text-text-muted">
          Konuşma başladığında transkript burada görünecek.
        </p>
      ) : (
        turns.map((turn) => (
          <div key={turn.id} className="flex gap-3">
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                turn.speaker === 'user'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-border text-text-muted'
              }`}
            >
              {turn.speaker === 'user' ? 'Sen' : 'Tutor'}
            </span>
            <p className="text-sm leading-relaxed text-text-base">
              {turn.text}
              {typeof turn.timestampSec === 'number' && (
                <span className="ml-2 text-[11px] text-text-muted">
                  {Math.floor(turn.timestampSec / 60)}:
                  {String(Math.round(turn.timestampSec % 60)).padStart(2, '0')}
                </span>
              )}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default TranscriptView;
