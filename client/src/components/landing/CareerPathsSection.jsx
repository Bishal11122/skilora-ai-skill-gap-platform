import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Layers, Globe, BarChart2, Terminal, Cpu, ArrowUpRight } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import Card from '../ui/Card';

/**
 * Section 4: Career Paths Section showcasing 5 target roles.
 *
 * NOTE: These are static marketing labels for the public landing view.
 * Real career benchmark skills and required scoring thresholds are planned
 * to be stored and retrieved dynamically from Cloud Firestore in Phase 6.
 */
export default function CareerPathsSection() {
  const shouldReduceMotion = useReducedMotion();

  const careers = [
    {
      icon: Layers,
      emoji: '💻',
      title: 'Full Stack Developer',
      roleBadge: 'Engineering',
      badgeColor: 'plum',
      description: 'Master modern frontend and backend frameworks, relational databases, and secure REST APIs.',
      skills: ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'System Design'],
    },
    {
      icon: Globe,
      emoji: '🎨',
      title: 'Frontend Developer',
      roleBadge: 'Interface',
      badgeColor: 'coral',
      description: 'Specialize in responsive interfaces, modern component architecture, state management, and web performance.',
      skills: ['TypeScript', 'React', 'Tailwind CSS', 'Web Vitals', 'UI/UX'],
    },
    {
      icon: BarChart2,
      emoji: '📊',
      title: 'Data Analyst',
      roleBadge: 'Analytics',
      badgeColor: 'sage',
      description: 'Analyze data trends, write performant SQL queries, and construct actionable visual dashboards.',
      skills: ['SQL', 'Python', 'PowerBI', 'Statistics', 'Data Modeling'],
    },
    {
      icon: Terminal,
      emoji: '🐍',
      title: 'Python Developer',
      roleBadge: 'Backend',
      badgeColor: 'plum',
      description: 'Develop backend automation services, data pipelines, asynchronous APIs, and server-side utilities.',
      skills: ['Python', 'FastAPI', 'AsyncIO', 'Docker', 'PostgreSQL'],
    },
    {
      icon: Cpu,
      emoji: '🤖',
      title: 'AI/ML Engineer',
      roleBadge: 'Intelligence',
      badgeColor: 'coral',
      description: 'Design machine learning workflows, fine-tune models, and integrate generative AI APIs and vector search.',
      skills: ['PyTorch', 'LLM APIs', 'Prompt Eng', 'Vector DBs', 'RAG'],
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
    <section id="careers" className="py-20 sm:py-24 bg-[var(--bg-color)]">
      <Container>
        <SectionHeading
          badge="Target Roles"
          title="Standardized Technical Career Paths"
          subtitle="Benchmark your capabilities against current industry expectations for high-demand technical positions."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {careers.map((career, idx) => {
            const Icon = career.icon;
            // The 5th card centers nicely on desktop
            const spanClass = idx === 4 ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : '';

            return (
              <motion.div key={career.title} variants={itemVariants} className={spanClass}>
                <Card
                  hover
                  className="h-full flex flex-col justify-between p-6 sm:p-7 border-[var(--border-color)] hover:border-[var(--primary-color)]/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Header: Role Icon + Tag + Tasteful Emoji */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-xl bg-[var(--surface-elevated)] text-[var(--primary-color)] border border-[var(--border-color)] flex items-center justify-center">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                          {career.roleBadge}
                        </span>
                      </div>
                      <span className="text-xl select-none" aria-hidden="true">
                        {career.emoji}
                      </span>
                    </div>

                    {/* Title Area */}
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                        {career.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mt-1.5">
                        {career.description}
                      </p>
                    </div>

                    {/* Skill Benchmark Badges */}
                    <div className="pt-2">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                        Core Competencies
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {career.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--surface-elevated)] text-[var(--text-main)] border border-[var(--border-color)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Destination-checked CTA */}
                  <div className="pt-5 mt-5 border-t border-[var(--border-color)]">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-color)] hover:text-[var(--primary-hover)] transition-colors group"
                      aria-label={`Explore ${career.title} roadmap`}
                    >
                      <span>Explore role roadmap</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
