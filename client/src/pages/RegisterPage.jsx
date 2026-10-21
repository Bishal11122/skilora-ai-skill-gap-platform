import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters')
      .max(60, 'Display name cannot exceed 60 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      await registerUser(data.displayName, data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="py-16 sm:py-24 min-h-[75vh] flex items-center justify-center">
      <Container size="narrow">
        <Card className="max-w-md mx-auto p-6 sm:p-8 space-y-6 shadow-md border-[var(--border-color)] bg-[var(--surface-color)]">
          <div className="text-center space-y-2">
            <Badge variant="plum">Account Registration</Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
              Create Your Skillora AI Account
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Begin your structured skill gap analysis and personalized roadmap.
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/25 text-[var(--danger-color)] text-xs sm:text-sm font-medium"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Display Name Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="displayName"
                className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider"
              >
                Full Name
              </label>
              <input
                id="displayName"
                type="text"
                autoComplete="name"
                disabled={isSubmitting}
                aria-invalid={!!errors.displayName}
                aria-describedby={errors.displayName ? 'displayName-error' : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
                placeholder="e.g. Alex Sharma"
                {...register('displayName')}
              />
              {errors.displayName && (
                <p id="displayName-error" className="text-xs text-[var(--danger-color)] mt-1">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider"
              >
                Email Address
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider"
              >
                Password (min. 8 characters)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-xs text-[var(--danger-color)] mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-xs text-[var(--danger-color)] mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Login Link */}
          <div className="pt-4 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[var(--primary-color)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] rounded"
            >
              Sign In
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
