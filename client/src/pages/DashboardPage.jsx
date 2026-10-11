import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Calendar,
  LogOut,
  CheckCircle2,
  Loader2,
  Sparkles,
  Compass,
  FileText,
  ArrowRight,
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
  const [loadingSetup, setLoadingSetup] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchSetupInfo() {
      setLoadingSetup(true);
      try {
        const [resumeRes, careersRes] = await Promise.all([
          getAuth('/resume'),
          getAuth('/careers'),
        ]);
        if (!isMounted) return;

        if (resumeRes?.data?.resume) {
          setResumeData(resumeRes.data.resume);
        } else {
          setResumeData(null);
        }

        if (careersRes?.data && profile?.selectedCareerId) {
          const match = careersRes.data.find(
            (c) => c.id === profile.selectedCareerId
          );
          if (match) {
            setCareerName(match.name);
          } else {
            setCareerName(profile.selectedCareerId);
          }
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
      month: 'long',
      day: 'numeric',
    })
    : 'Recently';

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="py-12 sm:py-16 min-h-[75vh]">
      <Container size="narrow">
        <div className="space-y-8">
          {/* Top Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 mb-1">
                <Badge variant="plum">Phase 4 Active</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
                Welcome, {profile?.displayName || user?.displayName || 'Learner'}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Authenticated session connected to Skilora Firebase Authentication & Cloud Firestore.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              className="self-start sm:self-auto text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10 hover:border-[var(--danger-color)]/30"
            >
              <LogOut className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Sign Out
            </Button>
          </div>

          {/* Your Setup Card */}
          <Card className="p-6 sm:p-7 border-[var(--border-color)] bg-[var(--surface-color)] shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Badge variant="sage">Your Learning Setup</Badge>
              </div>
              {loadingSetup ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-color)]" aria-hidden="true" />
              ) : (
                <span className="text-xs text-[var(--text-muted)]">Steps 2 &amp; 3</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1: Target Career */}
              <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    <Compass className="w-4 h-4 text-[var(--primary-color)]" aria-hidden="true" />
                    <span>Target Career</span>
                  </div>
                  {profile?.selectedCareerId ? (
                    <div>
                      <p className="text-sm font-bold text-[var(--text-main)]">
                        {careerName || profile.selectedCareerId}
                      </p>
                      <p className="text-[11px] text-[var(--success-color)] font-medium mt-0.5">
                        Selected &amp; active
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-muted)]">
                        No career selected yet
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]/80 mt-0.5">
                        Choose the tech role you are aiming for
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Button
                    to="/career"
                    variant={profile?.selectedCareerId ? 'secondary' : 'primary'}
                    size="sm"
                    className="w-full justify-center text-xs"
                  >
                    {profile?.selectedCareerId ? 'Change Career' : 'Select Career'}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Step 2: Uploaded Resume */}
              <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    <FileText className="w-4 h-4 text-[var(--accent-color)]" aria-hidden="true" />
                    <span>Resume Document</span>
                  </div>
                  {resumeData ? (
                    <div>
                      <p className="text-sm font-bold text-[var(--text-main)] truncate" title={resumeData.originalFileName}>
                        {resumeData.originalFileName}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                        {formatFileSize(resumeData.fileSize)} • Uploaded{' '}
                        {new Date(resumeData.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-muted)]">
                        No resume uploaded yet
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]/80 mt-0.5">
                        Upload your PDF or DOCX resume
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Button
                    to="/resume"
                    variant={resumeData ? 'secondary' : 'primary'}
                    size="sm"
                    className="w-full justify-center text-xs"
                  >
                    {resumeData ? 'Manage Resume' : 'Upload Resume'}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Honest Roadmap Notice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-color)] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Roadmap Milestone Checkpoint</span>
            </div>
            <p className="text-sm text-[var(--text-main)] font-medium">
              Phase 4: Career Selection &amp; Setup is active.
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              The full student analytics dashboard—featuring personalized radar charts, interactive roadmap milestones, and gap diagnostics—is scheduled and built in <strong>Phase 12</strong>. This page displays genuine data loaded from your verified Firestore profile.
            </p>
          </div>

          {/* Profile Card */}
          <Card className="p-6 sm:p-8 space-y-6 border-[var(--border-color)] bg-[var(--surface-color)] shadow-md">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                Verified Account Profile
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Real profile data loaded from GET /api/users/me via Firebase Admin SDK.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Display Name
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-main)] truncate">
                    {profile?.displayName || user?.displayName || '—'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Email Address
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-main)] truncate">
                    {profile?.email || user?.email || '—'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center gap-3 sm:col-span-2">
                <div className="w-9 h-9 rounded-lg bg-[var(--highlight-color)]/10 text-[var(--highlight-color)] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Member Since
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-main)]">
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Update Form */}
            <div className="pt-6 border-t border-[var(--border-color)] space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-main)]">
                  Update Display Name
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Sends PATCH /api/users/me with Zod server-side validation.
                </p>
              </div>

              {successMessage && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-[var(--success-color)]/10 border border-[var(--success-color)]/30 text-[var(--success-color)] text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/30 text-[var(--danger-color)] text-xs font-semibold"
                >
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label
                    htmlFor="displayName"
                    className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider"
                  >
                    New Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.displayName}
                    aria-describedby={errors.displayName ? 'displayName-error' : undefined}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
                    {...register('displayName')}
                  />
                  {errors.displayName && (
                    <p id="displayName-error" className="text-xs text-[var(--danger-color)] mt-1">
                      {errors.displayName.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Updating Profile...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
