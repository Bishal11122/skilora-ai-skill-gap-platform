import { useState, useEffect, useCallback } from 'react';
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
  RotateCcw,
  TrendingUp,
  ShieldCheck,
  Zap,
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

  // Authenticated Dashboard Analytics State (Phase 12)
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Secondary data
  const [resumeData, setResumeData] = useState(null);

  // Collapsible section states
  const [showOtherSkills, setShowOtherSkills] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  // Fetch unified authenticated dashboard analytics
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const [analyticsRes, resumeRes] = await Promise.all([
        getAuth('/dashboard/analytics'),
        getAuth('/resume').catch(() => null),
      ]);

      if (analyticsRes?.error) {
        setAnalyticsError(analyticsRes.error.message || 'Unable to load dashboard analytics.');
      } else if (analyticsRes?.data) {
        setAnalytics(analyticsRes.data);
      }

      if (resumeRes?.data?.resume) {
        setResumeData(resumeRes.data.resume);
      } else {
        setResumeData(null);
      }
    } catch (err) {
      setAnalyticsError(err.message || 'Failed to connect to analytics service.');
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, profile?.selectedCareerId, profile?.lastAssessedAt]);

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

  // Destructure validated analytics payload
  const hasCareer = analytics?.hasCareer ?? Boolean(profile?.selectedCareerId);
  const careerName = analytics?.careerName || profile?.selectedCareerId || 'Target Career';
  const readiness = analytics?.readinessPercentage ?? 0;
  const skillsSummary = analytics?.skillsSummary || {
    totalBenchmarkSkills: 0,
    atBenchmarkCount: 0,
    remainingGapsCount: 0,
    notAssessedCount: 0,
  };
  const roadmapProgress = analytics?.roadmapProgress || {
    hasRoadmap: false,
    totalMilestones: 0,
    completedMilestones: 0,
    inProgressMilestones: 0,
    notStartedMilestones: 0,
    totalTopics: 0,
    completedTopics: 0,
    topicsCompletionPercentage: 0,
    progressPercentage: 0,
    activeMilestone: null,
  };
  const diagnostic = analytics?.diagnosticAssessment || {
    isCompleted: false,
    lastAssessmentId: null,
    lastAssessedAt: null,
    assessedSkillsCount: 0,
    averageDiagnosticScore: null,
  };
  const practiceStats = analytics?.practiceStats || {
    totalAttempts: 0,
    skillsPracticedCount: 0,
    averageLatestScore: null,
    bestOverallScore: null,
    skillStats: [],
  };
  const skillGaps = analytics?.skillGaps || [];
  const nextAction = analytics?.nextAction || null;
  const otherExtractedSkills = analytics?.otherExtractedSkills || [];

  return (
    <div className="py-8 sm:py-12 min-h-[75vh]">
      <Container size="narrow">
        <div className="space-y-6">
          {/* ===================================================================
              1. HEADER: GREETING & SELECTED CAREER
             =================================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
                Welcome back, {profile?.displayName || user?.displayName || 'Learner'}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] flex items-center gap-1.5 flex-wrap">
                <span>Target Career Benchmark:</span>
                {hasCareer ? (
                  <>
                    <strong className="text-[var(--text-main)] font-semibold">
                      {careerName}
                    </strong>
                    <Link
                      to="/career"
                      className="text-xs text-[var(--primary-color)] hover:underline ml-1 font-medium"
                      title="Change target career"
                    >
                      Change
                    </Link>
                  </>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">None selected</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchAnalytics}
                disabled={loadingAnalytics}
                className="text-xs"
                title="Refresh dashboard data"
              >
                <RotateCcw className={`w-3.5 h-3.5 mr-1 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                className="text-xs text-[var(--text-muted)]"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Error Banner */}
          {analyticsError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{analyticsError}</span>
            </div>
          )}

          {/* ===================================================================
              2. GUIDED NEXT STEP BANNER
             =================================================================== */}
          {nextAction && (
            <Card className="p-5 sm:p-6 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {nextAction.type === 'SELECT_CAREER' && <Compass className="w-4 h-4 text-[var(--primary-color)]" />}
                    {nextAction.type === 'INITIAL_EVALUATION' && <Sparkles className="w-4 h-4 text-[var(--primary-color)]" />}
                    {nextAction.type === 'GENERATE_ROADMAP' && <Milestone className="w-4 h-4 text-[var(--primary-color)]" />}
                    {nextAction.type === 'CONTINUE_LEARNING' && <Target className="w-4 h-4 text-[var(--primary-color)]" />}
                    {nextAction.type === 'ALL_COMPLETE' && <Award className="w-4 h-4 text-emerald-600" />}
                    <h2 className="text-sm font-bold text-[var(--text-main)]">
                      {nextAction.title}
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] max-w-xl">
                    {nextAction.description}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <Button to={nextAction.actionUrl} variant="primary" size="sm">
                    {nextAction.actionText}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                  {nextAction.secondaryActionText && (
                    <Button to={nextAction.secondaryActionUrl} variant="secondary" size="sm">
                      {nextAction.secondaryActionText}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* ===================================================================
              3. DASHBOARD OVERVIEW METRICS (4 ANALYTICS PILLARS)
             =================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 3.1 Overall Career Readiness */}
            <div className="p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[var(--primary-color)]" />
                    Career Readiness
                  </span>
                  <span className="text-sm font-bold text-[var(--text-main)]">
                    {loadingAnalytics ? '...' : `${readiness}%`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-[var(--primary-color)] transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(readiness > 0 ? 5 : 0, readiness))}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Target: <strong>80% benchmark</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {skillsSummary.atBenchmarkCount}/{skillsSummary.totalBenchmarkSkills} met
                </span>
              </div>
            </div>

            {/* 3.2 Skills Benchmark Breakdown */}
            <div className="p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between space-y-2">
              <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                Benchmark Skills
              </span>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">At Benchmark:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {skillsSummary.atBenchmarkCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Remaining Gaps:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {skillsSummary.remainingGapsCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Not Yet Assessed:</span>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {skillsSummary.notAssessedCount}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]">
                Based on canonical {careerName} requirements
              </p>
            </div>

            {/* 3.3 Learning Roadmap & Stored Topics */}
            <div className="p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                    <Milestone className="w-3.5 h-3.5 text-emerald-500" />
                    Learning Progress
                  </span>
                  <span className="text-sm font-bold text-[var(--text-main)]">
                    {roadmapProgress.hasRoadmap ? `${roadmapProgress.topicsCompletionPercentage}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          roadmapProgress.topicsCompletionPercentage > 0 ? 5 : 0,
                          roadmapProgress.topicsCompletionPercentage
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--border-color)] space-y-0.5 text-[11px] text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>Milestones:</span>
                  <strong className="text-[var(--text-main)]">
                    {roadmapProgress.completedMilestones}/{roadmapProgress.totalMilestones} done
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Completed Topics:</span>
                  <strong className="text-[var(--text-main)]">
                    {roadmapProgress.completedTopics}/{roadmapProgress.totalTopics}
                  </strong>
                </div>
              </div>
            </div>

            {/* 3.4 Diagnostic vs Practice Status */}
            <div className="p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between space-y-2">
              <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                Assessment Verification
              </span>
              <div>
                {diagnostic.isCompleted ? (
                  <div className="space-y-1">
                    <Badge variant="success" className="text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Diagnostic Verified
                    </Badge>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {diagnostic.assessedSkillsCount} skills certified
                      {diagnostic.averageDiagnosticScore !== null && ` (${diagnostic.averageDiagnosticScore}% avg)`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Badge variant="coral" className="text-[10px]">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Diagnostic Pending
                    </Badge>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Formal assessment not yet completed
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Practice Checkpoints:</span>
                <strong className="text-[var(--text-main)]">
                  {practiceStats.totalAttempts} {practiceStats.totalAttempts === 1 ? 'attempt' : 'attempts'}
                </strong>
              </div>
            </div>
          </div>

          {/* ===================================================================
              4. SKILL GAP VISUALISATION (Target of 80 Comparison)
             =================================================================== */}
          <Card className="p-5 sm:p-6 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[var(--border-color)]">
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                  <span>Skill Gap Visualisation</span>
                  <Badge variant="plum" className="text-[10px]">
                    Benchmark Target: 80%
                  </Badge>
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Visual comparison of your current verified proficiency against the required 80% benchmark target for {careerName}.
                </p>
              </div>

              {loadingAnalytics && (
                <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary-color)]" />
                  Updating...
                </div>
              )}
            </div>

            {!hasCareer ? (
              <div className="py-8 text-center space-y-3">
                <Compass className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-40" />
                <p className="text-xs text-[var(--text-muted)]">
                  Please select a career track to view your benchmark skill gap comparison.
                </p>
                <Button to="/career" variant="primary" size="sm">
                  Select Career
                </Button>
              </div>
            ) : skillGaps.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                No skill gap data available yet.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Visual Comparative Bars for Each Benchmark Skill */}
                <div className="space-y-3">
                  {skillGaps.map((skill) => {
                    const hasScore = skill.hasEvidence && skill.currentLevel !== null;
                    const level = hasScore ? skill.currentLevel : 0;
                    const isAtBenchmark = skill.gap <= 0;

                    // Progress bar color according to severity
                    let barColor = 'bg-emerald-500';
                    if (!hasScore) {
                      barColor = 'bg-slate-300 dark:bg-slate-700';
                    } else if (skill.classificationCode === 'high') {
                      barColor = 'bg-amber-500';
                    } else if (skill.classificationCode === 'medium') {
                      barColor = 'bg-indigo-500';
                    }

                    return (
                      <div
                        key={skill.name}
                        className="p-3.5 rounded-xl border border-[var(--border-color)] bg-slate-50/50 dark:bg-slate-800/20 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-[var(--text-main)]">
                              {skill.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                              {skill.category}
                            </span>
                            {skill.priorityRank === 1 && skill.gap > 0 && (
                              <Badge variant="coral" className="text-[10px]">
                                <Zap className="w-3 h-3 mr-0.5" />
                                Top Priority Gap
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Evidence source badge */}
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {skill.evidenceSource === 'assessment-verified' && 'Verified Diagnostic'}
                              {skill.evidenceSource === 'practice-checkpoint' && 'Practice Checkpoint'}
                              {skill.evidenceSource === 'resume-inferred' && 'Resume Inferred'}
                              {skill.evidenceSource === 'none' && 'Not Yet Assessed'}
                            </span>

                            {/* Gap Classification Badge */}
                            {isAtBenchmark ? (
                              <Badge variant="success" className="text-[10px]">
                                Benchmark Met
                              </Badge>
                            ) : (
                              <Badge
                                variant={
                                  skill.classificationCode === 'high'
                                    ? 'warning'
                                    : skill.classificationCode === 'medium'
                                    ? 'indigo'
                                    : 'neutral'
                                }
                                className="text-[10px]"
                              >
                                {skill.classification} ({skill.gap}% gap)
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Benchmark Bar with Target 80 Marker */}
                        <div className="space-y-1">
                          <div className="relative w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                            {/* Fill bar */}
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                              style={{ width: `${Math.min(100, Math.max(hasScore ? 4 : 0, level))}%` }}
                            />

                            {/* 80% Benchmark Threshold Marker */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10 opacity-70"
                              style={{ left: '80%' }}
                              title="Required Benchmark Target: 80%"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                            <span>
                              Current:{' '}
                              {hasScore ? (
                                <strong className="text-[var(--text-main)]">{skill.currentLevel}%</strong>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">Not assessed (0%)</span>
                              )}
                            </span>
                            <span className="font-medium text-[var(--text-main)]">
                              Required Target: <strong>80%</strong>
                            </span>
                          </div>
                        </div>

                        {/* Actions per skill */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <p className="text-[11px] text-[var(--text-muted)] italic truncate max-w-sm hidden sm:block">
                            {skill.explanation}
                          </p>

                          <div className="flex items-center gap-2 shrink-0 ml-auto">
                            <Button
                              to={`/roadmap?skill=${encodeURIComponent(skill.name)}`}
                              variant="secondary"
                              size="sm"
                              className="text-xs py-1 px-2.5 font-medium"
                            >
                              Learn on Roadmap
                            </Button>
                            {skill.gap > 0 && (
                              <Button
                                to={`/quiz?skill=${encodeURIComponent(skill.name)}`}
                                variant="primary"
                                size="sm"
                                className="text-xs py-1 px-2.5 font-medium"
                              >
                                Practice Quiz
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional Collapsed: Other Non-benchmark Resume Skills */}
                {otherExtractedSkills.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => setShowOtherSkills(!showOtherSkills)}
                      className="w-full flex items-center justify-between text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] py-1"
                    >
                      <span className="font-medium">
                        Other Resume Skills ({otherExtractedSkills.length}) — Excluded from {careerName} benchmark
                      </span>
                      {showOtherSkills ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showOtherSkills && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {otherExtractedSkills.map((s) => (
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
              5. LEARNING PROGRESS & ROADMAP TOPIC CHECKLIST
             =================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Learning Progress Breakdown */}
            <Card className="p-5 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Milestone className="w-4 h-4 text-[var(--primary-color)]" />
                  <h3 className="text-sm font-bold text-[var(--text-main)]">
                    Roadmap Milestone Progress
                  </h3>
                </div>
                <Link
                  to="/roadmap"
                  className="text-xs text-[var(--primary-color)] hover:underline font-medium"
                >
                  Open Full Roadmap →
                </Link>
              </div>

              {roadmapProgress.hasRoadmap ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Completed</p>
                      <p className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                        {roadmapProgress.completedMilestones}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">In Progress</p>
                      <p className="text-base font-bold text-indigo-800 dark:text-indigo-300">
                        {roadmapProgress.inProgressMilestones}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Not Started</p>
                      <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                        {roadmapProgress.notStartedMilestones}
                      </p>
                    </div>
                  </div>

                  {roadmapProgress.activeMilestone && (
                    <div className="p-3 rounded-lg border border-[var(--border-color)] bg-slate-50/60 dark:bg-slate-800/30 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[var(--text-muted)]">Active Milestone:</span>
                        <Badge variant="indigo" className="text-[10px]">
                          Step #{roadmapProgress.activeMilestone.order}
                        </Badge>
                      </div>
                      <p className="font-semibold text-xs text-[var(--text-main)]">
                        {roadmapProgress.activeMilestone.skillName}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                        {roadmapProgress.activeMilestone.learningObjective}
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <Button
                          to={`/roadmap?skill=${encodeURIComponent(roadmapProgress.activeMilestone.skillName)}`}
                          variant="primary"
                          size="sm"
                          className="text-xs"
                        >
                          Continue Learning
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                        <Button
                          to={`/resources`}
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1" />
                          Resources
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-[var(--text-muted)] italic">
                    Milestones and topics are completed deliberately as you study on the roadmap. Practice quiz submissions do not automatically mark roadmap milestones as completed.
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-[var(--text-muted)]">
                    No active roadmap generated for {careerName}.
                  </p>
                  <Button to="/roadmap" variant="primary" size="sm">
                    Generate Roadmap
                  </Button>
                </div>
              )}
            </Card>

            {/* Practice Improvement & History */}
            <Card className="p-5 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-[var(--text-main)]">
                    Practice Improvement
                  </h3>
                </div>
                <Link
                  to="/quiz"
                  className="text-xs text-[var(--primary-color)] hover:underline font-medium"
                >
                  Practice Centre →
                </Link>
              </div>

              {practiceStats.totalAttempts > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-[var(--border-color)]">
                      <p className="text-[10px] text-[var(--text-muted)]">Total Attempts</p>
                      <p className="text-base font-bold text-[var(--text-main)]">
                        {practiceStats.totalAttempts}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-[var(--border-color)]">
                      <p className="text-[10px] text-[var(--text-muted)]">Best Score</p>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {practiceStats.bestOverallScore !== null ? `${practiceStats.bestOverallScore}%` : '—'}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-[var(--border-color)]">
                      <p className="text-[10px] text-[var(--text-muted)]">Latest Avg</p>
                      <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                        {practiceStats.averageLatestScore !== null ? `${practiceStats.averageLatestScore}%` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Individual Practiced Skills List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {practiceStats.skillStats.map((st) => (
                      <div
                        key={st.skillName}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/30 border border-[var(--border-color)] text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--text-main)] truncate">
                            {st.skillName}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {st.attemptsCount} {st.attemptsCount === 1 ? 'attempt' : 'attempts'} • Latest: {st.latestScore}% • Best: {st.bestScore}%
                          </p>
                        </div>
                        <Button
                          to={`/quiz?skill=${encodeURIComponent(st.skillName)}`}
                          variant="secondary"
                          size="sm"
                          className="text-xs py-1 px-2 font-medium shrink-0"
                        >
                          Practise Again
                        </Button>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-[var(--text-muted)] italic">
                    Practice checkpoints confirm study retention and are capped at 60/100 standalone proficiency. Full career verification requires the comprehensive Diagnostic Assessment.
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-[var(--text-muted)]">
                    No practice quizzes attempted yet.
                  </p>
                  <Button to="/quiz" variant="primary" size="sm">
                    Start Practice Quiz
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* ===================================================================
              6. QUICK ACTIONS & LEARNING TOOLS
             =================================================================== */}
          <Card className="p-4 sm:p-5 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              Quick Learning Navigation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Link
                to="/roadmap"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-[var(--border-color)] transition-colors text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Milestone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-[var(--text-main)] truncate">Learning Roadmap</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Sequenced milestones</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 ml-1" />
              </Link>

              <Link
                to="/resources"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-[var(--border-color)] transition-colors text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-[var(--text-main)] truncate">Curated Resources</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Free guides &amp; docs</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 ml-1" />
              </Link>

              <Link
                to="/quiz"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-[var(--border-color)] transition-colors text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-[var(--text-main)] truncate">Practice Centre</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Check skill progress</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 ml-1" />
              </Link>
            </div>
          </Card>

          {/* ===================================================================
              7. ACCOUNT & PROFILE DETAILS (COLLAPSIBLE)
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

                {resumeData && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-[var(--border-color)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Active Resume</p>
                        <p className="font-medium text-[var(--text-main)]">{resumeData.originalFileName}</p>
                      </div>
                    </div>
                    <Button to="/resume" variant="secondary" size="sm" className="text-xs">
                      Update Resume
                    </Button>
                  </div>
                )}

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
