import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  RefreshCw,
  X,
  Compass,
  AlertTriangle,
  Info,
  Clock,
  HardDrive,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth, uploadAuth, deleteAuth } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ResumeUploadPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [existingResume, setExistingResume] = useState(null);
  const [targetCareerName, setTargetCareerName] = useState('');

  // Selected file state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);

  // Upload progress & states
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Action confirmations
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // In-flight abort controller
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadResumeAndCareer() {
      setLoading(true);
      setErrorMessage(null);

      // Verify career selected
      const userRes = await getAuth('/users/me');
      const activeCareerId = userRes.data?.selectedCareerId || profile?.selectedCareerId;

      if (!activeCareerId) {
        if (isMounted) {
          navigate('/career', {
            replace: true,
            state: { message: 'Please select a target career before uploading your resume.' },
          });
        }
        return;
      }

      // Fetch career list to resolve career name
      const [resumeRes, careersRes] = await Promise.all([
        getAuth('/resume'),
        getAuth('/careers'),
      ]);

      if (!isMounted) return;

      if (careersRes.data && activeCareerId) {
        const found = careersRes.data.find((c) => c.id === activeCareerId);
        setTargetCareerName(found ? found.name : activeCareerId);
      }

      if (resumeRes.data?.resume) {
        setExistingResume(resumeRes.data.resume);
      } else {
        setExistingResume(null);
      }

      setLoading(false);
    }

    loadResumeAndCareer();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [profile?.selectedCareerId, navigate]);

  const validateLocalFile = (file) => {
    if (!file) return null;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.docx')) {
      return 'Only .pdf and .docx documents are supported.';
    }

    if (file.size === 0) {
      return 'The selected file is empty (0 bytes).';
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size (${formatBytes(file.size)}) exceeds the maximum allowed limit of 5 MB.`;
    }

    return null;
  };

  const handleFileChange = (e) => {
    setFileError(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateLocalFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setConsentChecked(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setErrorMessage('Upload was cancelled.');
  };

  const handleUploadSubmit = async (isReplace = false) => {
    if (!selectedFile) {
      setFileError('Please select a resume file first.');
      return;
    }

    if (!consentChecked) {
      setErrorMessage('Explicit consent is required to store your resume privately.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('consent', 'true');

    const method = isReplace ? 'PUT' : 'POST';

    const { data, error, aborted, status } = await uploadAuth('/resume', formData, {
      method,
      signal: controller.signal,
    });

    setIsUploading(false);
    abortControllerRef.current = null;

    if (aborted) {
      return;
    }

    if (error) {
      if (status === 503) {
        setErrorMessage(
          'Private Storage service is not yet configured on the server. Please notify the administrator to configure Supabase Storage.'
        );
      } else {
        setErrorMessage(error);
      }
      return;
    }

    if (data?.resume) {
      setExistingResume(data.resume);
      setSelectedFile(null);
      setConsentChecked(false);
      setConfirmReplace(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccessMessage(
        isReplace
          ? 'Resume replaced successfully in private storage.'
          : 'Resume uploaded successfully to private storage.'
      );
    }
  };

  const handleDeleteResume = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await deleteAuth('/resume');

    setIsDeleting(false);
    setConfirmDelete(false);

    if (error) {
      setErrorMessage(error);
      return;
    }

    setExistingResume(null);
    setSelectedFile(null);
    setConsentChecked(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSuccessMessage('Resume and stored metadata have been deleted completely.');
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" aria-hidden="true" />
        <p className="text-sm font-medium text-[var(--text-muted)]">
          Checking your target career &amp; resume status...
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 min-h-[75vh]">
      <Container size="default">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2">
              <Badge variant="plum">Phase 5 Milestone</Badge>
              <Badge variant="sage">Private Storage</Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-main)]">
              Upload Your Technical Resume
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
              Your resume is stored privately in encrypted cloud storage for your account only. It will
              be used in later phases for AI skill extraction and gap analysis against your target
              career benchmark.
            </p>
          </div>

          {/* Active Career Goal Banner */}
          <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Active Career Benchmark
                </p>
                <p className="text-sm font-bold text-[var(--text-main)] truncate">
                  {targetCareerName || 'Target Career Selected'}
                </p>
              </div>
            </div>

            <Link
              to="/career"
              className="text-xs font-semibold text-[var(--primary-color)] hover:underline self-start sm:self-auto shrink-0 focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] rounded"
            >
              Change Goal
            </Link>
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

          {/* Existing Saved Resume Card */}
          {existingResume && (
            <Card className="p-6 sm:p-7 border-[var(--border-color)] bg-[var(--surface-color)] shadow-md space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--success-color)]/10 text-[var(--success-color)] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--success-color)] uppercase tracking-wider">
                        Active Stored Resume
                      </span>
                    </div>
                    <p className="text-base font-bold text-[var(--text-main)] truncate mt-0.5">
                      {existingResume.originalFileName}
                    </p>
                  </div>
                </div>

                <Badge variant="sage">Private Storage</Badge>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-0.5">
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                    <HardDrive className="w-3 h-3" /> Size
                  </span>
                  <p className="font-semibold text-[var(--text-main)] font-mono">
                    {formatBytes(existingResume.fileSize)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-0.5">
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Format
                  </span>
                  <p className="font-semibold text-[var(--text-main)] uppercase font-mono">
                    {existingResume.contentType?.includes('word') ? 'DOCX' : 'PDF'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Uploaded
                  </span>
                  <p className="font-semibold text-[var(--text-main)]">
                    {new Date(existingResume.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Honest Roadmap Note */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
                <Info className="w-4 h-4 text-[var(--accent-color)] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="leading-relaxed">
                  <strong>What happens next:</strong> Automatic resume parsing, skill extraction, and
                  gap calculation are scheduled for <strong>Phase 6 &amp; 8</strong>. No mock analysis
                  or fake scores are generated here.
                </p>
              </div>

              {/* Existing Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-color)]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmReplace(true)}
                  disabled={confirmDelete || confirmReplace}
                  className="text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Replace Resume
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  disabled={confirmDelete || confirmReplace}
                  className="text-xs text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10 hover:border-[var(--danger-color)]/30"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete Resume
                </Button>
              </div>

              {/* Delete Confirmation Modal */}
              {confirmDelete && (
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="confirm-delete-title"
                  className="p-4 rounded-xl bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/30 space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--danger-color)]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span id="confirm-delete-title">Confirm Resume Deletion</span>
                  </div>
                  <p className="text-xs text-[var(--text-main)] leading-relaxed">
                    This will permanently delete your stored resume file and all associated metadata
                    from private Cloud Storage and Cloud Firestore. Are you sure?
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                      disabled={isDeleting}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleDeleteResume}
                      disabled={isDeleting}
                      className="text-xs bg-[var(--danger-color)] hover:bg-[var(--danger-color)]/90 text-white"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Completely'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Upload Form Card (shown when no resume exists, or when replacing) */}
          {(!existingResume || confirmReplace) && (
            <Card className="p-6 sm:p-8 border-[var(--border-color)] bg-[var(--surface-color)] shadow-md space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight">
                  {existingResume ? 'Select Replacement Document' : 'Select Resume File'}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Supported formats: PDF or DOCX (max 5 MB).
                </p>
              </div>

              {/* Drag & Drop / Native File Input Zone */}
              <div className="space-y-3">
                <label
                  htmlFor="resume-file-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]"
                >
                  Resume File (.pdf or .docx)
                </label>

                <div
                  className={`relative p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-3 ${
                    fileError
                      ? 'border-[var(--danger-color)]/50 bg-[var(--danger-color)]/[0.03]'
                      : selectedFile
                      ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/[0.03]'
                      : 'border-[var(--border-color)] bg-[var(--surface-elevated)] hover:border-[var(--primary-color)]/60'
                  }`}
                >
                  <input
                    id="resume-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={isUploading}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Upload resume file in PDF or DOCX format"
                  />

                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center pointer-events-none">
                    <Upload className="w-6 h-6" aria-hidden="true" />
                  </div>

                  <div className="space-y-1 pointer-events-none">
                    <p className="text-sm font-semibold text-[var(--text-main)]">
                      {selectedFile ? 'Change Selected File' : 'Click to Browse or Drag File Here'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      PDF and DOCX only • 5 MB maximum file size
                    </p>
                  </div>
                </div>

                {fileError && (
                  <p role="alert" className="text-xs text-[var(--danger-color)] font-medium">
                    {fileError}
                  </p>
                )}
              </div>

              {/* Selected File Preview Box */}
              {selectedFile && (
                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-main)] truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono">
                        {formatBytes(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  {!isUploading && (
                    <button
                      type="button"
                      onClick={handleRemoveSelectedFile}
                      aria-label="Remove chosen file"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Consent Checkbox */}
              <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    disabled={isUploading}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--focus-ring)] cursor-pointer"
                  />
                  <span className="text-xs text-[var(--text-main)] leading-relaxed font-medium">
                    I agree that Skilora stores my resume file privately so it can be analyzed later.
                    I can delete it at any time.
                  </span>
                </label>
              </div>

              {/* Actions & In-flight upload state */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border-color)]">
                {confirmReplace ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => {
                      setConfirmReplace(false);
                      handleRemoveSelectedFile();
                    }}
                  >
                    Cancel Replacement
                  </Button>
                ) : (
                  <Button to="/career" variant="ghost" size="sm" disabled={isUploading}>
                    Back to Career Selection
                  </Button>
                )}

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {isUploading && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleCancelUpload}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    disabled={!selectedFile || !consentChecked || isUploading}
                    onClick={() => handleUploadSubmit(Boolean(existingResume))}
                    className="w-full sm:w-auto justify-center"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Uploading to Private Storage...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                        {existingResume ? 'Save & Replace' : 'Upload Resume'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Navigation to Dashboard */}
          <div className="text-center pt-4">
            <Link
              to="/dashboard"
              className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] underline focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] rounded"
            >
              Return to Student Dashboard
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
