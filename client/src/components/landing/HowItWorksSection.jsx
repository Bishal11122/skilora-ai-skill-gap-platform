import { motion, useReducedMotion } from 'motion/react';
import {
  UserPlus,
  Compass,
  UploadCloud,
  Cpu,
  FileCheck,
  GitCompare,
  Milestone,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import Card from '../ui/Card';

/**
 * Section 3: How It Works Section showcasing the 9-step workflow
 * structured across 3 connected stages with an authentic student study spotlight.
 */
export default function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();

  const stages = [
    {
      stageNumber: 'STAGE 1',
      stageName: 'Profile & Career Goal',
      theme: 'plum',
      steps: [
        {
          num: '01',
          emoji: '👤',
          icon: UserPlus,
          title: 'Create an Account',
          desc: 'Register with email credentials to create your secure learner profile.',
        },
        {
          num: '02',
          emoji: '🎯',
          icon: Compass,
          title: 'Select a Career Path',
          desc: 'Choose a target role such as Full Stack, Frontend, Data Analyst, Python, or AI/ML.',
        },
        {
          num: '03',
          emoji: '📄',
          icon: UploadCloud,
          title: 'Upload a Resume',
          desc: 'Submit your PDF resume for fast, in-memory client and server processing.',
        },
      ],
    },
    {
      stageNumber: 'STAGE 2',
      stageName: 'AI Gap Diagnostics',
      theme: 'coral',
      isHighlighted: true,
      steps: [
        {
          num: '04',
          emoji: '🤖',
          icon: Cpu,
          title: 'Extract Skills',
          desc: 'Automated entity matching parses technical competencies from your resume text.',
        },
        {
          num: '05',
          emoji: '🧩',
          icon: GitCompare,
          title: 'Analyze Skill Gaps',
          desc: 'Calculate exact differences against industry expectations with Low, Med, and High gap tags.',
          isApex: true,
        },
        {
          num: '06',
          emoji: '🗺️',
          icon: Milestone,
          title: 'Personalized Roadmap',
          desc: 'Generate a step-by-step curriculum addressing your highest-priority gaps first.',
        },
      ],
    },
    {
      stageNumber: 'STAGE 3',
      stageName: 'Targeted Learning & Mastery',
      theme: 'sage',
      steps: [
        {
          num: '07',
          emoji: '📚',
          icon: BookOpen,
          title: 'Curated Learning Resources',
          desc: 'Access authoritative, vetted documentation, tutorials, and reputable free learning materials.',
        },
        {
          num: '08',
          emoji: '🧠',
          icon: FileCheck,
          title: 'Practice & Skill Quizzes',
          desc: 'Study hands-on concepts and take targeted, skill-specific quizzes to validate competence.',
        },
        {
          num: '09',
          emoji: '📈',
          icon: TrendingUp,
          title: 'Track Progress & Mastery',
          desc: 'Log completed milestones and watch your readiness score update as gaps are closed.',
        },
      ],
    },
  ];

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
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  return (
    <section id="how-it-works" className="py-20 sm:py-24 bg-[var(--surface-color)] border-y border-[var(--border-color)]">
      <Container>
        <SectionHeading
          badge="Product Journey"
          title="How Skillora AI Turns Skills Into Your Next Move"
          subtitle="A clear 9-step progression designed to take you from initial skill discovery to interview-ready technical capability."
        />

        {/* 3 Connected Stages Layout */}
        <div className="space-y-12">
          {stages.map((stage) => {
            const isHighlight = stage.isHighlighted;

            return (
              <motion.div
                key={stage.stageNumber}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className="space-y-4"
              >
                {/* Stage Header Line with Badge */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      isHighlight
                        ? 'bg-[var(--highlight-color)]/12 text-[var(--highlight-color)] border-[var(--highlight-color)]/30'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border-color)]'
                    }`}
                  >
                    {stage.stageNumber}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                    {stage.stageName}
                  </h3>
                  <div className="flex-1 h-px bg-[var(--border-color)]" aria-hidden="true" />
                </div>

                {/* 3 Step Cards in Row / Responsive Stack */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stage.steps.map((step) => {
                    const Icon = step.icon;
                    const isApex = step.isApex;

                    return (
                      <motion.div key={step.num} variants={itemVariants}>
                        <Card
                          hover
                          className={`h-full flex flex-col justify-between p-6 relative transition-all duration-200 ${
                            isApex
                              ? 'bg-[var(--surface-elevated)] border-[var(--highlight-color)]/50 shadow-md ring-1 ring-[var(--highlight-color)]/20'
                              : 'border-[var(--border-color)]'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Card Top: Step Number + Icon + Emoji */}
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-black text-[var(--text-muted)]/40 font-mono">
                                {step.num}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--primary-color)] flex items-center justify-center">
                                  <Icon className="w-4 h-4" aria-hidden="true" />
                                </div>
                                <span className="text-lg select-none" aria-hidden="true">
                                  {step.emoji}
                                </span>
                              </div>
                            </div>

                            {/* Title & Description */}
                            <h4 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                              {step.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                              {step.desc}
                            </p>
                          </div>

                          {isApex && (
                            <div className="pt-3 mt-3 border-t border-[var(--highlight-color)]/30 flex items-center justify-between text-[11px] font-semibold text-[var(--highlight-color)]">
                              <span>Core Diagnostic Milestone</span>
                              <span>★ Key Step</span>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Authentic Student Study Showcase Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mt-16 rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--surface-elevated)] shadow-lg"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 lg:p-10">
            {/* Left Story Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[var(--accent-color)] bg-[var(--accent-color)]/15 border border-[var(--accent-color)]/25">
                <span>🎓 Academic Excellence & Collaboration</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
                Built For Serious Students, Aspiring Engineers & Career Changers
              </h3>
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                Rather than generic certificates or superficial quizzes, Skillora AI focuses on objective diagnostic
                validation. Compare your real skills against active industry benchmarks and study with curated
                learning roadmaps that make every study session count.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="text-[var(--accent-color)]">●</span> 100% Free & Open Benchmarks
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[var(--primary-color)]">●</span> Zero AI Hallucination Claims
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[var(--highlight-color)]">●</span> Structured Milestone Pacing
                </span>
              </div>
            </div>

            {/* Right Photography Frame */}
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-md group">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src="/images/collaborative-learning.jpg"
                  alt="Students studying collaboratively with laptops in a technical seminar"
                  width="1200"
                  height="800"
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-104"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-[var(--surface-color)]/95 backdrop-blur-md border border-[var(--border-color)] text-[11px] font-medium text-[var(--text-main)] shadow-sm">
                <p className="truncate">Collaborative peer study & diagnostic validation</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
