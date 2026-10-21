import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Compass,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldAlert,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function SettingsPage() {
  const { profile, user, updateDisplayName, deleteAccount, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Profile editing state
  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Career details
  const [careerName, setCareerName] = useState('');

  // Account deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Initialize display name from profile or auth user
  useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    } else if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [profile?.displayName, user?.displayName]);

  // Load career benchmark title for current selectedCareerId
  useEffect(() => {
    let isMounted = true;

    async function loadCareer() {
      if (!profile?.selectedCareerId) {
        if (isMounted) setCareerName('');
        return;
      }

      const res = await getAuth('/careers');
      if (isMounted && res.data && Array.isArray(res.data)) {
        const match = res.data.find((c) => c.id === profile.selectedCareerId);
        if (match) {
          setCareerName(match.name);
        }
      }
    }

    loadCareer();

    return () => {
      isMounted = false;
    };
  }, [profile?.selectedCareerId]);

  // Handle display name update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    const trimmed = displayName.trim();
    if (trimmed.length < 2) {
      setProfileError('Display name must be at least 2 characters.');
      return;
    }
    if (trimmed.length > 60) {
      setProfileError('Display name cannot exceed 60 characters.');
      return;
    }

    setSavingProfile(true);

    try {
      await updateDisplayName(trimmed);
      setProfileSuccess('Profile display name updated successfully.');
      await refreshProfile();
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle permanent account and data deletion
  const handleConfirmDelete = async () => {
    if (deleteConfirmationInput !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm permanent account removal.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccount('DELETE');
      setDeleteSuccess(true);
      setIsDeleteModalOpen(false);
      navigate('/register', {
        replace: true,
        state: { notice: 'Your account and personal data have been completely deleted.' },
      });
    } catch (err) {
      if (err.code === 'RECENT_AUTH_REQUIRED') {
        setDeleteError(
          'For your security, deleting your account requires recent authentication. Please sign out, sign in again, and retry account deletion.'
        );
      } else {
        setDeleteError(err.message || 'Failed to complete account deletion. Please try again.');
      }
      setIsDeleting(false);
    }
  };

  // Safe date formatter
  const formatDate = (dateVal) => {
    if (!dateVal) return null;
    try {
      const d = new Date(dateVal);
      if (Number.isNaN(d.getTime())) return null;
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const formattedCreatedAt = formatDate(profile?.createdAt);
  const formattedUpdatedAt = formatDate(profile?.updatedAt);
  const formattedCareerSelectedAt = formatDate(profile?.selectedCareerAt);
  const formattedAssessedAt = formatDate(profile?.lastAssessedAt);

  return (
    <div className="py-8 sm:py-12 bg-[var(--bg-color)] transition-colors min-h-screen">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
            Account Settings & Data Management
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--text-muted)]">
            Manage your personal profile, active career goal, and privacy options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Column: Profile & Career Track */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* 1. Profile Information Card */}
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
                <div className="p-2.5 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                  <User className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-main)]">
                    Profile Information
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    Update your personal details displayed throughout your learning dashboard.
                  </p>
                </div>
              </div>

              {/* Success Banner */}
              {profileSuccess && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm font-medium">{profileSuccess}</p>
                </div>
              )}

              {/* Error Banner */}
              {profileError && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm font-medium">{profileError}</p>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Display Name Input */}
                <div>
                  <label
                    htmlFor="displayNameInput"
                    className="block text-sm font-medium text-[var(--text-main)] mb-1.5"
                  >
                    Display Name
                  </label>
                  <div className="relative">
                    <input
                      id="displayNameInput"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={savingProfile}
                      maxLength={60}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors text-sm disabled:opacity-60"
                      placeholder="e.g. Jane Doe"
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-muted)] flex justify-between">
                    <span>Must be between 2 and 60 characters.</span>
                    <span>{displayName.length}/60</span>
                  </p>
                </div>

                {/* Email (Read-Only) */}
                <div>
                  <label
                    htmlFor="emailInput"
                    className="block text-sm font-medium text-[var(--text-main)] mb-1.5"
                  >
                    Account Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <input
                      id="emailInput"
                      type="email"
                      value={profile?.email || user?.email || ''}
                      readOnly
                      disabled
                      className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-muted)] text-sm cursor-not-allowed select-none"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-color)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                        <Lock className="w-3 h-3" />
                        Read-only
                      </span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                    Email address is securely linked to your Firebase Authentication identity.
                  </p>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={savingProfile || !displayName.trim()}
                    className="min-w-[130px]"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            {/* 2. Target Career Preference Card */}
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
                <div className="p-2.5 rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                  <Compass className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-main)]">
                    Target Career Goal
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    Your active role determines benchmark expectations, roadmap milestones, and practice quizzes.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base text-[var(--text-main)]">
                      {careerName || profile?.selectedCareerId || 'No Career Selected Yet'}
                    </span>
                    {profile?.selectedCareerId && (
                      <Badge variant="plum">Active Goal</Badge>
                    )}
                  </div>
                  {formattedCareerSelectedAt && (
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Target set on {formattedCareerSelectedAt}</span>
                    </p>
                  )}
                </div>

                <Button
                  to="/career"
                  variant="secondary"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Compass className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  <span>{profile?.selectedCareerId ? 'Change Career Track' : 'Choose Career Track'}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Side Column: Metadata & Danger Zone */}
          <div className="space-y-6 sm:space-y-8">
            {/* 3. Account Details & Metadata Card */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border-color)]">
                Account Details
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm">
                {formattedCreatedAt && (
                  <li className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </span>
                    <span className="font-medium text-[var(--text-main)]">
                      {formattedCreatedAt}
                    </span>
                  </li>
                )}

                {formattedUpdatedAt && (
                  <li className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Updated
                    </span>
                    <span className="font-medium text-[var(--text-main)]">
                      {formattedUpdatedAt}
                    </span>
                  </li>
                )}

                <li className="flex items-center justify-between pt-1">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Diagnostic Status
                  </span>
                  {profile?.lastAssessmentId ? (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      Completed {formattedAssessedAt ? `(${formattedAssessedAt})` : ''}
                    </span>
                  ) : (
                    <Link
                      to="/assessment"
                      className="text-xs font-semibold text-[var(--primary-color)] hover:underline"
                    >
                      Take Diagnostic
                    </Link>
                  )}
                </li>
              </ul>
            </Card>

            {/* 4. Danger Zone / Account Deletion Card */}
            <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 transition-colors">
              <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 mb-2">
                <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
                <h3 className="text-base font-semibold">Danger Zone</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                Permanently delete your Skillora AI account and all personal data, including resumes, assessments, roadmap milestones, and practice quiz records.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDeleteConfirmationInput('');
                  setDeleteError(null);
                  setIsDeleteModalOpen(true);
                }}
                className="w-full text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-300 dark:border-rose-800"
              >
                <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Delete My Account and Data</span>
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* Explicit Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteModalTitle"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] transition-colors disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Icon & Header */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h2 id="deleteModalTitle" className="text-lg font-bold text-[var(--text-main)]">
                  Delete Account & All Data?
                </h2>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {/* Deletion Summary Checklist */}
            <div className="my-4 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs space-y-2 text-[var(--text-muted)]">
              <p className="font-semibold text-[var(--text-main)]">
                The following data will be permanently purged:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Firebase Authentication credentials and session</li>
                <li>User profile and selected target career goal</li>
                <li>Uploaded resume file from private cloud storage</li>
                <li>Diagnostic Assessment attempts and proficiency ratings</li>
                <li>Personalized learning roadmap and curriculum checklist</li>
                <li>Practice quiz sessions and statistics</li>
              </ul>
            </div>

            {/* Error Message in Modal */}
            {deleteError && (
              <div
                role="alert"
                className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{deleteError}</p>
              </div>
            )}

            {/* Explicit Confirmation Input */}
            <div className="mb-6">
              <label
                htmlFor="confirmDeleteInput"
                className="block text-xs font-semibold text-[var(--text-main)] mb-1.5"
              >
                Type <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">DELETE</span> to confirm permanent deletion:
              </label>
              <input
                id="confirmDeleteInput"
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                disabled={isDeleting}
                placeholder="DELETE"
                autoComplete="off"
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors font-mono"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationInput !== 'DELETE' || isDeleting}
                className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4.5 py-2.5 gap-2 bg-rose-600 hover:bg-rose-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Permanently Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    <span>Delete My Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
