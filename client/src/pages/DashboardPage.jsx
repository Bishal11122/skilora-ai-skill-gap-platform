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
  Activity,
  Layers,
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

  // Authenticated Dashboard Analytics State
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
    <div className="py-8 sm:py-10 min-h-[80vh]">
      <Container size="default">
        <div className="space-y-6">
          {/* ===================================================================
              1. EXECUTIVE HEADER: GREETING & ROLE CONTEXT
             =================================================================== */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
                  Welcome back, {profile?.displayName || user?.displayName || 'Learner'}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] flex items-center gap-1.5 flex-wrap">
                <span>Target Career Benchmark:</span>
                {hasCareer ? (
                  <span className="inline-flex items-center gap-1.5">
                    <strong className="text-[var(--text-main)] font-semibold">
                      {careerName}
                    </strong>
                    <Link
                      to="/career"
                      className="text-xs text-[var(--primary-color)] hover:underline font-semibold ml-1"
                      title="Change target career"
                    >
                      Change
                    </Link>
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">None selected</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
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
                to="/settings"
                variant="secondary"
                size="sm"
                className="text-xs text-[var(--text-muted)]"
              >
                <User className="w-3.5 h-3.5 mr-1" />
                Settings
              </Button>
            </div>
          </div>

          {/* Error Banner */}
          {analyticsError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{analyticsError}</span>
            </div>
          )}

          {/* ===================================================================
              2. GUIDED NEXT ACTION CARD
             =================================================================== */}
          {nextAction && (
            <div className="rounded-2xl glass-panel border border-[var(--primary-color)]/30 p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] shadow-2xs">
                      {nextAction.type === 'SELECT_CAREER' && <Compass className="w-4 h-4" />}
                      {nextAction.type === 'INITIAL_EVALUATION' && <Sparkles className="w-4 h-4" />}
                      {nextAction.type === 'GENERATE_ROADMAP' && <Milestone className="w-4 h-4" />}
                      {nextAction.type === 'CONTINUE_LEARNING' && <Target className="w-4 h-4" />}
                      {nextAction.type === 'ALL_COMPLETE' && <Award className="w-4 h-4 text-emerald-500" />}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-color)] font-mono">
                      RECOMMENDED NEXT ACTION
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                    {nextAction.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                    {nextAction.description}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <Button to={nextAction.actionUrl} variant="primary" size="md" pill>
                    {nextAction.actionText}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                  {nextAction.secondaryActionText && (
                    <Button to={nextAction.secondaryActionUrl} variant="secondary" size="md" pill>
                      {nextAction.secondaryActionText}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              3. 4 EXECUTIVE ANALYTICS METRIC CARDS
             =================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Career Readiness */}
            <Card hover className="p-5 rounded-2xl border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5 uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                    Career Readiness
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--pastel-lavender)] text-[var(--pastel-lavender-text)] border border-[var(--pastel-lavender-border)]">
                    Target: 80%
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-[var(--text-main)] tabular-nums">
                    {loadingAnalytics ? '—' : `${readiness}%`}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">overall match</span>
                </div>
                <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(readiness > 0 ? 5 : 0, readiness))}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Benchmark Met:</span>
                <span className="text-emerald-500 font-semibold tabular-nums">
                  {skillsSummary.atBenchmarkCount} of {skillsSummary.totalBenchmarkSkills} skills
                </span>
              </div>
            </Card>

            {/* Metric 2: Benchmark Skills Breakdown */}
            <Card hover className="p-5 rounded-2xl border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5 uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  Skill Gap Breakdown
                </span>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">At Benchmark (&ge;80%):</span>
                    <span className="font-semibold text-emerald-500 tabular-nums">
                      {skillsSummary.atBenchmarkCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Identified Gaps:</span>
                    <span className="font-semibold text-amber-500 tabular-nums">
                      {skillsSummary.remainingGapsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Not Yet Assessed:</span>
                    <span className="font-semibold text-[var(--text-muted)] tabular-nums">
                      {skillsSummary.notAssessedCount}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] truncate">
                Role: <strong>{careerName}</strong>
              </div>
            </Card>

            {/* Metric 3: Learning Roadmap Progress */}
            <Card hover className="p-5 rounded-2xl border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5 uppercase tracking-wider">
                    <Milestone className="w-3.5 h-3.5 text-emerald-500" />
                    Roadmap Mastery
                  </span>
                  <span className="text-sm font-bold text-[var(--text-main)] tabular-nums">
                    {roadmapProgress.hasRoadmap ? `${roadmapProgress.topicsCompletionPercentage}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden mt-3">
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
              <div className="pt-2 border-t border-[var(--border-color)] space-y-1 text-xs text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>Milestones:</span>
                  <strong className="text-[var(--text-main)] tabular-nums">
                    {roadmapProgress.completedMilestones}/{roadmapProgress.totalMilestones} done
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Topics Covered:</span>
                  <strong className="text-[var(--text-main)] tabular-nums">
                    {roadmapProgress.completedTopics}/{roadmapProgress.totalTopics}
                  </strong>
                </div>
              </div>
            </Card>

            {/* Metric 4: Diagnostic & Verification */}
            <Card hover className="p-5 rounded-2xl border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  Verification Status
                </span>
                <div className="mt-3">
                  {diagnostic.isCompleted ? (
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--pastel-mint)] text-[var(--pastel-mint-text)] border border-[var(--pastel-mint-border)]">
                        <CheckCircle2 className="w-3 h-3" />
                        Diagnostic Certified
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {diagnostic.assessedSkillsCount} competencies verified
                        {diagnostic.averageDiagnosticScore !== null && ` (${diagnostic.averageDiagnosticScore}% avg)`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--pastel-peach)] text-[var(--pastel-peach-text)] border border-[var(--pastel-peach-border)]">
                        <AlertCircle className="w-3 h-3" />
                        Diagnostic Pending
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Complete diagnostic to certify baseline
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Practice Checkpoints:</span>
                <strong className="text-[var(--text-main)] tabular-nums">
                  {practiceStats.totalAttempts} {practiceStats.totalAttempts === 1 ? 'attempt' : 'attempts'}
                </strong>
              </div>
            </Card>
          </div>

          {/* ===================================================================
              4. SKILL GAP MATRIX TABLE & COMPARATIVE VISUALIZATION
             =================================================================== */}
          <Card className="p-6 rounded-2xl border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                    Skill Gap Diagnostic Matrix
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                    Benchmark: 80% Required
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Verified proficiency mapped against canonical expectations for {careerName}.
                </p>
              </div>

              {loadingAnalytics && (
                <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary-color)]" />
                  Syncing analytics...
                </div>
              )}
            </div>

            {!hasCareer ? (
              <div className="py-12 text-center space-y-3">
                <Compass className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
                <p className="text-sm text-[var(--text-muted)]">
                  Please select a target career track to view your benchmark skill gaps.
                </p>
                <Button to="/career" variant="primary" size="sm">
                  Choose Target Career
                </Button>
              </div>
            ) : skillGaps.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                No skill gap data recorded. Complete your resume analysis or diagnostic assessment to populate.
              </div>
            ) : (
              <div className="space-y-4">
                {/* List of Skills with Visual Target Bars */}
                <div className="space-y-3">
                  {skillGaps.map((skill) => {
                    const hasScore = skill.hasEvidence && skill.currentLevel !== null;
                    const level = hasScore ? skill.currentLevel : 0;
                    const isAtBenchmark = skill.gap <= 0;

                    let barColor = 'bg-emerald-500';
                    if (!hasScore) {
                      barColor = 'bg-slate-300 dark:bg-slate-700';
                    } else if (skill.classificationCode === 'high') {
                      barColor = 'bg-rose-500';
                    } else if (skill.classificationCode === 'medium') {
                      barColor = 'bg-amber-500';
                    }

                    return (
                      <div
                        key={skill.name}
                        className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-[var(--surface-elevated)] transition-colors space-y-3"
                      >
                        {/* Skill Row Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[var(--text-main)]">
                              {skill.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                              {skill.category}
                            </span>
                            {skill.priorityRank === 1 && skill.gap > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <Zap className="w-3 h-3" />
                                Priority #1 Gap
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Evidence source badge */}
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              {skill.evidenceSource === 'assessment-verified' && 'Diagnostic Verified'}
                              {skill.evidenceSource === 'practice-checkpoint' && 'Practice Checkpoint'}
                              {skill.evidenceSource === 'resume-inferred' && 'Resume Inferred'}
                              {skill.evidenceSource === 'none' && 'Not Yet Assessed'}
                            </span>

                            {/* Gap Classification Badge */}
                            {isAtBenchmark ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Benchmark Met
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  skill.classificationCode === 'high'
                                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                }`}
                              >
                                {skill.classification} ({skill.gap}% gap)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Benchmark Bar with Target 80 Marker */}
                        <div className="space-y-1">
                          <div className="relative w-full bg-[var(--surface-elevated)] h-2.5 rounded-full overflow-hidden">
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
                            <span className="tabular-nums">
                              Current:{' '}
                              {hasScore ? (
                                <strong className="text-[var(--text-main)] font-semibold">{skill.currentLevel}%</strong>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">0% (Unassessed)</span>
                              )}
                            </span>
                            <span className="font-mono text-[10px]">
                              Required Target: <strong className="text-[var(--text-main)]">80%</strong>
                            </span>
                          </div>
                        </div>

                        {/* Inline Actions */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <p className="text-[11px] text-[var(--text-muted)] truncate max-w-md hidden sm:block">
                            {skill.explanation}
                          </p>

                          <div className="flex items-center gap-2 shrink-0 ml-auto">
                            <Button
                              to={`/roadmap?skill=${encodeURIComponent(skill.name)}`}
                              variant="secondary"
                              size="xs"
                              className="text-xs"
                            >
                              View in Roadmap
                            </Button>
                            {skill.gap > 0 && (
                              <Button
                                to={`/quiz?skill=${encodeURIComponent(skill.name)}`}
                                variant="primary"
                                size="xs"
                                className="text-xs"
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

                {/* Collapsible: Non-benchmark Skills */}
                {otherExtractedSkills.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => setShowOtherSkills(!showOtherSkills)}
                      className="w-full flex items-center justify-between text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] py-1.5 cursor-pointer"
                    >
                      <span className="font-medium">
                        Additional Extracted Skills ({otherExtractedSkills.length}) — Non-benchmark for {careerName}
                      </span>
                      {showOtherSkills ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showOtherSkills && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {otherExtractedSkills.map((s) => (
                          <span
                            key={s.name}
                            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-muted)]"
                          >
                            <span className="font-semibold text-[var(--text-main)]">{s.name}</span>
                            <span className="text-[var(--text-muted)]">•</span>
                            <span className="tabular-nums">{s.level}%</span>
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
              5. ROADMAP MASTER & PRACTICE PANELS
             =================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Roadmap Status Panel */}
            <Card className="p-5 sm:p-6 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Milestone className="w-4 h-4 text-[var(--primary-color)]" />
                  <h3 className="text-sm font-bold text-[var(--text-main)]">
                    Active Roadmap Progress
                  </h3>
                </div>
                <Link
                  to="/roadmap"
                  className="text-xs text-[var(--primary-color)] hover:underline font-semibold"
                >
                  Open Full Roadmap &rarr;
                </Link>
              </div>

              {roadmapProgress.hasRoadmap ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                      <p className="text-[10px] text-[var(--text-muted)] font-medium">Completed</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {roadmapProgress.completedMilestones}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                      <p className="text-[10px] text-[var(--text-muted)] font-medium">In Progress</p>
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {roadmapProgress.inProgressMilestones}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                      <p className="text-[10px] text-[var(--text-muted)] font-medium">Not Started</p>
                      <p className="text-lg font-bold text-[var(--text-muted)] tabular-nums">
                        {roadmapProgress.notStartedMilestones}
                      </p>
                    </div>
                  </div>

                  {roadmapProgress.activeMilestone && (
                    <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                          CURRENT FOCUS
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                          Milestone #{roadmapProgress.activeMilestone.order}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-[var(--text-main)]">
                        {roadmapProgress.activeMilestone.skillName}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {roadmapProgress.activeMilestone.learningObjective}
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <Button
                          to={`/roadmap?skill=${encodeURIComponent(roadmapProgress.activeMilestone.skillName)}`}
                          variant="primary"
                          size="xs"
                        >
                          Continue Milestone
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                        <Button
                          to="/resources"
                          variant="secondary"
                          size="xs"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          View Resources
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-[var(--text-muted)]">
                    No active roadmap generated for {careerName}.
                  </p>
                  <Button to="/roadmap" variant="primary" size="sm">
                    Generate Learning Roadmap
                  </Button>
                </div>
              )}
            </Card>

            {/* Practice Retention Panel */}
            <Card className="p-5 sm:p-6 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-[var(--text-main)]">
                    Practice Quizzes &amp; Checkpoints
                  </h3>
                </div>
                <Link
                  to="/quiz"
                  className="text-xs text-[var(--primary-color)] hover:underline font-semibold"
                >
                  Practice Hub &rarr;
                </Link>
              </div>

              {practiceStats.totalAttempts > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                      <p className="text-[10px] text-[var(--text-muted)]">Attempts</p>
                      <p className="text-lg font-bold text-[var(--text-main)] tabular-nums">
                        {practiceStats.totalAttempts}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                      <p className="text-[10px] text-[var(--text-muted)]">Best Score</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {practiceStats.bestOverallScore !== null ? `${practiceStats.bestOverallScore}%` : '—'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                      <p className="text-[10px] text-[var(--text-muted)]">Latest Average</p>
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {practiceStats.averageLatestScore !== null ? `${practiceStats.averageLatestScore}%` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Practiced Skills List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {practiceStats.skillStats.map((st) => (
                      <div
                        key={st.skillName}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--text-main)] truncate">
                            {st.skillName}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] tabular-nums">
                            {st.attemptsCount} {st.attemptsCount === 1 ? 'attempt' : 'attempts'} • Latest: {st.latestScore}% • Best: {st.bestScore}%
                          </p>
                        </div>
                        <Button
                          to={`/quiz?skill=${encodeURIComponent(st.skillName)}`}
                          variant="secondary"
                          size="xs"
                          className="shrink-0"
                        >
                          Practise
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-[var(--text-muted)]">
                    No practice quizzes taken yet. Test your gaps with targeted quizzes.
                  </p>
                  <Button to="/quiz" variant="primary" size="sm">
                    Start Skill Practice
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* ===================================================================
              6. QUICK LEARNING TOOLS ROW
             =================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/roadmap"
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] hover:border-[var(--primary-color)]/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Milestone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-main)]">Learning Roadmap</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Sequenced milestones</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>

            <Link
              to="/resources"
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] hover:border-[var(--primary-color)]/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-main)]">Curated Resources</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Docs &amp; video courses</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>

            <Link
              to="/quiz"
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] hover:border-[var(--primary-color)]/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-main)]">Practice Quizzes</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Check gap retention</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
