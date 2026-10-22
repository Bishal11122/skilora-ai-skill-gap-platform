import { motion, useReducedMotion } from 'motion/react';
import {
  FileSearch,
  CheckCircle,
  GitCompare,
  Milestone,
  Video,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import Card from '../ui/Card';

/**
 * Section 2: Features Section with 7 core capabilities.
 * Enhanced with soft pastel accents (Mint, Lavender, Sky, Peach),
 * distinct card hierarchies, hairline borders, and smooth hover lifts.
 */
export default function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  return (
    <section id="features" className="py-20 sm:py-24 bg-[var(--bg-color)] transition-colors">
      <Container>
        <SectionHeading
          badge="Platform Capabilities"
          title="Everything You Need to Advance Your Career"
          subtitle="From objective skill discovery to actionable learning roadmaps, built for modern technical aspirants."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Feature 1 (Wide Highlight Card): Resume Skill Analysis */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
            <Card
              variant="mint"
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-8 rounded-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center justify-center">
                    <FileSearch className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    📄
                  </span>
                </div>

                <div>
                  <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-emerald-800 dark:text-emerald-200 bg-white/70 dark:bg-emerald-950/60 border border-emerald-400/30 mb-2.5">
                    Automated Ingestion
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Resume Skill Extraction &amp; Profiling
                  </h3>
                  <p className="text-sm sm:text-base opacity-90 leading-relaxed mt-2 max-w-xl">
                    Upload your technical resume in PDF format. In-memory text processing automatically
                    identifies programming languages, frameworks, cloud tooling, and databases without storing
                    unnecessary personally identifiable information.
                  </p>
                </div>

                {/* Visual Accent Pill Mock */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-emerald-950/60 border border-emerald-400/30">
                    ✓ Clean PDF text parsing
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-emerald-950/60 border border-emerald-400/30">
                    ✓ Standardized skill dictionary
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-emerald-950/80 border border-emerald-400/40 font-semibold">
                    ✓ Zero third-party tracking
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Feature 2 (Standard Card): Skill Assessment */}
          <motion.div variants={itemVariants}>
            <Card
              variant="lavender"
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    🧠
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Objective Diagnostic Assessment
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed mt-2">
                    Validate your declared proficiencies through targeted diagnostic multiple-choice tests to establish
                    calibrated baseline performance scores.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-purple-400/30 flex items-center text-xs font-semibold">
                <span>Verified competency scoring</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature 3 (Spotlight Card): Skill Gap Analysis */}
          <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1">
            <Card
              variant="sky"
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 flex items-center justify-center">
                    <GitCompare className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    🧩
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Mathematical Gap Diagnostics
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed mt-2">
                    Compute exact mathematical gaps between current proficiencies and role benchmark expectations,
                    categorized into Low, Medium, and High priority gaps.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-sky-400/30 flex items-center text-xs font-semibold">
                <span>Industry benchmark alignment</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature 4 (Personalized Learning Roadmap) */}
          <motion.div variants={itemVariants}>
            <Card
              variant="peach"
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30 flex items-center justify-center">
                    <Milestone className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    🗺️
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Structured Learning Roadmap
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed mt-2">
                    Receive a step-by-step curriculum with estimated completion times that tackles your highest gaps first,
                    eliminating guesswork from your self-study schedule.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-orange-400/30 flex items-center text-xs font-semibold">
                <span>Prioritized milestone paths</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature 5 (Course and Video Recommendations) */}
          <motion.div variants={itemVariants}>
            <Card
              variant="lavender"
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center justify-center">
                    <Video className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    🎥
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Curated Tutorial Recommendations
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed mt-2">
                    Handpicked, high-reputation free video tutorials, documentation guides, and hands-on GitHub practice
                    repositories mapped directly to each curriculum milestone.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-purple-400/30 flex items-center text-xs font-semibold">
                <span>Verified educational links</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature 6 (Interactive AI Doubt Solver) */}
          <motion.div variants={itemVariants}>
            <Card
              variant="mint"
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    🤖
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Conceptual Doubt Clarification
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed mt-2">
                    Ask technical questions while working through roadmap milestones and receive structured, step-by-step
                    conceptual breakdowns tailored to your proficiency level.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-emerald-400/30 flex items-center text-xs font-semibold">
                <span>Context-aware assistance</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature 7 (Wide Elevated Card): Progress Tracking Dashboard */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
            <Card
              variant="glass"
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-8 rounded-2xl shadow-sm transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/25 flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    📊
                  </span>
                </div>
                <div>
                  <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-[var(--primary-color)] bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/25 mb-2.5">
                    Growth Analytics
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
                    Visual Progress Tracking Dashboard
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mt-2 max-w-xl">
                    Monitor your gap closure over time with radar charts, milestone completion badges, and reassessment
                    checkpoints that confirm when you are ready for target job interviews.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1.5 text-[var(--primary-color)] font-semibold">
                  <span>📈</span> Quantitative readiness indicators
                </span>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
