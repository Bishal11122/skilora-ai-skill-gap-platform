import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react';

/**
 * Subtle top-edge scroll progress indicator using Motion for React.
 * Uses the Skilora Plum -> Coral -> Sage gradient.
 * Automatically respects user's reduced motion preference.
 */
export default function ScrollProgress() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--primary-color)] via-[var(--highlight-color)] to-[var(--accent-color)] origin-left z-50 pointer-events-none"
      aria-hidden="true"
    />
  );
}
