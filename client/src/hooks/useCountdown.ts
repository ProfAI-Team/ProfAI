import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drift-safe countdown hook.
 *
 * setInterval tends to drift when the tab is backgrounded or the thread
 * is blocked — the tick fires late, so we re-derive the remaining time
 * from an absolute Date.now() target on every tick instead of just
 * decrementing a counter.
 */
export type CountdownState = "idle" | "running" | "paused" | "expired";

export interface UseCountdownOptions {
  durationSec: number;
  autoStart?: boolean;
  onExpire?: () => void;
  tickMs?: number;
}

export interface UseCountdownResult {
  remainingSec: number;
  state: CountdownState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (nextDurationSec?: number) => void;
}

export function useCountdown(
  options: UseCountdownOptions
): UseCountdownResult {
  const { durationSec, autoStart = false, onExpire, tickMs = 500 } = options;

  const [remainingSec, setRemainingSec] = useState(durationSec);
  const [state, setState] = useState<CountdownState>(
    autoStart ? "running" : "idle"
  );

  const endAtRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number>(durationSec);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (autoStart) {
      endAtRef.current = Date.now() + durationSec * 1000;
    } else {
      pausedRemainingRef.current = durationSec;
    }
    setRemainingSec(durationSec);
  }, [durationSec, autoStart]);

  useEffect(() => {
    if (state !== "running") return;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const end = endAtRef.current;
      if (end == null) return;
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
      setRemainingSec(remaining);
      if (remaining <= 0) {
        setState("expired");
        onExpireRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, tickMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [state, tickMs]);

  const start = useCallback(() => {
    endAtRef.current = Date.now() + durationSec * 1000;
    setRemainingSec(durationSec);
    setState("running");
  }, [durationSec]);

  const pause = useCallback(() => {
    if (state !== "running") return;
    const end = endAtRef.current;
    if (end != null) {
      pausedRemainingRef.current = Math.max(
        0,
        Math.round((end - Date.now()) / 1000)
      );
    }
    setState("paused");
  }, [state]);

  const resume = useCallback(() => {
    if (state !== "paused") return;
    const remaining = pausedRemainingRef.current;
    endAtRef.current = Date.now() + remaining * 1000;
    setRemainingSec(remaining);
    setState("running");
  }, [state]);

  const reset = useCallback(
    (nextDurationSec?: number) => {
      const target = nextDurationSec ?? durationSec;
      endAtRef.current = null;
      pausedRemainingRef.current = target;
      setRemainingSec(target);
      setState("idle");
    },
    [durationSec]
  );

  return { remainingSec, state, start, pause, resume, reset };
}
