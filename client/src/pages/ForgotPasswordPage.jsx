import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [successSent, setSuccessSent] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      await resetPassword(data.email);
      setSuccessSent(true);
    } catch (err) {
      // Show safe message without leaking user existence
      setServerError(err.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="py-16 sm:py-24 min-h-[75vh] flex items-center justify-center">
      <Container size="narrow">
        <Card className="max-w-md mx-auto p-6 sm:p-8 space-y-6 shadow-md border-[var(--border-color)] bg-[var(--surface-color)]">
          <div className="text-center space-y-2">
            <Badge variant="plum">Password Recovery</Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Enter the email associated with your account, and we will send a password reset link.
            </p>
          </div>

          {successSent ? (
            <div className="space-y-4">
              <div
                role="status"
                className="p-4 rounded-xl bg-[var(--accent-color)]/15 border border-[var(--accent-color)]/30 text-[var(--text-main)] text-sm space-y-2"
              >
                <div className="flex items-center gap-2 font-semibold text-[var(--accent-color)]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Reset Link Dispatched</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  If an account exists for that email, a password reset email has been sent. Please check your inbox and spam folders.
                </p>
              </div>

              <div className="pt-2 text-center">
                <Button to="/login" variant="secondary" size="md">
                  <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Return to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <>
              {serverError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/25 text-[var(--danger-color)] text-xs sm:text-sm font-medium"
                >
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider"
                  >
                    Account Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
                    placeholder="student@example.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-[var(--danger-color)] mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full justify-center mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Sending Instructions...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" aria-hidden="true" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[var(--primary-color)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] rounded"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </Card>
      </Container>
    </div>
  );
}
