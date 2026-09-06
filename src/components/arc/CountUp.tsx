import { useEffect, useState } from 'react';
import { animate } from 'motion/react';

/** Tweens a number from zero when motion is on; renders the final value immediately otherwise. */
export function CountUp({ value, motion, duration = 1.1, delay = 0, plain = false }: { value: number; motion: boolean; duration?: number; delay?: number; plain?: boolean }) {
  const [shown, setShown] = useState(motion ? 0 : value);
  useEffect(() => {
    if (!motion) { setShown(value); return; }
    const controls = animate(0, value, { duration, delay, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [value, motion, duration, delay]);
  return <>{plain ? String(shown) : shown.toLocaleString()}</>;
}
