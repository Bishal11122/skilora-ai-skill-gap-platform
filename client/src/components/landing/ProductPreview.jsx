import { motion, useReducedMotion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

/**
 * Isolated illustrative product preview with tasteful floating UI badges
 * and smooth scroll-triggered progress bar indicators.
 */
export default function ProductPreview() {
  const shouldReduceMotion = useReducedMotion();

  const sampleSkills = [
    { name: 'JavaScript', current: 75, target: 80, gap: 'Low Gap (5)', color: 'text-[var(--accent-color)]', barColor: 'bg-[var(--accent-color)]' },
    { name: 'React', current: 45, target: 80, gap: 'Medium Gap (35)', color: 'text-[var(--primary-color)]', barColor: 'bg-[var(--primary-color)]' },
    { name: 'Node.js', current: 30, target: 80, gap: 'High Gap (50) • Priority 1', color: 'text-[var(--highlight-color)]', barColor: 'bg-[var(--highlight-color)]' },
  ];

  const sampleRoadmap = [
    { title: 'Node.js Core & Async Patterns', status: 'In progress', active: true },
    { title: 'Express REST APIs & Middleware', status: 'Next up', active: false },
    { title: 'Database Integration & Security', status: 'Upcoming', active: false },
  ];

  // Subtle floating animation variants
  const floatingBadgeTop = shouldReduceMotion
    ? {}
    : {
        animate: {
          y: [0, -8, 0],
          transition: {
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      };

  const floatingBadgeBottom = shouldReduceMotion
    ? {}
    : {
        animate: {
          y: [0, 8, 0],
          transition: {
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Decorative Floating Element 1: Top-Right Skill Badge */}
      <motion.div
        {...floatingBadgeTop}
        className="hidden sm:flex absolute -top-5 -right-4 z-20 items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-color)]/95 backdrop-blur-md border border-[var(--border-color)] shadow-md text-xs font-semibold text-[var(--text-main)] pointer-events-none"
        aria-hidden="true"
      >
        <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
        <span>Target: Senior Full Stack</span>
      </motion.div>

      {/* Decorative Floating Element 2: Bottom-Left AI Readiness */}
      <motion.div
        {...floatingBadgeBottom}
        className="hidden sm:flex absolute -bottom-5 -left-4 z-20 items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-color)]/95 backdrop-blur-md border border-[var(--border-color)] shadow-md text-xs font-semibold text-[var(--text-main)] pointer-events-none"
        aria-hidden="true"
      >
        <TrendingUp className="w-3.5 h-3.5 text-[var(--primary-color)]" />
        <span>AI Readiness: 82%</span>
      </motion.div>

      {/* Main Preview Container Card */}
      <Card className="relative overflow-hidden p-6 sm:p-7 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xl space-y-6">
        {/* Sample Data Disclaimer Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--highlight-color)]" />
            <div className="w-3 h-3 rounded-full bg-[var(--accent-color)]" />
            <div className="w-3 h-3 rounded-full bg-[var(--primary-color)]" />
            <span className="text-xs font-mono text-[var(--text-muted)] ml-2">skillora.ai/preview</span>
          </div>
          <Badge variant="plum">SAMPLE DATA</Badge>
        </div>

        {/* Career Target & Overall Readiness */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Target Role</p>
            <h4 className="text-lg font-bold text-[var(--text-main)]">Full Stack Developer</h4>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Benchmark Fit</p>
            <p className="text-lg font-bold text-[var(--accent-color)]">62% Match</p>
          </div>
        </div>

        {/* Skill Gap Analysis Progress Bars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Skill Gap Breakdown (Illustrative)
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">Current vs Benchmark (80)</span>
          </div>

          {sampleSkills.map((skill) => (
            <div key={skill.name} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--text-main)]">{skill.name}</span>
                <span className={`font-medium ${skill.color}`}>{skill.gap}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--surface-elevated)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.current}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className={`h-full rounded-full ${skill.barColor}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap Preview Steps */}
        <div className="pt-2 border-t border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Roadmap Timeline (Illustrative)
            </span>
            <span className="text-[11px] font-medium text-[var(--primary-color)]">3 Steps Ahead</span>
          </div>

          <div className="space-y-2">
            {sampleRoadmap.map((item, index) => (
              <div
                key={item.title}
                className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                  item.active
                    ? 'bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/25 text-[var(--text-main)] font-semibold'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-muted)]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-4 h-4 rounded-full bg-[var(--surface-color)] text-[10px] flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="truncate">{item.title}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider shrink-0 font-medium">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
