import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Compass,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth, postAuth } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

/**
 * Returns descriptive competency label matching docs/04-scoring-method.md
 */
function getScoreLevel(score) {
  if (score >= 75) return { label: 'Proficient / Advanced', variant: 'success', color: 'text-emerald-500' };
  if (score >= 50) return { label: 'Competent', variant: 'sage', color: 'text-teal-500' };
  if (score >= 25) return { label: 'Developing', variant: 'plum', color: 'text-indigo-400' };
  return { label: 'Beginner', variant: 'coral', color: 'text-amber-500' };
}

export default function AssessmentPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Primary state
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState('overview'); // 'overview' | 'active' | 'results'
  const [errorMessage, setErrorMessage] = useState(null);

  // Status & Career Metadata
  const [_careerId, setCareerId] = useState('');
  const [careerName, setCareerName] = useState('');
  const [lastAssessment, setLastAssessment] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  // Active Assessment State
  const [assessmentId, setAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: optionIndex }
  const [deadline, setDeadline] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Results State
  const [resultData, setResultData] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const timerRef = useRef(null);

  // Initial status fetch on mount
  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      setLoading(true);
      setErrorMessage(null);

      const res = await getAuth('/assessment/status');

      if (!isMounted) return;

      if (res.error) {
        if (res.status === 409) {
          navigate('/career', {
            replace: true,
            state: { message: 'Please select a target career before taking the diagnostic assessment.' },
          });
          return;
        }
        setErrorMessage(res.error);
        setLoading(false);
        return;
      }

      const data = res.data;
      setCareerId(data.selectedCareerId || '');
      setCareerName(data.careerName || data.selectedCareerId || '');
      setLastAssessment(data.lastAssessment || null);

      // Resume active assessment if session is in progress and unexpired
      if (data.hasActiveAssessment && data.activeAssessment?.questions?.length > 0) {
        const active = data.activeAssessment;
        setAssessmentId(active.assessmentId);
        setQuestions(active.questions);
        setDeadline(active.deadline);
        setViewState('active');
      }

      setLoading(false);
    }

    loadStatus();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [navigate]);

  // Synchronized countdown timer driven by server deadline
  useEffect(() => {
    if (viewState !== 'active' || !deadline) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const updateTimer = () => {
      const deadlineMs = new Date(deadline).getTime();
      const remainingSeconds = Math.max(0, Math.round((deadlineMs - Date.now()) / 1000));
      setTimeRemaining(remainingSeconds);

      if (remainingSeconds === 0) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState, deadline]);

  // Start new assessment
  const handleStartAssessment = async () => {
    setIsStarting(true);
    setErrorMessage(null);

    const res = await postAuth('/assessment/start', {});
    setIsStarting(false);

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    const data = res.data;
    setAssessmentId(data.assessmentId);
    setCareerId(data.careerId);
    setCareerName(data.careerName);
    setQuestions(data.questions || []);
    setDeadline(data.deadline);
    setCurrentIndex(0);
    setUserAnswers({});
    setSubmitError(null);
    setViewState('active');
  };

  // Option selection
  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Submit assessment answers
  const handleSubmitAssessment = useCallback(async () => {
    if (!assessmentId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Format answers array matching Zod schema
    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      selectedOption: userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1,
    }));

    // Filter out completely unanswered questions if any, or map them as required by validator
    const validAnswers = answersPayload.filter((a) => a.selectedOption >= 0 && a.selectedOption <= 3);

    if (validAnswers.length === 0) {
      setSubmitError('Please answer at least one question before submitting.');
      setIsSubmitting(false);
      setShowConfirmModal(false);
      return;
    }

    const res = await postAuth('/assessment/submit', {
      assessmentId,
      answers: validAnswers,
    });

    setIsSubmitting(false);
    setShowConfirmModal(false);

    if (res.error) {
      setSubmitError(res.error);
      return;
    }

    setResultData(res.data);
    setViewState('results');
  }, [assessmentId, questions, userAnswers]);

  // Format seconds into MM:SS
  const formatTimer = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).filter(
    (qid) => userAnswers[qid] >= 0 && userAnswers[qid] <= 3
  ).length;

  const currentQuestion = questions[currentIndex] || null;

  // Toggle review accordion item
  const toggleExplanation = (qid) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qid]: !prev[qid],
    }));
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin" aria-hidden="true" />
        <p className="text-sm font-medium text-[var(--text-muted)]">
          Loading diagnostic assessment...
        </p>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14 min-h-[75vh]">
      <Container size="default">
        {/* =========================================================================
            STATE 1: OVERVIEW SCREEN
           ========================================================================= */}
        {viewState === 'overview' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 mb-1">
                <Badge variant="plum">Phase 7: Diagnostic Assessment</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
                Verify Your Technical Skills
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
                A 10-minute objective evaluation tailored to your selected career:{' '}
                <strong className="text-[var(--text-main)]">{careerName}</strong>.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/30 text-xs text-[var(--danger-color)] flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Assessment Rules Card */}
            <Card className="p-6 sm:p-7 border-[var(--border-color)] bg-[var(--surface-color)] shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[var(--primary-color)]" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Target Role: {careerName}
                  </span>
                </div>
                <Badge variant="sage">15 Questions</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-center space-y-1">
                  <Clock className="w-4 h-4 text-[var(--accent-color)] mx-auto" />
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Time Limit
                  </p>
                  <p className="text-sm font-bold text-[var(--text-main)]">10 Minutes</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-center space-y-1">
                  <FileQuestion className="w-4 h-4 text-[var(--primary-color)] mx-auto" />
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Question Format
                  </p>
                  <p className="text-sm font-bold text-[var(--text-main)]">Multiple Choice</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-center space-y-1">
                  <Award className="w-4 h-4 text-[var(--highlight-color)] mx-auto" />
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Score Scale
                  </p>
                  <p className="text-sm font-bold text-[var(--text-main)]">0–100 Points</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[var(--text-muted)] bg-[var(--surface-elevated)] p-4 rounded-xl border border-[var(--border-color)]">
                <p className="font-semibold text-[var(--text-main)]">Assessment Rules &amp; Integrity:</p>
                <ul className="space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>3 targeted questions per benchmark skill (total 15 questions).</li>
                  <li>Scored objectively on the standardized 0–100 integer scale.</li>
                  <li>
                    Scores are stamped with source <code className="text-[var(--primary-color)] font-semibold">assessment-verified</code> and take precedence over resume estimates.
                  </li>
                  <li>Server-enforced timer: answer submissions close when the countdown reaches zero.</li>
                </ul>
              </div>

              {lastAssessment && (
                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      Previous Assessment
                    </p>
                    <p className="text-sm font-bold text-[var(--text-main)]">
                      Score: {lastAssessment.overallScore}/100 • Completed on{' '}
                      {new Date(lastAssessment.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getScoreLevel(lastAssessment.overallScore).variant}>
                    {getScoreLevel(lastAssessment.overallScore).label}
                  </Badge>
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-sm font-bold shadow-md"
                  onClick={handleStartAssessment}
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Initializing Assessment...
                    </>
                  ) : lastAssessment ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retake Diagnostic Assessment
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Start Diagnostic Assessment
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <div className="text-center">
              <Link
                to="/dashboard"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: ACTIVE ASSESSMENT RUNNER
           ========================================================================= */}
        {viewState === 'active' && currentQuestion && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Top Status & Live Timer Bar */}
            <div className="p-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-[var(--primary-color)] uppercase tracking-wider">
                  {careerName}
                </span>
                <h2 className="text-sm font-extrabold text-[var(--text-main)]">
                  Question {currentIndex + 1} of {questions.length} •{' '}
                  <span className="text-[var(--accent-color)]">{currentQuestion.skill}</span>
                </h2>
              </div>

              {/* Synchronized Server Countdown Timer */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                  timeRemaining !== null && timeRemaining <= 60
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-main)] border-[var(--border-color)]'
                }`}
                aria-live="polite"
              >
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>{formatTimer(timeRemaining)}</span>
              </div>
            </div>

            {/* Question Navigator Dots */}
            <div className="p-3 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2 px-1">
                <span>Progress: {answeredCount} of {questions.length} answered</span>
                {answeredCount < questions.length && (
                  <span className="text-[var(--highlight-color)] font-medium">
                    {questions.length - answeredCount} remaining
                  </span>
                )}
              </div>
              <div className="grid grid-cols-15 gap-1 sm:gap-1.5">
                {questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-7 sm:h-8 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                        isCurrent
                          ? 'bg-[var(--primary-color)] text-white shadow-xs'
                          : isAnswered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--primary-color)]/30'
                      }`}
                      aria-label={`Jump to question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {submitError && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/30 text-xs text-[var(--danger-color)] flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Current Question Card */}
            <Card className="p-6 sm:p-8 border-[var(--border-color)] bg-[var(--surface-color)] shadow-md space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2">
                  <Badge variant="sage">{currentQuestion.category || 'Technical Skill'}</Badge>
                  <span className="text-xs text-[var(--text-muted)]">3 points</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)] leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* 4 Accessible Multiple Choice Options */}
              <div className="space-y-2.5" role="radiogroup" aria-label="Answer options">
                {currentQuestion.options.map((optionText, optIdx) => {
                  const isSelected = userAnswers[currentQuestion.id] === optIdx;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <div
                      key={`${currentQuestion.id}-opt-${optIdx}`}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleSelectOption(currentQuestion.id, optIdx);
                        }
                      }}
                      className={`p-3.5 sm:p-4 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                        isSelected
                          ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)] text-[var(--text-main)] shadow-xs'
                          : 'bg-[var(--surface-elevated)] border-[var(--border-color)] hover:border-[var(--primary-color)]/40 text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[var(--primary-color)] text-white'
                            : 'bg-[var(--surface-color)] text-[var(--text-muted)] border border-[var(--border-color)]'
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-normal flex-1">
                        {optionText}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)] gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0 || isSubmitting}
                  className="text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={isSubmitting}
                    className="text-xs"
                  >
                    Next
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                ) : (
                  <Button
                    variant="coral"
                    size="sm"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isSubmitting}
                    className="text-xs font-bold"
                  >
                    Review &amp; Submit
                  </Button>
                )}
              </div>
            </Card>

            {/* Quick Submit Floating Bar */}
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-2">
              <span>
                Tip: You can jump to any question using the number selector above.
              </span>
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={isSubmitting}
                className="text-[var(--primary-color)] hover:underline font-semibold"
              >
                Submit Assessment Now
              </button>
            </div>

            {/* Confirm Submission Modal */}
            {showConfirmModal && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-submit-title"
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
              >
                <Card className="max-w-md w-full p-6 space-y-4 border-[var(--border-color)] bg-[var(--surface-color)] shadow-2xl">
                  <div className="flex items-center gap-2 text-base font-bold text-[var(--text-main)]">
                    <ShieldCheck className="w-5 h-5 text-[var(--primary-color)]" />
                    <span id="confirm-submit-title">Confirm Assessment Submission</span>
                  </div>

                  <div className="space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
                    <p>
                      You have answered <strong>{answeredCount}</strong> of{' '}
                      <strong>{questions.length}</strong> questions.
                    </p>
                    {answeredCount < questions.length && (
                      <p className="text-[var(--highlight-color)] font-medium">
                        Notice: {questions.length - answeredCount} questions remain unanswered and will be marked incorrect.
                      </p>
                    )}
                    <p>
                      Once submitted, your answers will be graded server-side and recorded in your verified profile. This action cannot be undone.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmModal(false)}
                      disabled={isSubmitting}
                    >
                      Continue Test
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmitAssessment}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Grading Answers...
                        </>
                      ) : (
                        'Yes, Submit Now'
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STATE 3: VERIFIED RESULTS & EDUCATIONAL REVIEW
           ========================================================================= */}
        {viewState === 'results' && resultData && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Top Score Banner */}
            <Card className="p-6 sm:p-8 border-[var(--border-color)] bg-[var(--surface-color)] shadow-lg space-y-6 text-center">
              <div className="inline-flex items-center gap-1.5">
                <Badge variant="success">Diagnostic Assessment Verified</Badge>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-main)] tracking-tight">
                  {resultData.overallScore}
                  <span className="text-xl sm:text-2xl font-semibold text-[var(--text-muted)]">/100</span>
                </h1>
                <p className="text-sm font-bold text-[var(--accent-color)]">
                  {getScoreLevel(resultData.overallScore).label} Rating
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Answered {resultData.totalCorrect} of {resultData.totalQuestions} questions correctly in{' '}
                  {Math.floor(resultData.timeSpentSeconds / 60)}m {resultData.timeSpentSeconds % 60}s.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[var(--border-color)] h-2 rounded-full overflow-hidden max-w-md mx-auto">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)]"
                  style={{ width: `${Math.min(100, Math.max(5, resultData.overallScore))}%` }}
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button to="/dashboard" variant="primary" size="sm">
                  View Student Dashboard
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStartAssessment}
                  disabled={isStarting}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Retake Assessment
                </Button>
              </div>
            </Card>

            {/* Verified Skill Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                    Verified Competency by Skill
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Individual skills tested against {resultData.careerName} benchmark criteria.
                  </p>
                </div>
                <Badge variant="plum">Source: assessment-verified</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resultData.skillScores.map((skill) => {
                  const levelInfo = getScoreLevel(skill.score);

                  // Cross-reference with resume-inferred score if available
                  const resumeMatch = profile?.extractedSkills?.find(
                    (s) => s.name?.toLowerCase() === skill.name?.toLowerCase()
                  );

                  return (
                    <div
                      key={skill.name}
                      className="p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[var(--text-main)]">{skill.name}</p>
                          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                            {skill.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs font-extrabold text-[var(--text-main)]">
                            {skill.score}/100
                          </p>
                          <span className={`text-[10px] font-semibold ${levelInfo.color}`}>
                            {skill.questionsCorrect}/{skill.questionsTotal} Correct
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-[var(--border-color)] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-[var(--accent-color)]"
                          style={{ width: `${Math.min(100, Math.max(5, skill.score))}%` }}
                        />
                      </div>

                      {/* Source Comparison Tagging (Preserves resume-inferred distinctly) */}
                      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]/60 text-[10px] text-[var(--text-muted)]">
                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          assessment-verified
                        </span>
                        {resumeMatch ? (
                          <span className="text-[var(--text-muted)]">
                            Resume inferred: <strong>{resumeMatch.level}/100</strong>
                          </span>
                        ) : (
                          <span className="italic">Not detected in resume</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Educational Question Review Accordion */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                  Question Review &amp; Explanations
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Review the correct technical concepts and educational rationales.
                </p>
              </div>

              <div className="space-y-2.5">
                {resultData.questionResponses.map((qr, idx) => {
                  const isExpanded = expandedQuestions[qr.questionId];
                  return (
                    <div
                      key={qr.questionId}
                      className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleExplanation(qr.questionId)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {qr.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[var(--text-main)] block truncate">
                              Question {idx + 1} • {qr.skill}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {qr.isCorrect ? 'Answered Correctly' : 'Answered Incorrectly'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[var(--text-muted)]">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-1 border-t border-[var(--border-color)]/60 bg-[var(--surface-elevated)]/50 space-y-2 text-xs">
                          <div className="flex items-start gap-2 text-emerald-400">
                            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <p className="font-semibold">Educational Explanation:</p>
                          </div>
                          <p className="text-[var(--text-muted)] leading-relaxed pl-5">
                            {qr.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

              <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
                <Info className="w-4 h-4 text-[var(--accent-color)] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="leading-relaxed">
                  <strong>What happens next:</strong> Diagnostic testing (<strong>Phase 7</strong>) has validated your baseline scores. Skill gap calculation (<strong>Phase 8</strong>) will mathematically compare your verified skill levels against industry benchmarks to prioritize your learning roadmap.
                </p>
              </div>
          </div>
        )}
      </Container>
    </div>
  );
}
