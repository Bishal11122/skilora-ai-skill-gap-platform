import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Compass,
  FileText,
  Target,
  Milestone,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Calendar,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(60, 'Display name cannot exceed 60 characters'),
});

export default function DashboardPage() {
  const { user, profile, logout, updateDisplayName } = useAuth();
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [resumeData, setResumeData] = useState(null);
  const [careerName, setCareerName] = useState('');

  // Skill Gap & Roadmap state
  const [gapData, setGapData] = useState(null);
  const [loadingGaps, setLoadingGaps] = useState(false);
  const [gapError, setGapError] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);

  // Collapsible section states
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showOtherSkills, setShowOtherSkills] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  // Fetch initial setup data
  useEffect(() => {
    let isMounted = true;
    async function fetchSetupInfo() {
      setLoadingSetup(true);
      try {
        const [resumeRes, careersRes, roadmapRes] = await Promise.all([
          getAuth('/resume'),
          getAuth('/careers'),
          getAuth('/roadmap'),
        ]);
        if (!isMounted) return;

        if (resumeRes?.data?.resume) {
          setResumeData(resumeRes.data.resume);
        } else {
          setResumeData(null);
        }

        if (careersRes?.data && profile?.selectedCareerId) {
          const match = careersRes.data.find((c) => c.id === profile.selectedCareerId);
          setCareerName(match ? match.name : profile.selectedCareerId);
        }

        if (roadmapRes?.data?.hasRoadmap && roadmapRes.data.roadmap) {
          setRoadmapData(roadmapRes.data.roadmap);
        } else {
          setRoadmapData(null);
        }
      } catch {
        // Non-blocking fallback
      } finally {
        if (isMounted) setLoadingSetup(false);
      }
    }

    fetchSetupInfo();
    return () => {
      isMounted = false;
    };
  }, [profile?.selectedCareerId]);

  // Real-time skill gap analysis fetch
  useEffect(() => {
    let isMounted = true;

    async function fetchGaps() {
      if (!profile?.selectedCareerId) {
        setGapData(null);
        return;
      }

      setLoadingGaps(true);
      setGapError(null);

      try {
        const res = await getAuth('/skills/gap');
        if (!isMounted) return;

        if (res.error) {
          setGapError(res.error);
        } else if (res.data) {
          setGapData(res.data);
        }
      } catch (err) {
        if (isMounted) setGapError(err.message || 'Failed to calculate skill gaps.');
      } finally {
        if (isMounted) setLoadingGaps(false);
      }
    }

    fetchGaps();

    return () => {
      isMounted = false;
    };
  }, [profile?.selectedCareerId, profile?.lastAssessedAt, profile?.skillsExtractedAt]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    values: {
      displayName: profile?.displayName || user?.displayName || '',
    },
  });

  const onSubmit = async (data) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateDisplayName(data.displayName);
      setSuccessMessage('Display name updated successfully.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    }
  };

  const formattedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  // Derived metrics
  const readiness = gapData?.summary?.overallReadinessPercentage ?? null;
  const skillsNeedingFocus = gapData?.skillGaps?.filter((s) => s.gap > 0).length ?? 0;
  const roadmapProgress = roadmapData?.summary?.progressPercentage ?? 0;

  // Split skill gaps into top 3 and remainder
  const allSkills = gapData?.skillGaps || [];
  const topThreeSkills = allSkills.slice(0, 3);
  const remainingSkills = allSkills.slice(3);

  // Active milestone for next action
  const activeMilestone =
    roadmapData?.milestones?.find((m) => m.status === 'in-progress') ||
    roadmapData?.milestones?.find((m) => m.status === 'not-started') ||
    roadmapData?.milestones?.[0] ||
    null;

  return (
    <div className="py-8 sm:py-12 min-h-[75vh]">
      <Container size="narrow">
        <div className="space-y-6">
          {/* ===================================================================
              1. WELCOME & SELECTED CAREER
             =================================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
                Welcome back, {profile?.displayName || user?.displayName || 'Learner'}
              </h1>
              <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5 flex-wrap">
                <span>Target Career:</span>
                {profile?.selectedCareerId ? (
                  <>
                    <strong className="text-[var(--text-main)] font-semibold">
                      {careerName || profile.selectedCareerId}
                    </strong>
                    <Link
                      to="/career"
                      className="text-xs text-[var(--primary-color)] hover:underline ml-1 font-medium"
                    >
                      Change
                    </Link>
                  </>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">None selected</span>
                )}
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              className="self-start sm:self-auto text-xs text-[var(--text-muted)]"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Sign Out
            </Button>
          </div>

          {/* ===================================================================
              2. ONE PROMINENT NEXT-STEP CARD
             =================================================================== */}
          {!profile?.selectedCareerId ? (
            <Card className="p-5 sm:p-6 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[var(--primary-color)]" />
                    <h2 className="text-sm font-bold text-[var(--text-main)]">
                      Step 1: Choose Your Career Track
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] max-w-xl">
                    Select your target engineering or data role to generate industry benchmark requirements and identify your skill gaps.
                  </p>
                </div>
                <Button to="/career" variant="primary" size="sm" className="shrink-0 self-start sm:self-center">
                  Select Career
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </Card>
          ) : !resumeData && !profile?.assessedSkills?.length ? (
            <Card className="p-5 sm:p-6 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--primary-color)]" />
                    <h2 className="text-sm font-bold text-[var(--text-main)]">
                      Personalize Your Skill Gaps
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] max-w-xl">
                    Upload your resume or take a 10-minute diagnostic test so Skilora can measure your current skills against {careerName || 'career'} requirements.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <Button to="/resume" variant="primary" size="sm">
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    Upload Resume
                  </Button>
                  <Button to="/assessment" variant="secondary" size="sm">
                    Diagnostic Test
                  </Button>
                </div>
              </div>
            </Card>
          ) : roadmapData ? (
            <Card className="p-5 sm:p-6 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[var(--primary-color)]" />
                    <h2 className="text-sm font-bold text-[var(--text-main)]">
                      Next Step: {activeMilestone?.skillName || 'Continue Learning'}
                    </h2>
                    {activeMilestone && (
                      <Badge variant="indigo" className="text-[10px] py-0">
                        Milestone #{activeMilestone.order}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] max-w-xl line-clamp-1">
                    {activeMilestone?.learningObjective || 'Work through your sequenced curriculum topics and curated resources.'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <Button to="/roadmap" variant="primary" size="sm">
                    Continue Learning
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                  <Button to="/resources" variant="secondary" size="sm">
                    Resources
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-5 sm:p-6 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Milestone className="w-4 h-4 text-[var(--primary-color)]" />
                    <h2 className="text-sm font-bold text-[var(--text-main)]">
                      Ready to Build Your Learning Roadmap
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] max-w-xl">
                    Generate your sequenced, 5-step learning path tailored to your priority skill gaps for {careerName || 'your career'}.
                  </p>
                </div>
                <Button to="/roadmap" variant="primary" size="sm" className="shrink-0 self-start sm:self-center">
                  Generate Roadmap
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </Card>
          )}

          {/* ===================================================================
              3. AT MOST THREE SUMMARY METRICS
             =================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Metric 1: Skill Readiness */}
            <div className="p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Skill Readiness
                </span>
                <span className="text-sm font-bold text-[var(--text-main)]">
                  {readiness !== null ? `${readiness}%` : '—'}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--primary-color)] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(readiness ? 5 : 0, readiness || 0))}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                {gapData
                  ? `${gapData.summary.evaluatedSkillsCount} of ${gapData.summary.totalBenchmarkSkills} skills evaluated`
                  : 'Based on 80% benchmark target'}
              </p>
            </div>

            {/* Metric 2: Skills to Improve */}
            <div className="p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xs space-y-1">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Skills to Improve
              </span>
              <p className="text-sm font-bold text-[var(--text-main)]">
                {gapData ? `${skillsNeedingFocus} skills` : '—'}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {gapData?.summary?.topPrioritySkill
                  ? `Top focus: ${gapData.summary.topPrioritySkill}`
                  : 'Select a career to analyze'}
              </p>
            </div>

            {/* Metric 3: Learning Progress */}
            <div className="p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Learning Progress
                </span>
                <span className="text-sm font-bold text-[var(--text-main)]">
                  {roadmapProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(roadmapProgress > 0 ? 5 : 0, roadmapProgress))}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                {roadmapData
                  ? `${roadmapData.summary.completedMilestones} of ${roadmapData.summary.totalMilestones} milestones complete`
                  : 'Start learning to track progress'}
              </p>
            </div>
          </div>

          {/* Error alert if gap calculation failed */}
          {gapError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{gapError}</span>
            </div>
          )}

          {/* ===================================================================
              4. THE THREE HIGHEST-PRIORITY SKILL GAPS
             =================================================================== */}
          <Card className="p-5 sm:p-6 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[var(--border-color)]">
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)]">
                  Skill Gap Analysis
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  The difference between your current level and the target career benchmark (80%).
                </p>
              </div>

              {loadingGaps ? (
                <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary-color)]" />
                  Updating gaps...
                </div>
              ) : gapData ? (
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {gapData.summary.evaluatedSkillsCount} of {gapData.summary.totalBenchmarkSkills} evaluated
                </span>
              ) : null}
            </div>

            {!profile?.selectedCareerId ? (
              <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                Select a target career to view your benchmark skill gaps.
              </p>
            ) : allSkills.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                No skill gap data available yet.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Desktop Clean Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-medium">
                        <th className="pb-2.5 font-medium">Skill</th>
                        <th className="pb-2.5 font-medium">Current</th>
                        <th className="pb-2.5 font-medium">Target</th>
                        <th className="pb-2.5 font-medium w-36">Progress</th>
                        <th className="pb-2.5 font-medium">Priority</th>
                        <th className="pb-2.5 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {(showAllSkills ? allSkills : topThreeSkills).map((skill) => {
                        const hasScore = skill.hasEvidence && skill.currentLevel !== null;

                        return (
                          <tr key={skill.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 font-semibold text-[var(--text-main)]">
                              {skill.name}
                            </td>
                            <td className="py-3">
                              {hasScore ? (
                                <span className="font-medium text-[var(--text-main)]">
                                  {skill.currentLevel}%
                                </span>
                              ) : (
                                <Badge variant="warning" className="text-[10px] py-0 px-1.5">
                                  Not assessed
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 font-medium text-[var(--text-muted)]">
                              {skill.requiredLevel}%
                            </td>
                            <td className="py-3">
                              <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    skill.classificationCode === 'high'
                                      ? 'bg-amber-500'
                                      : skill.classificationCode === 'medium'
                                      ? 'bg-indigo-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, Math.max(hasScore ? 5 : 0, skill.effectiveLevel))}%`,
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  skill.classificationCode === 'high'
                                    ? 'warning'
                                    : skill.classificationCode === 'medium'
                                    ? 'indigo'
                                    : 'success'
                                }
                                className="text-[10px]"
                              >
                                {skill.classificationCode === 'high'
                                  ? 'High'
                                  : skill.classificationCode === 'medium'
                                  ? 'Medium'
                                  : 'Low'}
                              </Badge>
                            </td>
                            <td className="py-3 text-right">
                              <Button
                                to="/roadmap"
                                variant="secondary"
                                size="sm"
                                className="text-xs py-1 px-2.5 font-medium"
                              >
                                Learn skill
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked Cards */}
                <div className="sm:hidden space-y-2.5">
                  {(showAllSkills ? allSkills : topThreeSkills).map((skill) => {
                    const hasScore = skill.hasEvidence && skill.currentLevel !== null;

                    return (
                      <div
                        key={skill.name}
                        className="p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[var(--text-main)]">
                            {skill.name}
                          </span>
                          <Badge
                            variant={
                              skill.classificationCode === 'high'
                                ? 'warning'
                                : skill.classificationCode === 'medium'
                                ? 'indigo'
                                : 'success'
                            }
                            className="text-[10px]"
                          >
                            {skill.classificationCode === 'high'
                              ? 'High'
                              : skill.classificationCode === 'medium'
                              ? 'Medium'
                              : 'Low'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>
                            Current:{' '}
                            {hasScore ? (
                              <strong className="text-[var(--text-main)]">{skill.currentLevel}%</strong>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">Not assessed</span>
                            )}
                          </span>
                          <span>
                            Target: <strong className="text-[var(--text-main)]">{skill.requiredLevel}%</strong>
                          </span>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              skill.classificationCode === 'high'
                                ? 'bg-amber-500'
                                : skill.classificationCode === 'medium'
                                ? 'bg-indigo-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(hasScore ? 5 : 0, skill.effectiveLevel))}%`,
                            }}
                          />
                        </div>

                        <div className="pt-1">
                          <Button to="/roadmap" variant="secondary" size="sm" className="w-full justify-center text-xs">
                            Learn this skill
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Collapsible View All Skills Button */}
                {remainingSkills.length > 0 && (
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllSkills(!showAllSkills)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-color)] hover:underline focus:outline-none"
                    >
                      <span>
                        {showAllSkills
                          ? 'Show top 3 priority skills only'
                          : `View all ${allSkills.length} benchmark skills (${remainingSkills.length} more)`}
                      </span>
                      {showAllSkills ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Optional Collapsed: Non-benchmark Extracted Skills */}
                {gapData.otherExtractedSkills?.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => setShowOtherSkills(!showOtherSkills)}
                      className="w-full flex items-center justify-between text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] py-1"
                    >
                      <span className="font-medium">
                        Other Resume Skills ({gapData.otherExtractedSkills.length})
                      </span>
                      {showOtherSkills ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showOtherSkills && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {gapData.otherExtractedSkills.map((s) => (
                          <span
                            key={s.name}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-[var(--border-color)] text-[var(--text-muted)]"
                          >
                            <span className="font-medium text-[var(--text-main)]">{s.name}</span>
                            <span>•</span>
                            <span>{s.level}%</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* ===================================================================
              5. COMPACT ROADMAP PREVIEW & SECONDARY LINKS
             =================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Roadmap Mini-Journey */}
            <Card className="p-4 sm:p-5 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Milestone className="w-4 h-4 text-[var(--primary-color)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                    Learning Roadmap
                  </h3>
                </div>
                <Link
                  to="/roadmap"
                  className="text-xs text-[var(--primary-color)] hover:underline font-medium"
                >
                  View full path
                </Link>
              </div>

              {roadmapData ? (
                <div className="space-y-2">
                  {roadmapData.milestones.slice(0, 3).map((m) => (
                    <div
                      key={m.order}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-[var(--border-color)]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] font-semibold text-[var(--text-muted)]">
                          #{m.order}
                        </span>
                        <span className="font-medium text-[var(--text-main)] truncate">
                          {m.skillName}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] capitalize shrink-0">
                        {m.status.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-2">
                  Generate your roadmap to see your sequenced milestone curriculum.
                </p>
              )}
            </Card>

            {/* Quick Actions / Secondary Links */}
            <Card className="p-4 sm:p-5 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                Learning Tools
              </h3>
              <div className="space-y-2">
                <Link
                  to="/resources"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-[var(--border-color)] transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[var(--primary-color)]" />
                    <div>
                      <p className="font-semibold text-[var(--text-main)]">Curated Learning Resources</p>
                      <p className="text-[11px] text-[var(--text-muted)]">Verified free documentation &amp; guides</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </Link>

                <Link
                  to="/assessment"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-[var(--border-color)] transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[var(--primary-color)]" />
                    <div>
                      <p className="font-semibold text-[var(--text-main)]">Diagnostic Assessment</p>
                      <p className="text-[11px] text-[var(--text-muted)]">10-minute baseline competency test</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </Link>

                <Link
                  to="/resume"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-[var(--border-color)] transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--primary-color)]" />
                    <div>
                      <p className="font-semibold text-[var(--text-main)]">Resume Document</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {resumeData ? resumeData.originalFileName : 'Upload PDF or DOCX'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </Link>
              </div>
            </Card>
          </div>

          {/* ===================================================================
              6. PROFILE & ACCOUNT DETAILS (COLLAPSED BY DEFAULT)
             =================================================================== */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowProfileDetails(!showProfileDetails)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="font-semibold text-[var(--text-main)]">Account Settings</span>
                <span className="text-[11px]">({profile?.email || user?.email || 'Logged in'})</span>
              </div>
              {showProfileDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showProfileDetails && (
              <Card className="mt-2 p-5 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-[var(--border-color)] flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[var(--text-muted)]">Email</p>
                      <p className="font-medium text-[var(--text-main)] truncate">{profile?.email || user?.email || '—'}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-[var(--border-color)] flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[var(--text-muted)]">Member Since</p>
                      <p className="font-medium text-[var(--text-main)]">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Display Name Edit Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="pt-3 border-t border-[var(--border-color)] space-y-3">
                  {successMessage && (
                    <div
                      role="status"
                      className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}
                  {errorMessage && (
                    <div
                      role="alert"
                      className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-xs text-red-700 dark:text-red-300"
                    >
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1">
                      <label htmlFor="displayName" className="sr-only">
                        Display Name
                      </label>
                      <input
                        id="displayName"
                        type="text"
                        disabled={isSubmitting}
                        placeholder="Your display name"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                        {...register('displayName')}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSubmitting}
                      className="text-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Update Name'
                      )}
                    </Button>
                  </div>
                  {errors.displayName && (
                    <p className="text-xs text-red-600 mt-1">{errors.displayName.message}</p>
                  )}
                </form>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
