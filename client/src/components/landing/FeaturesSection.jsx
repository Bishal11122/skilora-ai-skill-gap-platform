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
 * Completely redesigned into an editorial varied layout with
 * Plum, Sage, and Coral accents, distinct card hierarchies, and hover lifts.
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
    <section id="features" className="py-20 sm:py-24 bg-[var(--bg-color)]">
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
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-[var(--surface-color)] to-[var(--surface-elevated)] border-[var(--border-color)] hover:border-[var(--primary-color)]/40 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/25 flex items-center justify-center">
                    <FileSearch className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    📄
                  </span>
                </div>

                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[var(--primary-color)] bg-[var(--primary-color)]/10 mb-2">
                    Automated Ingestion
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
                    Resume Skill Extraction & Profiling
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mt-2 max-w-xl">
                    Upload your technical resume in PDF format. In-memory text processing automatically
                    identifies programming languages, frameworks, cloud tooling, and databases without storing
                    unnecessary personally identifiable information.
                  </p>
                </div>

                {/* Visual Accent Pill Mock */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-color)] text-[var(--text-main)] border border-[var(--border-color)]">
                    ✓ Clean PDF text parsing
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-color)] text-[var(--text-main)] border border-[var(--border-color)]">
                    ✓ Standardized skill dictionary
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/25 font-medium">
                    ✓ Zero third-party tracking
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Feature 2 (Standard Sage Card): Skill Assessment */}
          <motion.div variants={itemVariants}>
            <Card
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-7 border-[var(--border-color)] hover:border-[var(--accent-color)]/50 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent-color)]/12 text-[var(--accent-color)] border border-[var(--accent-color)]/30 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    🧠
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                    Objective Diagnostic Assessment
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-2">
                    Validate your declared proficiencies through targeted diagnostic multiple-choice tests to establish
                    calibrated baseline performance scores.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-[var(--accent-color)]">
                <span>Verified competency scoring</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature 3 (Spotlight Coral Card): Skill Gap Analysis */}
          <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1">
            <Card
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-7 border-[var(--border-color)] hover:border-[var(--highlight-color)]/50 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[var(--highlight-color)]/12 text-[var(--highlight-color)] border border-[var(--highlight-color)]/30 flex items-center justify-center">
                    <GitCompare className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    🧩
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                    Mathematical Gap Diagnostics
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-2">
                    Compute exact mathematical gaps between current proficiencies and role benchmark expectations,
                    categorized into Low, Medium, and High priority gaps.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-[var(--highlight-color)]">
                <span>Industry benchmark alignment</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature 4 (Standard Plum Card): Personalized Learning Roadmap */}
          <motion.div variants={itemVariants}>
            <Card
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-7 border-[var(--border-color)] hover:border-[var(--primary-color)]/40 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/25 flex items-center justify-center">
                    <Milestone className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    🗺️
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                    Structured Learning Roadmap
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-2">
                    Receive a step-by-step curriculum with estimated completion times that tackles your highest gaps first,
                    eliminating guesswork from your self-study schedule.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-[var(--primary-color)]">
                <span>Prioritized milestone paths</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature 5 (Standard Sage Card): Course and Video Recommendations */}
          <motion.div variants={itemVariants}>
            <Card
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-7 border-[var(--border-color)] hover:border-[var(--accent-color)]/50 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent-color)]/12 text-[var(--accent-color)] border border-[var(--accent-color)]/30 flex items-center justify-center">
                    <Video className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    🎥
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                    Curated Tutorial Recommendations
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-2">
                    Handpicked, high-reputation free video tutorials, documentation guides, and hands-on GitHub practice
                    repositories mapped directly to each curriculum milestone.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-[var(--accent-color)]">
                <span>Verified educational links</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature 6 (Standard Card): Interactive AI Doubt Solver */}
          <motion.div variants={itemVariants}>
            <Card
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-7 border-[var(--border-color)] hover:border-[var(--primary-color)]/40 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/25 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    🤖
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                    Conceptual Doubt Clarification
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-2">
                    Ask technical questions while working through roadmap milestones and receive structured, step-by-step
                    conceptual breakdowns tailored to your proficiency level.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-[var(--primary-color)]">
                <span>Context-aware assistance</span>
              </div>
            </Card>
          </motion.div>

          {/* Feature 7 (Wide Elevated Card): Progress Tracking Dashboard */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
            <Card
              hover
              className="h-full flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-r from-[var(--surface-color)] via-[var(--surface-elevated)] to-[var(--surface-color)] border-[var(--border-color)] hover:border-[var(--highlight-color)]/40 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[var(--highlight-color)]/12 text-[var(--highlight-color)] border border-[var(--highlight-color)]/30 flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <span className="text-2xl select-none" aria-hidden="true">
                    📊
                  </span>
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[var(--highlight-color)] bg-[var(--highlight-color)]/12 mb-2">
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
                <span className="inline-flex items-center gap-1.5 text-[var(--highlight-color)]">
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
