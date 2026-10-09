import { ArrowLeft, Clock } from 'lucide-react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

/**
 * Reusable placeholder page for future authentication routes (Phase 4).
 * Strictly contains no mock forms, credentials inputs, or fake authentication logic.
 */
export default function PlaceholderPage({ title, message, badge = 'Phase 4 Feature' }) {
  return (
    <div className="py-20 sm:py-28 min-h-[70vh] flex items-center justify-center">
      <Container size="narrow">
        <Card className="text-center max-w-lg mx-auto p-8 sm:p-10 space-y-6 shadow-md">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center border border-[var(--primary-color)]/20">
            <Clock className="w-7 h-7" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <Badge variant="plum">{badge}</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              {title}
            </h1>
          </div>

          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            {message}
          </p>

          <div className="pt-4 flex justify-center">
            <Button to="/" variant="secondary" size="md">
              <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Back to Home
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
