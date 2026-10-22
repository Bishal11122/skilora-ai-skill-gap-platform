import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Sparkles, Compass, CheckCircle2 } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';

/**
 * Section 1: Hero Section featuring authentic student photography,
 * editorial typography, and floating sample preview badges with pastel accents.
 */
export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  // Floating animation definition for decorative cards
  const floatAnim1 = shouldReduceMotion
    ? {}
    : {
        y: [0, -6, 0],
        transition: {
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  const floatAnim2 = shouldReduceMotion
    ? {}
    : {
        y: [0, 5, 0],
        transition: {
          duration: 5.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.8,
        },
      };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
      {/* Soft Pastel Ambient Aura */}
      <div
        className="absolute -top-32 left-1/4 w-[500px] h-[350px] bg-gradient-to-r from-emerald-100/40 via-violet-100/35 to-sky-100/40 dark:from-emerald-950/20 dark:via-purple-950/20 dark:to-sky-950/20 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -right-20 w-80 h-80 bg-gradient-to-b from-orange-100/30 to-purple-100/30 dark:from-orange-950/15 dark:to-purple-950/15 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & CTAs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6 sm:space-y-8"
          >
            {/* Eyebrow badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[var(--primary-color)] bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/25 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[var(--highlight-color)]" aria-hidden="true" />
                <span>YOUR NEXT CHAPTER STARTS HERE</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-main)] leading-[1.12] font-heading"
            >
              Know your skills.{' '}
              <span className="text-[var(--primary-color)]">Close the gaps.</span>{' '}
              <br className="hidden sm:inline" />
              <span className="relative inline-block">
                Move forward.
                <span
                  className="absolute bottom-1.5 left-0 w-full h-[6px] bg-[var(--highlight-color)]/25 -z-10 rounded-full"
                  aria-hidden="true"
                />
              </span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl leading-relaxed"
            >
              Discover what your target career requires, identify the technical skills you need to
              strengthen, and follow a structured learning roadmap designed for your next move.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Button to="/register" variant="primary" size="lg" pill className="px-6 py-3 shadow-md shadow-primary-500/20">
                Build My Career Roadmap
                <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
              <Button href="#how-it-works" variant="secondary" size="lg" pill className="px-6 py-3">
                Explore How It Works
              </Button>
            </motion.div>

            {/* Visual Pipeline Chain with Tasteful Emojis */}
            <motion.div
              variants={itemVariants}
              className="pt-4 border-t border-[var(--border-color)]"
            >
              <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
                Continuous 5-Stage Learning Pipeline
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--pastel-mint)] text-[var(--pastel-mint-text)] border border-[var(--pastel-mint-border)] font-medium shadow-xs">
                  <span>📄</span> Resume
                </span>
                <span className="text-[var(--text-muted)]">&rarr;</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--pastel-lavender)] text-[var(--pastel-lavender-text)] border border-[var(--pastel-lavender-border)] font-medium shadow-xs">
                  <span>🧠</span> Assessment
                </span>
                <span className="text-[var(--text-muted)]">&rarr;</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--pastel-sky)] text-[var(--pastel-sky-text)] border border-[var(--pastel-sky-border)] font-medium shadow-xs">
                  <span>🧩</span> Gap Diagnosis
                </span>
                <span className="text-[var(--text-muted)]">&rarr;</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--pastel-peach)] text-[var(--pastel-peach-text)] border border-[var(--pastel-peach-border)] font-medium shadow-xs">
                  <span>🗺️</span> Roadmap
                </span>
                <span className="text-[var(--text-muted)]">&rarr;</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/30 font-semibold shadow-xs">
                  <span>🚀</span> Career
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Authentic Student Photography + Floating UI Badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            {/* Photography Composition Container */}
            <div className="relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--surface-color)] shadow-xl group">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden">
                <img
                  src="/images/hero-students.jpg"
                  alt="University students collaborating on laptops in a modern study space"
                  width="1200"
                  height="825"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
                  loading="eager"
                />
                {/* Subtle warm gradient overlay to guarantee text contrast */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[var(--surface-color)] via-transparent to-black/20 pointer-events-none"
                  aria-hidden="true"
                />

                {/* Top Corner Pill: Student Study Snapshot */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-color)]/90 backdrop-blur-md text-[var(--text-main)] border border-[var(--border-color)] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
                  <span>Real Peer Learning & Growth</span>
                </div>
              </div>

              {/* Integrated Lower Panel: Illustrative Dashboard Preview */}
              <div className="p-4 sm:p-5 bg-[var(--surface-color)] border-t border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center font-bold text-xs">
                      🎯
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-main)]">Target: Full Stack Developer</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Benchmark: 85% Industry Standard</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--pastel-mint)] text-[var(--pastel-mint-text)] border border-[var(--pastel-mint-border)]">
                    Sample Data
                  </span>
                </div>

                {/* Animated Sample Progress Bars */}
                <div className="space-y-2 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-[var(--text-main)]">React & Frontend Architecture</span>
                      <span className="text-[var(--primary-color)] font-semibold">82% (Low Gap)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--surface-elevated)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-[var(--text-main)]">System Design & REST APIs</span>
                      <span className="text-[var(--highlight-color)] font-semibold">58% (Medium Gap)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--surface-elevated)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '58%' }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.45 }}
                        className="h-full bg-[var(--highlight-color)] rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge 1: Top Right Floating Status Pill */}
            <motion.div
              animate={floatAnim1}
              className="hidden sm:flex absolute -top-4 -right-4 z-20 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[var(--surface-color)]/95 backdrop-blur-md border border-[var(--border-color)] shadow-lg"
            >
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-color)]/15 text-[var(--accent-color)] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[var(--text-main)]">Roadmap Stage 2 Active</p>
                <p className="text-[9px] text-[var(--text-muted)]">Sample Progress Indicator</p>
              </div>
            </motion.div>

            {/* Floating Badge 2: Bottom Left Floating Focus Pill */}
            <motion.div
              animate={floatAnim2}
              className="hidden sm:flex absolute -bottom-5 -left-4 z-20 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[var(--surface-color)]/95 backdrop-blur-md border border-[var(--border-color)] shadow-lg"
            >
              <div className="w-7 h-7 rounded-lg bg-[var(--highlight-color)]/15 text-[var(--highlight-color)] flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[var(--text-main)]">Diagnostic Gap Resolved</p>
                <p className="text-[9px] text-[var(--text-muted)]">+18% Technical Score (Sample)</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
