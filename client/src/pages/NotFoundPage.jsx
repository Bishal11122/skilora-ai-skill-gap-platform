import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

/**
 * 404 Not Found Page.
 */
export default function NotFoundPage() {
  return (
    <div className="py-24 sm:py-32 min-h-[70vh] flex items-center justify-center">
      <Container size="narrow">
        <Card className="text-center max-w-lg mx-auto p-8 sm:p-10 space-y-6 shadow-md">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--danger-color)]/10 text-[var(--danger-color)] flex items-center justify-center border border-[var(--danger-color)]/20">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--danger-color)] font-bold">
              Error 404
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              Page Not Found
            </h1>
          </div>

          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            The page you are looking for does not exist or may have been moved.
          </p>

          <div className="pt-4 flex justify-center">
            <Button to="/" variant="primary" size="md">
              <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Back to Home
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
