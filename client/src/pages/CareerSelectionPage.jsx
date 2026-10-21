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
    setSuccessMessage('Target career goal saved successfully.');
    await refreshProfile();
    setSaving(false);

    // Continue to resume upload
    setTimeout(() => {
      navigate('/resume');
    }, 600);
  };

  const pendingCareer = careers.find((c) => c.id === pendingId);
  const currentSavedCareer = careers.find((c) => c.id === savedId);

  return (
    <div className="py-12 sm:py-16 min-h-[75vh]">
      <Container size="default">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
              Choose Your Target Career Path
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto">
              Select the professional tech role you are aiming for. Your skill assessments, gap
              analysis, and personalized roadmap will be measured against this industry benchmark.
            </p>
          </div>

          {/* Accessible Live Regions */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/25 text-[var(--danger-color)] text-xs sm:text-sm font-medium flex items-center gap-2.5"
            >
              <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              aria-live="polite"
              className="p-4 rounded-xl bg-[var(--success-color)]/10 border border-[var(--success-color)]/25 text-[var(--success-color)] text-xs sm:text-sm font-semibold flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Confirmation Modal / Card for Changing Career */}
          {pendingId && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-switch-title"
              className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--highlight-color)]/50 shadow-xl space-y-4 animate-in fade-in"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[var(--highlight-color)]/15 text-[var(--highlight-color)] shrink-0">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3
                    id="confirm-switch-title"
                    className="text-base font-bold text-[var(--text-main)]"
                  >
                    Change Target Career Goal?
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    You currently have{' '}
                    <strong className="text-[var(--text-main)]">
                      {currentSavedCareer?.name || savedId}
                    </strong>{' '}
                    selected. Changing your target career to{' '}
                    <strong className="text-[var(--text-main)]">
                      {pendingCareer?.name || pendingId}
                    </strong>{' '}
                    will realign your future skill gap diagnostics, roadmap milestones, and resume
                    evaluations.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
                <Button variant="ghost" size="sm" onClick={cancelCareerSwitch}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={confirmCareerSwitch}>
                  Confirm Change
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" aria-hidden="true" />
              <p className="text-sm font-medium text-[var(--text-muted)]">
                Loading standardized career benchmarks...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !errorMessage && careers.length === 0 && (
            <Card className="p-8 sm:p-12 text-center space-y-4 border-dashed border-[var(--border-color)] bg-[var(--surface-color)]">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-[var(--text-main)]">
                  No Career Benchmarks Found
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  The Firestore <code className="px-1 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-main)] font-mono text-xs">careers</code> collection is currently empty.
                </p>
                <p className="text-xs text-[var(--text-muted)] pt-2">
                  Please run the idempotent seed script on the backend:
                </p>
                <pre className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs font-mono text-left overflow-x-auto text-[var(--text-main)]">
                  node server/scripts/seedCareers.js
                </pre>
              </div>
            </Card>
          )}

          {/* Careers Grid */}
          {!loading && careers.length > 0 && (
            <div
              role="radiogroup"
              aria-label="Target Career Options"
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
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
                    className={`relative text-left p-5 sm:p-6 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                      isSelected
                        ? 'border-[var(--primary-color)] bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs ring-1 ring-[var(--primary-color)]/30'
                        : 'border-[var(--border-color)] bg-[var(--surface-color)] hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Category Badge & Radio Indicator */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="plum">{career.category || 'Engineering'}</Badge>
                        {isCurrentSaved && (
                          <span className="text-[11px] font-semibold text-[var(--accent-color)] uppercase tracking-wider">
                            Active Choice
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
                    <div className="space-y-1.5 mb-4">
                      <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                        {career.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                        {career.description}
                      </p>
                    </div>

                    {/* Key Skills Tags */}
                    {career.skills && career.skills.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-[var(--border-color)]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                          Benchmark Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {career.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-main)]"
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
              <Button to="/dashboard" variant="ghost" size="md">
                <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Back to Dashboard
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
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
                      Save & Continue to Resume
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
