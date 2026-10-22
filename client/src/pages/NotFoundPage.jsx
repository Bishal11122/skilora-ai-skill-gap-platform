import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

/**
 * 404 Not Found Page.
 */
export default function NotFoundPage() {
  return (
    <div className="relative py-24 sm:py-32 min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Soft Pastel Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-r from-rose-100/30 via-violet-100/30 to-sky-100/30 dark:from-rose-950/20 dark:via-purple-950/20 dark:to-sky-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container size="narrow">
        <Card variant="glass" className="text-center max-w-lg mx-auto p-8 sm:p-10 space-y-6 shadow-xl rounded-3xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--danger-color)]/10 text-[var(--danger-color)] flex items-center justify-center border border-[var(--danger-color)]/20">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--danger-color)] font-bold">
              Error 404
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-heading">
              Page Not Found
            </h1>
          </div>

          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
            The page you are looking for does not exist or may have been moved.
          </p>

          <div className="pt-2 flex justify-center">
            <Button to="/" variant="primary" size="md" pill className="shadow-md shadow-primary-500/20">
              <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Back to Home
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
