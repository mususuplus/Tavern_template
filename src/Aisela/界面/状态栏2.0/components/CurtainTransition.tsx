import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';

export type CurtainPhase = 'idle' | 'closing' | 'closed' | 'opening';

type CurtainTiming = {
  close: number;
  hold: number;
  open: number;
};

const THEATRE_TIMING: CurtainTiming = {
  close: 640,
  hold: 80,
  open: 720,
};

const REDUCED_TIMING: CurtainTiming = {
  close: 180,
  hold: 80,
  open: 220,
};

export function useCurtainTransition(reducedMotion = false) {
  const [phase, setPhase] = useState<CurtainPhase>('idle');
  const phaseRef = useRef<CurtainPhase>('idle');
  const timersRef = useRef<number[]>([]);
  const timing = reducedMotion ? REDUCED_TIMING : THEATRE_TIMING;

  useEffect(
    () => () => {
      timersRef.current.forEach(timer => window.clearTimeout(timer));
      timersRef.current = [];
    },
    [],
  );

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(item => item !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
  }, []);

  const transitionTo = useCallback(
    (commitPage: () => void) => {
      if (phaseRef.current !== 'idle') return false;

      phaseRef.current = 'closing';
      setPhase('closing');

      schedule(() => {
        phaseRef.current = 'closed';
        setPhase('closed');

        schedule(() => {
          // The new page is committed only while the velvet is fully closed.
          flushSync(commitPage);
          window.requestAnimationFrame(() => {
            phaseRef.current = 'opening';
            setPhase('opening');

            schedule(() => {
              phaseRef.current = 'idle';
              setPhase('idle');
            }, timing.open);
          });
        }, timing.hold);
      }, timing.close);

      return true;
    },
    [schedule, timing.close, timing.hold, timing.open],
  );

  return {
    isTransitioning: phase !== 'idle',
    phase,
    transitionTo,
  };
}

export function CurtainTransition({ phase, reducedMotion = false }: { phase: CurtainPhase; reducedMotion?: boolean }) {
  const timing = reducedMotion ? REDUCED_TIMING : THEATRE_TIMING;

  return (
    <div
      aria-hidden="true"
      className={`curtain-transition is-${phase}`}
      data-phase={phase}
      style={
        {
          '--curtain-close-duration': `${timing.close}ms`,
          '--curtain-open-duration': `${timing.open}ms`,
        } as CSSProperties
      }
    >
      <div className="curtain-track" />
      <div className="velvet-curtain velvet-curtain-left">
        <i />
        <i />
        <i />
        <b />
      </div>
      <div className="velvet-curtain velvet-curtain-right">
        <i />
        <i />
        <i />
        <b />
      </div>
      <div className="curtain-seam" />
    </div>
  );
}
