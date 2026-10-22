import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';

/**
 * Section 5: Final Call to Action Section with warm editorial styling,
 * soft pastel ambient glow, and motion entrance.
 */
export default function CtaSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 sm:py-24 bg-[var(--bg-color)] transition-colors">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto shadow-lg space-y-6 overflow-hidden"
        >
          {/* Subtle decorative pastel aura in background */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-emerald-100/40 via-violet-100/35 to-sky-100/40 dark:from-emerald-950/20 dark:via-purple-950/20 dark:to-sky-950/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 right-1/4 w-80 h-80 bg-[var(--primary-color)]/8 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--highlight-color)] bg-[var(--highlight-color)]/12 border border-[var(--highlight-color)]/25 mb-1 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>START YOUR NEXT CHAPTER TODAY</span>
          </div>

          <h2 className="relative text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-main)] font-heading">
            Ready to Find Your Real Skill Gaps?
          </h2>

          <p className="relative text-base sm:text-lg text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Join Skillora AI to transform your declared competencies into a concrete, benchmarked career path.
            Know exactly what to learn and take your next move with confidence.
          </p>

          <div className="relative flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button to="/register" variant="primary" size="lg" pill className="px-6 py-3 shadow-md shadow-primary-500/20">
              Build My Career Roadmap
              <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
            </Button>
            <Button to="/login" variant="secondary" size="lg" pill className="px-6 py-3">
              Sign In
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
