import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);

  const rawDestination = location.state?.from?.pathname;
  const isSafeInternalPath =
    typeof rawDestination === 'string' &&
    rawDestination.startsWith('/') &&
    !rawDestination.startsWith('//') &&
    rawDestination !== '/login' &&
    rawDestination !== '/register';

  const destination = isSafeInternalPath ? rawDestination : '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Incorrect email or password.');
    }
  };

  return (
    <div className="py-16 sm:py-24 min-h-[75vh] flex items-center justify-center">
      <Container size="narrow">
        <Card className="max-w-md mx-auto p-6 sm:p-8 space-y-6 shadow-md border-[var(--border-color)] bg-[var(--surface-color)]">
          <div className="text-center space-y-2">
            <Badge variant="plum">Account Sign In</Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
              Welcome Back to Skillora AI
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Continue your structured career development roadmap.
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[var(--primary-color)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] rounded"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Register Link */}
          <div className="pt-4 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
            Don&apos;t have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-[var(--primary-color)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] rounded"
            >
              Create Account
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
