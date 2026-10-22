import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth, postAuth, patchAuth } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function RoadmapPage() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();

  const [roadmap, setRoadmap] = useState(null);
  const [resourcesData, setResourcesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Expanded state for milestone accordions
  const [expandedMilestones, setExpandedMilestones] = useState({ 1: true });

  // Fetch active roadmap and associated curated resources
  const fetchRoadmapAndResources = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [roadmapRes, resourcesRes] = await Promise.all([
        getAuth('/roadmap'),
        getAuth('/resources'),
      ]);

      if (roadmapRes.error) {
        setError(roadmapRes.error);
        setRoadmap(null);
      } else if (roadmapRes.data?.hasRoadmap && roadmapRes.data.roadmap) {
        const milestones = roadmapRes.data.roadmap.milestones || [];
        setRoadmap(roadmapRes.data.roadmap);

        // Check if navigated from deep-link with target skill
        const targetSkill = searchParams.get('skill');
        let matchedMilestone = null;

        if (targetSkill) {
          const normTarget = targetSkill.toLowerCase().replace(/[^a-z0-9]/g, '');
          matchedMilestone = milestones.find((m) => {
            const normSkill = (m.skillName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const normTitle = (m.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return normSkill === normTarget || normTitle.includes(normTarget) || normTarget.includes(normSkill);
          });
        }

        if (matchedMilestone) {
          setExpandedMilestones({ [matchedMilestone.order]: true });
          setTimeout(() => {
            const el = document.getElementById(`milestone-${matchedMilestone.order}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        } else {
          // Auto-expand first in-progress or not-started milestone
          const activeM =
            milestones.find((m) => m.status === 'in-progress') ||
            milestones.find((m) => m.status === 'not-started') ||
            milestones[0];
          if (activeM) {
            setExpandedMilestones({ [activeM.order]: true });
          }
        }
      } else {
        setRoadmap(null);
      }

      if (resourcesRes.data) {
        setResourcesData(resourcesRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch learning roadmap.');
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRoadmapAndResources();
  }, [fetchRoadmapAndResources, profile?.selectedCareerId]);

  // Generate or regenerate roadmap
  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await postAuth('/roadmap/generate');
      if (res.error) {
        setError(res.error);
      } else if (res.data?.roadmap) {
        setRoadmap(res.data.roadmap);
        setSuccessMessage('Your personalized roadmap has been generated successfully.');
        setExpandedMilestones({ 1: true });
        const resRes = await getAuth('/resources');
        if (resRes.data) setResourcesData(resRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  // Toggle milestone status (persisted to Firestore)
  const handleStatusChange = async (order, newStatus) => {
    setUpdatingOrder(order);
    try {
      const res = await patchAuth(`/roadmap/milestones/${order}`, { status: newStatus });
      if (res.data?.roadmap) {
        setRoadmap(res.data.roadmap);
        if (newStatus === 'in-progress') {
          setExpandedMilestones((prev) => ({ ...prev, [order]: true }));
        }
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to update milestone status.');
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Toggle individual topic completion (persisted to Firestore)
  const handleToggleTopic = async (order, topicIndex, currentCompleted) => {
    setUpdatingOrder(`${order}-${topicIndex}`);
    try {
      const res = await patchAuth(`/roadmap/milestones/${order}`, {
        topicIndex,
        topicCompleted: !currentCompleted,
      });
      if (res.data?.roadmap) {
        setRoadmap(res.data.roadmap);
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to update topic.');
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Toggle accordion expand
  const toggleMilestoneExpand = (order) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [order]: !prev[order],
    }));
  };

  // Primary action button handler on milestone card
  const handleMilestoneAction = (m) => {
    if (m.status === 'not-started') {
      handleStatusChange(m.order, 'in-progress');
    }
    setExpandedMilestones((prev) => ({ ...prev, [m.order]: true }));

    // Scroll card into view smoothly
    const el = document.getElementById(`milestone-${m.order}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Helper to extract resources for a milestone
  const getMilestoneResources = (order) => {
    if (!resourcesData?.milestonesWithResources) return [];
    const match = resourcesData.milestonesWithResources.find((m) => m.milestoneOrder === order);
    return match?.resources || [];
  };

  // Identify next recommended milestone using existing priority order
  const nextRecommendedMilestone =
    roadmap?.milestones?.find((m) => m.status === 'in-progress') ||
    roadmap?.milestones?.find((m) => m.status === 'not-started') ||
    roadmap?.milestones?.[0] ||
    null;

  // Single-sentence explanation of why the skill is recommended
  const getRecommendationReason = (m) => {
    if (!m) return '';
    if (m.status === 'in-progress') {
      return `You are currently studying ${m.skillName}—complete its next topic to advance toward your target ${m.requiredLevel}% benchmark proficiency.`;
    }
    if (m.order === 1) {
      return `${m.skillName} has your largest benchmark gap (Δ ${m.gap}), making it the most critical foundational skill to master first.`;
    }
    return `Step #${m.order} in your personalized curriculum to close your ${m.gapClassification.toLowerCase()} in ${m.skillName}.`;
  };

  return (
    <div className="relative py-8 sm:py-12 min-h-[75vh] overflow-hidden">
      {/* Soft Pastel Ambient Aura */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-100/35 via-violet-100/30 to-sky-100/35 dark:from-emerald-950/20 dark:via-purple-950/20 dark:to-sky-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container size="narrow">
        <div className="space-y-6">
          {/* ===================================================================
              PAGE HEADER
             =================================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-main)] font-heading">
                Your Learning Roadmap
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Step-by-step curriculum for{' '}
                <strong className="text-[var(--text-main)] font-semibold">
                  {profile?.selectedCareerId || 'your target career'}
                </strong>
                , prioritized to close your highest skill gaps first.
              </p>
            </div>

            {roadmap && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  pill
                  onClick={handleGenerateRoadmap}
                  disabled={generating}
                  className="text-xs"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Alert Messages */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="p-10 text-center border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-color)] mx-auto" />
              <p className="text-sm font-semibold text-[var(--text-main)]">
                Loading your roadmap...
              </p>
            </Card>
          )}

          {/* No Career State */}
          {!loading && !profile?.selectedCareerId && (
            <Card className="p-8 text-center border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-4">
              <Compass className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
              <div className="space-y-1">
                <h2 className="text-base font-bold text-[var(--text-main)]">
                  Select a Target Career First
                </h2>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  A personalized roadmap requires a career track to benchmark your skills.
                </p>
              </div>
              <Button to="/career" variant="primary" size="sm">
                Choose Career Goal
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Card>
          )}

          {/* Ready to Generate State */}
          {!loading && profile?.selectedCareerId && !roadmap && (
            <Card className="p-8 text-center border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-4">
              <Sparkles className="w-8 h-8 text-[var(--primary-color)] mx-auto" />
              <div className="space-y-1 max-w-md mx-auto">
                <h2 className="text-base font-bold text-[var(--text-main)]">
                  Ready to Build Your Learning Roadmap
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  We'll sequence your 5 benchmark milestones according to your largest skill gaps.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateRoadmap}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Generate My Roadmap
                  </>
                )}
              </Button>
            </Card>
          )}

          {/* ===================================================================
              ACTIVE ROADMAP JOURNEY
             =================================================================== */}
          {!loading && roadmap && (
            <div className="space-y-6">
              {/* 1. COMPACT "YOUR NEXT STEP" SECTION */}
              {nextRecommendedMilestone && (
                <Card className="p-4 sm:p-5 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-color)] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Your Next Step
                        </span>
                        <Badge
                          variant={nextRecommendedMilestone.status === 'in-progress' ? 'indigo' : 'neutral'}
                          className="text-[10px] py-0"
                        >
                          Step #{nextRecommendedMilestone.order}
                        </Badge>
                      </div>

                      <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                        {nextRecommendedMilestone.skillName}
                      </h2>

                      <p className="text-xs text-[var(--text-muted)] max-w-xl">
                        {getRecommendationReason(nextRecommendedMilestone)}
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMilestoneAction(nextRecommendedMilestone)}
                      className="shrink-0 self-start sm:self-center text-xs"
                    >
                      {nextRecommendedMilestone.status === 'in-progress'
                        ? 'Continue learning'
                        : 'Start learning'}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* 4. OVERALL ROADMAP PROGRESS BAR */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-main)]">
                    Roadmap Milestone Completion
                  </span>
                  <span className="font-mono font-bold text-[var(--primary-color)]">
                    {roadmap.summary.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--primary-color)] transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(roadmap.summary.progressPercentage > 0 ? 5 : 0, roadmap.summary.progressPercentage))}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>
                    {roadmap.summary.completedMilestones} of {roadmap.summary.totalMilestones} milestones completed
                  </span>
                  <span>Estimated duration: ~{roadmap.summary.totalEstimatedWeeks} weeks</span>
                </div>
              </div>

              {/* 2 & 3. CLEAR MILESTONE CARDS WITH GUIDED INTERACTION */}
              <div className="space-y-3">
                {roadmap.milestones.map((m) => {
                  const isCompleted = m.status === 'completed';
                  const isInProgress = m.status === 'in-progress';
                  const isExpanded = !!expandedMilestones[m.order];
                  const isUpdating = updatingOrder === m.order;
                  const milestoneResources = getMilestoneResources(m.order);
                  const completedTopicsCount = m.topics?.filter((t) => t.completed).length || 0;
                  const totalTopicsCount = m.topics?.length || 0;
                  const topicPercentage =
                    totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

                  // Find index of first uncompleted topic (the "Up Next" topic)
                  const nextTopicIndex = m.topics?.findIndex((t) => !t.completed);

                  return (
                    <Card
                      id={`milestone-${m.order}`}
                      key={m.order}
                      className={`p-4 sm:p-5 transition-all border ${
                        isCompleted
                          ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800'
                          : isInProgress
                          ? 'bg-[var(--surface-color)] border-[var(--primary-color)]/60 ring-1 ring-[var(--primary-color)]/20 shadow-xs'
                          : 'bg-[var(--surface-color)] border-[var(--border-color)] shadow-xs'
                      } space-y-3`}
                    >
                      {/* Top Row: Step Number, Skill Name, Status & Priority */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          {/* Step Number Badge */}
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : isInProgress
                                ? 'bg-[var(--primary-color)] text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : `#${m.order}`}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                                {m.skillName}
                              </h3>

                              {/* Priority Indicator */}
                              <Badge
                                variant={
                                  m.gapClassification === 'High Gap'
                                    ? 'warning'
                                    : m.gapClassification === 'Medium Gap'
                                    ? 'indigo'
                                    : 'success'
                                }
                                className="text-[10px] py-0"
                              >
                                {m.gapClassification}
                              </Badge>

                              {/* Concise Status Indicator */}
                              <Badge
                                variant={isCompleted ? 'success' : isInProgress ? 'indigo' : 'neutral'}
                                className="text-[10px] py-0 capitalize"
                              >
                                {m.status.replace('-', ' ')}
                              </Badge>
                            </div>

                            {/* Distinct Labels: Current Proficiency & Target Benchmark */}
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] flex-wrap">
                              <span>
                                Current proficiency:{' '}
                                {m.currentLevel !== null ? (
                                  <strong className="text-[var(--text-main)] font-semibold">
                                    {m.currentLevel}%
                                  </strong>
                                ) : (
                                  <span className="text-amber-700 dark:text-amber-400 font-medium">
                                    Not yet measured
                                  </span>
                                )}
                              </span>
                              <span>•</span>
                              <span>
                                Target benchmark:{' '}
                                <strong className="text-[var(--text-main)] font-semibold">
                                  {m.requiredLevel}%
                                </strong>
                              </span>
                              {m.estimatedDuration && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                                    <span>{m.estimatedDuration}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Dropdown & Primary Learning Action */}
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          <select
                            aria-label={`Milestone #${m.order} status`}
                            value={m.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(m.order, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-md border focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] transition-colors cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                : isInProgress
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                                : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                          >
                            <option value="not-started">Not started</option>
                            <option value="in-progress">In progress</option>
                            <option value="completed">Completed</option>
                          </select>

                          <Link
                            to={`/quiz?skill=${encodeURIComponent(m.skillName)}`}
                            className="inline-flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-main)] hover:bg-[var(--surface-elevated)] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-[var(--primary-color)]" />
                            <span>Practice Quiz</span>
                          </Link>

                          <Button
                            variant={isCompleted ? 'secondary' : 'primary'}
                            size="sm"
                            className="text-xs py-1 px-3 font-semibold"
                            onClick={() => handleMilestoneAction(m)}
                          >
                            {isCompleted
                              ? 'Review topics'
                              : isInProgress
                              ? 'Continue learning'
                              : 'Start learning'}
                          </Button>
                        </div>
                      </div>

                      {/* What you'll learn */}
                      <div className="space-y-0.5 pt-0.5">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          What you'll learn
                        </span>
                        <p className="text-xs text-[var(--text-main)] leading-relaxed">
                          {m.learningObjective}
                        </p>
                      </div>

                      {/* Collapsible Topics and Resources Control */}
                      <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleMilestoneExpand(m.order)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-color)] hover:underline focus:outline-none"
                        >
                          <span>
                            {isExpanded
                              ? 'Hide topics & resources'
                              : `Topics & resources (${completedTopicsCount}/${totalTopicsCount} topics • ${milestoneResources.length} resources)`}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <span className="text-[11px] text-[var(--text-muted)] font-mono">
                          {totalTopicsCount > 0 ? `${topicPercentage}% topics completed` : ''}
                        </span>
                      </div>

                      {/* Expanded Curriculum Topics & Curated Resources */}
                      {isExpanded && (
                        <div className="pt-3 space-y-4 border-t border-[var(--border-color)]">
                          {/* Topic Checklist */}
                          {m.topics && m.topics.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                                  Curriculum Topics
                                </p>
                                <span className="text-[11px] text-[var(--text-muted)]">
                                  Click checkmark to record completion
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {m.topics.map((topic, topicIdx) => {
                                  const isTopicUpdating = updatingOrder === `${m.order}-${topicIdx}`;
                                  const isUpNext = !topic.completed && topicIdx === nextTopicIndex;

                                  return (
                                    <button
                                      key={topic.title}
                                      type="button"
                                      onClick={() =>
                                        handleToggleTopic(m.order, topicIdx, topic.completed)
                                      }
                                      disabled={isTopicUpdating}
                                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-start gap-2.5 ${
                                        topic.completed
                                          ? 'bg-slate-50 dark:bg-slate-800/40 border-[var(--border-color)] text-[var(--text-muted)]'
                                          : isUpNext
                                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700/60 text-[var(--text-main)]'
                                          : 'bg-white dark:bg-slate-800 border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--primary-color)]/40'
                                      }`}
                                    >
                                      <div className="mt-0.5 shrink-0 text-[var(--primary-color)]">
                                        {isTopicUpdating ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : topic.completed ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                          <Circle className="w-3.5 h-3.5 text-slate-400" />
                                        )}
                                      </div>

                                      <div className="min-w-0 flex-1 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <p
                                            className={`font-semibold ${
                                              topic.completed
                                                ? 'line-through text-[var(--text-muted)]'
                                                : ''
                                            }`}
                                          >
                                            {topic.title}
                                          </p>
                                          {isUpNext && (
                                            <Badge
                                              variant="indigo"
                                              className="text-[9px] py-0 px-1.5 font-bold"
                                            >
                                              Up Next
                                            </Badge>
                                          )}
                                        </div>

                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                                          {topic.description}
                                        </p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Curated Resources List */}
                          <div className="space-y-2 pt-1">
                            <p className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[var(--primary-color)]" />
                              <span>Recommended Learning Materials</span>
                            </p>

                            {milestoneResources.length === 0 ? (
                              <p className="text-xs text-[var(--text-muted)] italic">
                                Resources for this skill can be explored in the resource library.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {milestoneResources.map((res) => (
                                  <div
                                    key={res.id}
                                    className="p-3 rounded-lg border border-[var(--border-color)] bg-white dark:bg-slate-800 flex flex-col justify-between space-y-2"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[10px]">
                                        <Badge
                                          variant="indigo"
                                          className="capitalize py-0 px-1.5 text-[9px]"
                                        >
                                          {res.level}
                                        </Badge>
                                        <span className="text-[var(--text-muted)] font-medium">
                                          {res.provider}
                                        </span>
                                      </div>
                                      <h4 className="text-xs font-bold text-[var(--text-main)] line-clamp-1">
                                        {res.title}
                                      </h4>
                                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                                        {res.description}
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-color)]/60">
                                      <span>Est: {res.estimatedTime}</span>
                                      <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary-color)] hover:underline"
                                      >
                                        Study
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Bottom Navigation */}
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <span className="text-[var(--text-muted)]">
                  Progress is saved automatically to your profile in Cloud Firestore.
                </span>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button to="/resources" variant="secondary" size="sm" className="text-xs">
                    Browse Resource Library
                  </Button>
                  <Button to="/dashboard" variant="secondary" size="sm" className="text-xs">
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
