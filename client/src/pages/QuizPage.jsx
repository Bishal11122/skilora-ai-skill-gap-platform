import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  BookOpen,
  Milestone,
  ExternalLink,
  Info,
  Compass,
  GraduationCap,
  TrendingUp,
  Target,
  Award,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth, postAuth } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function QuizPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { skillName: paramSkill } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(paramSkill || searchParams.get('skill') || '');
  const [viewState, setViewState] = useState('select'); // 'select' | 'active' | 'submitting' | 'results'
  const [error, setError] = useState(null);

  // Active quiz session state
  const [attemptId, setAttemptId] = useState(null);
  const [quizMeta, setQuizMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOption }
  const [isStarting, setIsStarting] = useState(false);

  // Results state
  const [resultData, setResultData] = useState(null);

  // Ref to track latest active career ID to discard stale in-flight requests
  const activeCareerRef = useRef(profile?.selectedCareerId);
  useEffect(() => {
    activeCareerRef.current = profile?.selectedCareerId;
  }, [profile?.selectedCareerId]);

  // Load user's personalized practice eligibility from backend
  const loadEligibility = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuth('/quiz/skills');

      // Stale response protection: if user switched career while request was in-flight, discard it
      if (
        activeCareerRef.current &&
        res.data?.careerId &&
        res.data.careerId !== activeCareerRef.current
      ) {
        return;
      }

      if (res.error) {
        setError(res.error);
        setEligibilityData(null);
      } else if (res.data) {
        setEligibilityData(res.data);
        const eligible = res.data.eligibleSkills || [];

        // Synchronise selectedSkill: ensure it strictly belongs to current career's eligible skills
        setSelectedSkill((prev) => {
          const urlSkill = paramSkill || searchParams.get('skill');
          const candidate = urlSkill || prev;
          if (candidate) {
            const matched = eligible.find(
              (s) => s.skillName.toLowerCase() === candidate.toLowerCase()
            );
            if (matched) return matched.skillName;
          }
          // Reset to first eligible skill in new career, or empty string if no positive gaps
          return eligible.length > 0 ? eligible[0].skillName : '';
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch practice eligibility');
      setEligibilityData(null);
    } finally {
      setLoading(false);
    }
  }, [paramSkill, searchParams]);

  useEffect(() => {
    loadEligibility();
  }, [loadEligibility, profile?.selectedCareerId]);

  // Sync skill from URL if changed
  useEffect(() => {
    const fromUrl = paramSkill || searchParams.get('skill');
    if (fromUrl && fromUrl !== selectedSkill) {
      setSelectedSkill(fromUrl);
    }
  }, [paramSkill, searchParams, selectedSkill]);

  const eligibleSkills = eligibilityData?.eligibleSkills || [];
  const benchmarkMetSkills = eligibilityData?.benchmarkMetSkills || [];
  const careerName = eligibilityData?.careerName || 'Target Career';

  // Active skill for guidance panel (strictly from current career's eligible skills)
  const activeGuidanceSkill =
    eligibleSkills.find(
      (s) => s.skillName.toLowerCase() === (selectedSkill || '').toLowerCase()
    ) || eligibleSkills[0] || null;

  // Start a new quiz attempt (server enforces eligibility dynamically)
  const handleStartQuiz = async (skillToStart = activeGuidanceSkill?.skillName || selectedSkill) => {
    if (!skillToStart) return;

    setIsStarting(true);
    setError(null);
    try {
      const res = await postAuth('/quiz/start', {
        skillName: skillToStart,
      });

      if (res.error) {
        setError(res.error);
        setIsStarting(false);
        return;
      }

      const data = res.data;
      setAttemptId(data.attemptId);
      setQuizMeta({
        skillName: data.skillName,
        category: data.category,
        careerName: data.careerName,
        topic: data.topic,
        totalQuestions: data.totalQuestions,
        source: data.source,
      });
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setAnswers({});
      setViewState('active');
      setSelectedSkill(data.skillName);
      setSearchParams({ skill: data.skillName });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize practice quiz');
    } finally {
      setIsStarting(false);
    }
  };

  // Option selection
  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!attemptId || questions.length === 0) return;

    setViewState('submitting');
    setError(null);

    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] !== undefined ? answers[q.id] : -1,
    }));

    try {
      const res = await postAuth('/quiz/submit', {
        attemptId,
        answers: formattedAnswers,
      });

      if (res.error) {
        setError(res.error);
        setViewState('active');
        return;
      }

      setResultData(res.data);
      setViewState('results');
      // Refresh eligibility list to reflect practice statistics
      loadEligibility();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit practice quiz');
      setViewState('active');
    }
  };

  // Reset to catalog selection view
  const handleBackToCatalog = () => {
    setViewState('select');
    setResultData(null);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setAttemptId(null);
  };

  // Calculate answered count
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="relative py-8 sm:py-10 min-h-[80vh] transition-colors overflow-hidden">
      {/* Soft Pastel Ambient Aura */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-100/35 via-violet-100/30 to-sky-100/35 dark:from-emerald-950/20 dark:via-purple-950/20 dark:to-sky-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Link to="/roadmap" className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1">
              <Milestone className="w-3.5 h-3.5 text-[var(--primary-color)]" />
              <span>Roadmap</span>
            </Link>
            <span>/</span>
            <Link to="/resources" className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Resources</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[var(--text-main)]">Practice Centre</span>
          </div>

          {viewState !== 'select' && (
            <button
              onClick={handleBackToCatalog}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Skill Gaps
            </button>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to complete request</p>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
            <button
              onClick={loadEligibility}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline shrink-0 mt-0.5"
            >
              Retry
            </button>
          </div>
        )}

        {/* =========================================================================
            VIEW 1: Skill-Gap Practice Centre Catalog
           ========================================================================= */}
        {viewState === 'select' && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)] mb-3" />
                <p className="text-sm">Loading your personalized practice centre...</p>
              </div>
            ) : eligibilityData?.emptyReason === 'NO_CAREER_SELECTED' ? (
              /* Empty State A: No Career Selected */
              <Card className="max-w-xl mx-auto p-8 text-center bg-[var(--surface-color)] border-[var(--border-color)] shadow-xs rounded-xl space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-[var(--text-main)]">Select a Target Career Path First</h2>
                  <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                    Practice quizzes in Skillora AI are personalized directly to your chosen career benchmark and identified skill gaps.
                    Select your target career path to unlock tailored learning and practice quizzes.
                  </p>
                </div>
                <Button to="/career" variant="primary" size="md" className="text-xs font-semibold">
                  Choose Career Path
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Card>
            ) : eligibilityData?.emptyReason === 'ALL_GAPS_RESOLVED' ? (
              /* Empty State B: All Benchmark Targets Met */
              <Card className="max-w-xl mx-auto p-8 text-center bg-[var(--surface-color)] border-[var(--border-color)] shadow-xs rounded-xl space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-[var(--text-main)]">All Career Benchmark Targets Met!</h2>
                  <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                    All skills for <strong>{careerName}</strong> have reached or exceeded the required benchmark level.
                    Take the comprehensive career-wide Diagnostic Assessment to verify your mastery, or explore advanced topics on your roadmap.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Button to="/roadmap" variant="secondary" size="sm" className="text-xs font-semibold">
                    <Milestone className="w-3.5 h-3.5 mr-1.5 text-[var(--primary-color)]" />
                    Review Roadmap
                  </Button>
                  <Button to="/assessment" variant="primary" size="sm" className="text-xs font-semibold">
                    <Compass className="w-3.5 h-3.5 mr-1.5" />
                    Take Diagnostic Assessment
                  </Button>
                </div>
              </Card>
            ) : (
              /* Main Guided Practice Experience */
              <div className="space-y-6">
                {/* Page Heading & Career Scope */}
                <div className="max-w-3xl space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-color)] bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 px-2.5 py-0.5 rounded-md font-mono">
                      {careerName} Benchmark
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-medium">Practice Centre</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
                    Targeted Skill-Gap Practice Centre
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    Study your roadmap topics, check curated documentation, and validate retention with 5-question targeted quizzes.
                  </p>
                </div>

                {/* Learn Before You Practise Guidance Panel */}
                <Card className="p-5 sm:p-6 bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xs rounded-xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center font-bold text-xs">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <h2 className="text-sm font-bold text-[var(--text-main)]">
                          Recommended Learning Workflow
                        </h2>
                        {activeGuidanceSkill && (
                          <span className="text-[11px] font-semibold text-[var(--primary-color)] bg-[var(--primary-color)]/10 px-2 py-0.5 rounded">
                            Target: {activeGuidanceSkill.skillName}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        To build genuine capability before attempting practice checks:
                      </p>

                      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-main)]">
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[var(--surface-elevated)] text-[var(--text-muted)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                            1
                          </span>
                          <span>Open roadmap milestone for your target skill</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[var(--surface-elevated)] text-[var(--text-muted)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                            2
                          </span>
                          <span>Study curated topics &amp; open resources</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[var(--surface-elevated)] text-[var(--text-muted)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                            3
                          </span>
                          <span>Take the 5-question practice quiz</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[var(--surface-elevated)] text-[var(--text-muted)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                            4
                          </span>
                          <span>Review rationale &amp; retry when ready</span>
                        </li>
                      </ol>
                    </div>

                    {/* Quick Guidance Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                      <Button
                        to={`/roadmap?skill=${encodeURIComponent(activeGuidanceSkill?.skillName || '')}`}
                        variant="secondary"
                        size="xs"
                        className="text-xs font-semibold justify-center"
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[var(--primary-color)]" />
                        Open Roadmap Topics
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        disabled={isStarting || !activeGuidanceSkill}
                        onClick={() => handleStartQuiz(activeGuidanceSkill?.skillName)}
                        className="text-xs font-semibold justify-center"
                      >
                        {isStarting && selectedSkill === activeGuidanceSkill?.skillName ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            Starting Quiz...
                          </>
                        ) : (
                          <>
                            Start Practice Quiz
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* =========================================================================
                    SECTION A: Skills to Improve (Every positive-gap skill)
                   ========================================================================= */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-[var(--border-color)] pb-2">
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                        <Target className="w-4 h-4 text-rose-500" />
                        Skills to Improve ({eligibleSkills.length})
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        All career benchmark skills with remaining gaps. Resume evidence is not required to unlock practice.
                      </p>
                    </div>
                  </div>

                  {eligibleSkills.length === 0 ? (
                    <Card className="p-8 text-center bg-[var(--surface-color)] border-[var(--border-color)]">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-[var(--text-main)]">No Positive Skill Gaps Identified</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                        All skills for your selected career have met their benchmark target.
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eligibleSkills.map((skill) => {
                        const isCurrentSelected =
                          selectedSkill.toLowerCase() === skill.skillName.toLowerCase();
                        const practice = skill.practiceStats;
                        const hasEvidence = skill.hasEvidence;

                        return (
                          <Card
                            key={skill.skillName}
                            onClick={() => setSelectedSkill(skill.skillName)}
                            className={`flex flex-col justify-between p-5 transition-all duration-150 rounded-xl cursor-pointer ${
                              isCurrentSelected
                                ? 'border-[var(--primary-color)] ring-2 ring-[var(--focus-ring)] bg-[var(--primary-color)]/5 shadow-xs'
                                : 'hover:border-[var(--text-muted)]/40 bg-[var(--surface-color)] shadow-xs'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Top Row: Skill Name & Gap Severity Badge */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-bold text-[var(--text-main)] text-base leading-tight">
                                    {skill.skillName}
                                  </h3>
                                  <span className="text-[11px] text-[var(--text-muted)] font-medium">{skill.category}</span>
                                </div>
                                <Badge
                                  variant={
                                    skill.gapClassification === 'High Gap'
                                      ? 'danger'
                                      : skill.gapClassification === 'Medium Gap'
                                      ? 'warning'
                                      : 'success'
                                  }
                                  className="text-[10px] py-0.5 px-2 font-bold shrink-0"
                                >
                                  {skill.gapClassification}
                                </Badge>
                              </div>

                              {/* Proficiency & Benchmark Points */}
                              <div className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[var(--text-muted)]">Current proficiency:</span>
                                  <span className={`font-semibold tabular-nums ${hasEvidence ? 'text-[var(--text-main)]' : 'text-amber-500 italic font-medium'}`}>
                                    {skill.proficiencyDisplay}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[var(--text-muted)]">Benchmark target:</span>
                                  <span className="font-semibold tabular-nums text-[var(--text-main)]">{skill.requiredLevel} pts</span>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)] text-[11px]">
                                  <span className="text-[var(--text-muted)]">Remaining gap:</span>
                                  <span className="font-bold tabular-nums text-rose-500">-{skill.gap} pts</span>
                                </div>
                              </div>

                              {/* Learning Status & Latest Quiz Attempt */}
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-[var(--text-muted)]">Status:</span>
                                  <span
                                    className={`px-2 py-0.5 rounded font-medium ${
                                      skill.learningStatus === 'Improving'
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : skill.learningStatus === 'Ready to practise'
                                        ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20'
                                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    }`}
                                  >
                                    {skill.learningStatus}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] pt-1">
                                  <span className="text-[var(--text-muted)]">Practice history:</span>
                                  {practice?.attemptsCount > 0 ? (
                                    <span className="font-semibold tabular-nums text-[var(--text-main)]">
                                      Latest: {practice.latestScore}% ({practice.attemptsCount} attempt{practice.attemptsCount > 1 ? 's' : ''})
                                    </span>
                                  ) : (
                                    <span className="text-[var(--text-muted)]">No attempts yet</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Dual Differentiated Actions */}
                            <div className="pt-4 mt-3 flex items-center gap-2 border-t border-[var(--border-color)]">
                              {/* 1. Learn This Skill */}
                              <Link
                                to={`/roadmap?skill=${encodeURIComponent(skill.skillName)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 text-center py-1.5 px-2 rounded-lg text-xs font-semibold text-[var(--text-main)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated)]/80 border border-[var(--border-color)] transition-colors"
                              >
                                Learn This Skill
                              </Link>

                              {/* 2. Practice Quiz */}
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={isStarting}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartQuiz(skill.skillName);
                                }}
                                className="flex-1 text-xs font-semibold justify-center shadow-xs"
                              >
                                {isStarting && selectedSkill === skill.skillName ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                    Starting...
                                  </>
                                ) : practice?.attemptsCount > 0 ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Practice Again
                                  </>
                                ) : (
                                  <>
                                    Practice Quiz
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* =========================================================================
                    SECTION C: Skills at Benchmark
                   ========================================================================= */}
                {benchmarkMetSkills.length > 0 && (
                  <div className="pt-6 border-t border-[var(--border-color)] space-y-3">
                    <div>
                      <h2 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Skills at Benchmark ({benchmarkMetSkills.length})
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        These skills have reached their current benchmark requirement ({careerName}). Meeting a benchmark level is a milestone along your career path, not proof of permanent mastery.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {benchmarkMetSkills.map((skill) => (
                        <Card
                          key={skill.skillName}
                          className="p-3.5 bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-muted)] flex items-center justify-between rounded-xl"
                        >
                          <div>
                            <h4 className="font-semibold text-[var(--text-main)] text-xs sm:text-sm">
                              {skill.skillName}
                            </h4>
                            <span className="text-[11px] text-[var(--text-muted)]">{skill.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-bold tabular-nums text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              {skill.currentLevel} / {skill.requiredLevel} pts
                            </span>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Benchmark met</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 2: Active Practice Quiz Session
           ========================================================================= */}
        {viewState === 'active' && currentQuestion && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-color)] bg-[var(--primary-color)]/10 px-2.5 py-0.5 rounded-md border border-[var(--primary-color)]/20 font-mono">
                  {quizMeta?.skillName} Practice Quiz
                </span>
                <p className="text-xs text-[var(--text-muted)] mt-1.5">
                  Question {currentIndex + 1} of {questions.length} • 5 Questions Checkpoint
                </p>
              </div>
              <button
                onClick={handleBackToCatalog}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline transition-colors"
              >
                Quit Quiz
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--primary-color)] h-full rounded-full transition-all duration-200"
                style={{ width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%` }}
              />
            </div>

            {/* Question Card */}
            <Card className="p-6 sm:p-7 bg-[var(--surface-color)] border-[var(--border-color)] shadow-xs rounded-xl space-y-6">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] leading-snug">
                {currentQuestion.question}
              </h2>

              {/* 4 Choices */}
              <div className="space-y-3">
                {currentQuestion.options.map((optionText, optIndex) => {
                  const isSelected = answers[currentQuestion.id] === optIndex;
                  const optionLabel = String.fromCharCode(65 + optIndex);

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, optIndex)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                        isSelected
                          ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 text-[var(--text-main)] font-medium shadow-xs'
                          : 'border-[var(--border-color)] hover:border-[var(--text-muted)]/40 hover:bg-[var(--surface-elevated)] text-[var(--text-main)]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-[var(--primary-color)] text-white'
                            : 'bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        {optionLabel}
                      </span>
                      <span className="text-sm leading-relaxed pt-0.5">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="md"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {answeredCount} of {questions.length} answered
                </span>

                {isLastQuestion ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitQuiz}
                    className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700"
                  >
                    Submit Quiz
                    <CheckCircle2 className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="text-xs font-semibold"
                  >
                    Next Question
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: Submitting State
           ========================================================================= */}
        {viewState === 'submitting' && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--primary-color)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--text-main)]">Grading Your Practice Quiz</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">
              Evaluating answers server-side, verifying conservative scoring policy, and curating revision resources...
            </p>
          </div>
        )}

        {/* =========================================================================
            VIEW 4: Detailed Results & Review State
           ========================================================================= */}
        {viewState === 'results' && resultData && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Score Summary Card */}
            <Card className="p-6 sm:p-8 bg-[var(--surface-color)] border-[var(--border-color)] shadow-xs rounded-xl text-center">
              <div className="inline-flex p-3 rounded-2xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] mb-3">
                {resultData.passed ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                ) : (
                  <HelpCircle className="w-10 h-10 text-amber-500" />
                )}
              </div>

              <h2 className="text-2xl font-bold text-[var(--text-main)]">
                {resultData.passed ? 'Practice Goal Met!' : 'Practice Makes Progress'}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                You scored <span className="font-bold tabular-nums text-[var(--text-main)]">{resultData.overallScore}%</span> ({resultData.totalCorrect} of {resultData.totalQuestions} questions correct) on {resultData.skillName}.
              </p>

              {/* Practice Performance Comparison */}
              {resultData.practiceStats && (
                <div className="mt-4 inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                  <TrendingUp className="w-4 h-4 text-[var(--primary-color)]" />
                  <span>
                    Practice Performance: Attempt #{resultData.practiceStats.totalAttempts || 1} • Best score: <strong className="tabular-nums text-[var(--text-main)]">{resultData.practiceStats.bestScore}%</strong>
                  </span>
                </div>
              )}

              {/* Policy Callout */}
              <div className="mt-5 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-left text-xs text-[var(--text-muted)] max-w-xl mx-auto">
                <div className="flex items-center gap-2 font-semibold text-[var(--text-main)] mb-1">
                  <Info className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
                  <span>Practice Checkpoint vs. Comprehensive Assessment</span>
                </div>
                <p className="leading-relaxed text-[var(--text-muted)]">
                  {resultData.proficiency?.preservedExisting
                    ? `Existing diagnostic assessment score (${resultData.proficiency.finalLevel}/100) preserved. Practice quiz attempts measure short checkpoint performance and never degrade comprehensive diagnostic records.`
                    : resultData.proficiency?.isImproved
                    ? `Practice checkpoint updated to ${resultData.proficiency.finalLevel}/60. Short practice quizzes are conservatively capped at 60 points; full mastery requires comprehensive assessment and real project evidence.`
                    : 'Practice attempts are recorded for your learning progress without altering roadmap topic completions.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartQuiz(resultData.skillName)}
                  className="text-xs font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Practise Again
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBackToCatalog}
                  className="text-xs font-semibold"
                >
                  All Practice Gaps
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/roadmap?skill=${encodeURIComponent(resultData.skillName)}`)}
                  className="text-xs font-semibold text-[var(--primary-color)] hover:text-[var(--primary-hover)]"
                >
                  <Milestone className="w-3.5 h-3.5 mr-1.5 text-[var(--primary-color)]" />
                  Return to Roadmap Milestone
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </Card>

            {/* Question by Question Review */}
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)] mb-3">Question Breakdown & Explanations</h3>
              <div className="space-y-4">
                {resultData.questionResponses?.map((resp, idx) => {
                  const isCorrect = resp.isCorrect;

                  return (
                    <Card
                      key={resp.questionId || idx}
                      className={`p-5 rounded-xl border transition-colors ${
                        isCorrect ? 'border-emerald-500/30 bg-[var(--surface-color)]' : 'border-rose-500/30 bg-rose-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5">
                            {isCorrect ? (
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4.5 h-4.5 text-rose-500" />
                            )}
                          </span>
                          <span className="font-semibold text-[var(--text-main)] text-sm">
                            {idx + 1}. {resp.question}
                          </span>
                        </div>
                        <Badge variant={isCorrect ? 'success' : 'danger'} className="text-[11px] shrink-0">
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>

                      {/* Choices Breakdown */}
                      <div className="space-y-1.5 pl-7 mb-3 text-xs">
                        {resp.options?.map((opt, optIdx) => {
                          const isUserPick = resp.selectedOption === optIdx;
                          const isTheCorrectOption = resp.correctOption === optIdx;

                          let choiceStyle = 'text-[var(--text-muted)] bg-[var(--surface-elevated)] border-[var(--border-color)]';
                          if (isTheCorrectOption) {
                            choiceStyle = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30 font-semibold';
                          } else if (isUserPick && !isCorrect) {
                            choiceStyle = 'text-rose-500 bg-rose-500/10 border-rose-500/30 line-through';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-lg border text-xs flex items-center justify-between ${choiceStyle}`}
                            >
                              <span>
                                <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                                {opt}
                              </span>
                              {isUserPick && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)]">
                                  Your Choice
                                </span>
                              )}
                              {isTheCorrectOption && (
                                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {resp.explanation && (
                        <div className="ml-7 p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                          <span className="font-bold text-[var(--text-main)]">Explanation: </span>
                          {resp.explanation}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recommended Revision Resources */}
            {resultData.recommendedResources?.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[var(--primary-color)]" />
                    Recommended Revision Resources
                  </h3>
                  <Link
                    to={`/resources`}
                    className="text-xs text-[var(--primary-color)] hover:underline font-medium"
                  >
                    View All Resources &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resultData.recommendedResources.map((resItem) => (
                    <Card
                      key={resItem.id}
                      className="p-4 bg-[var(--surface-color)] border-[var(--border-color)] hover:border-[var(--text-muted)]/40 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
                          <span className="font-semibold text-[var(--primary-color)] uppercase text-[10px] tracking-wider font-mono">
                            {resItem.type}
                          </span>
                          <span className="capitalize text-[11px] px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border-color)]">
                            {resItem.level}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[var(--text-main)] leading-snug mb-1">
                          {resItem.title}
                        </h4>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">
                          {resItem.description}
                        </p>
                      </div>

                      <a
                        href={resItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-[var(--primary-color)] hover:text-[var(--primary-hover)]"
                      >
                        Open Resource ({resItem.provider})
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
