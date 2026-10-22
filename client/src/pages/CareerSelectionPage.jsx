import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Briefcase,
  Target,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth, putAuth } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function CareerSelectionPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [savedId, setSavedId] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Confirmation state when switching away from an already saved career
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setErrorMessage(null);

      // Load careers and user profile
      const [careersRes, profileRes] = await Promise.all([
        getAuth('/careers'),
        getAuth('/users/me'),
      ]);

      if (!isMounted) return;

      if (careersRes.error) {
        setErrorMessage(careersRes.error);
      } else {
        setCareers(careersRes.data || []);
      }

      const activeCareerId =
        profileRes.data?.selectedCareerId || profile?.selectedCareerId || '';

      if (activeCareerId) {
        setSelectedId(activeCareerId);
        setSavedId(activeCareerId);
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [profile?.selectedCareerId]);

  const handleSelectCareer = (careerId) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // If user already saved a career and clicks a different one, confirm first
    if (savedId && careerId !== savedId && careerId !== selectedId) {
      setPendingId(careerId);
      return;
    }

    setSelectedId(careerId);
  };

  const confirmCareerSwitch = () => {
    if (pendingId) {
      setSelectedId(pendingId);
      setPendingId(null);
    }
  };

  const cancelCareerSwitch = () => {
    setPendingId(null);
  };

  const handleSaveAndContinue = async () => {
    if (!selectedId) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await putAuth('/users/me/career', {
      careerId: selectedId,
    });

    if (error) {
      setErrorMessage(error);
      setSaving(false);
      return;
    }

    setSavedId(selectedId);
    setSuccessMessage('Target career benchmark aligned successfully.');
    await refreshProfile();
    setSaving(false);

    // Continue to resume upload
    setTimeout(() => {
      navigate('/resume');
    }, 500);
  };

  const pendingCareer = careers.find((c) => c.id === pendingId);
  const currentSavedCareer = careers.find((c) => c.id === savedId);

  return (
    <div className="py-10 sm:py-14 min-h-[80vh]">
      <Container size="default">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[var(--primary-color)] bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 mb-1">
              <Target className="w-3.5 h-3.5" />
              <span>Step 1 of 5: Baseline Selection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
              Select Your Target Career Track
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
              Choose the verified role you are targeting. Your diagnostic assessments, skill gap matrix,
              and milestone roadmap will be calculated against this canonical standard.
            </p>
          </div>

          {/* Accessible Live Feedback */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              aria-live="polite"
              className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Confirmation Dialog for Changing Career */}
          {pendingId && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-switch-title"
              className="p-5 sm:p-6 rounded-xl bg-[var(--surface-color)] border border-amber-300 dark:border-amber-700/60 shadow-lg space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3
                    id="confirm-switch-title"
                    className="text-sm font-bold text-[var(--text-main)]"
                  >
                    Switch Target Career Track?
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    You currently have{' '}
                    <strong className="text-[var(--text-main)]">
                      {currentSavedCareer?.name || savedId}
                    </strong>{' '}
                    active. Changing your target career to{' '}
                    <strong className="text-[var(--text-main)]">
                      {pendingCareer?.name || pendingId}
                    </strong>{' '}
                    will realign your upcoming skill gap diagnostics, roadmap milestones, and practice quizzes.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
                <Button variant="ghost" size="sm" onClick={cancelCareerSwitch}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={confirmCareerSwitch}>
                  Confirm Switch
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--primary-color)]" aria-hidden="true" />
              <p className="text-xs font-medium text-[var(--text-muted)]">
                Loading standardized career benchmarks...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !errorMessage && careers.length === 0 && (
            <Card className="p-8 sm:p-12 text-center space-y-4 border-dashed border-[var(--border-color)] bg-[var(--surface-color)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center mx-auto">
                <Briefcase className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-[var(--text-main)]">
                  No Career Benchmarks Found
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  The Firestore <code className="px-1 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-main)] font-mono text-xs">careers</code> collection is currently empty.
                </p>
              </div>
            </Card>
          )}

          {/* Careers Grid */}
          {!loading && careers.length > 0 && (
            <div
              role="radiogroup"
              aria-label="Target Career Options"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {careers.map((career) => {
                const isSelected = selectedId === career.id;
                const isCurrentSaved = savedId === career.id;

                return (
                  <div
                    key={career.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => handleSelectCareer(career.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleSelectCareer(career.id);
                      }
                    }}
                    className={`relative text-left p-6 rounded-2xl border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] hover:-translate-y-1 hover:shadow-md ${
                      isSelected
                        ? 'border-[var(--primary-color)] bg-[var(--pastel-lavender)]/40 shadow-sm ring-2 ring-[var(--focus-ring)]/20'
                        : 'border-[var(--border-color)] bg-[var(--surface-color)] hover:border-[var(--text-muted)]/40 shadow-xs'
                    }`}
                  >
                    {/* Top Row: Category Badge & Radio Indicator */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-muted)] font-mono">
                          {career.category || 'Engineering'}
                        </span>
                        {isCurrentSaved && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Active Goal
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white'
                            : 'border-[var(--border-color)] bg-[var(--surface-color)]'
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Career Title & Description */}
                    <div className="space-y-1.5 mb-3.5">
                      <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                        {career.name}
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                        {career.description}
                      </p>
                    </div>

                    {/* Key Skills Tags */}
                    {career.skills && career.skills.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-[var(--border-color)]">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block font-mono">
                          Benchmark Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {career.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-main)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Footer */}
          {!loading && careers.length > 0 && (
            <div className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button to="/dashboard" variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Back to Dashboard
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedId || saving}
                  onClick={handleSaveAndContinue}
                  className="w-full sm:w-auto justify-center"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Saving Career Goal...
                    </>
                  ) : (
                    <>
                      Save &amp; Continue to Resume
                      <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
