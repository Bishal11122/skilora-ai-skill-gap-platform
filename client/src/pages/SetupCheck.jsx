import { useState, useEffect } from 'react';
import { get } from '../services/api';
import { CheckCircle2, XCircle, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

/**
 * System Health Check page preserved from Phase 2 and styled with Phase 3 design tokens.
 * Performs a real GET request to /api/health and displays genuine connection status.
 */
export default function SetupCheck() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setErrorMessage(null);
    setHealthData(null);

    const { data, error } = await get('/health');

    if (error) {
      setErrorMessage(error);
    } else {
      setHealthData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="py-16 sm:py-24 min-h-[75vh] flex items-center justify-center">
      <Container size="narrow">
        <Card className="max-w-md mx-auto p-6 sm:p-8 space-y-6 shadow-md">
          <div className="text-center space-y-2">
            <Badge variant="sage">Phase 2 Verification</Badge>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">
              System Health Check
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Verifying live connection between React client and Express API
            </p>
          </div>

          <div className="space-y-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-6 text-[var(--text-muted)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-color)] mb-2" />
                <p className="text-sm font-medium">Querying GET /api/health...</p>
              </div>
            )}

            {!loading && healthData && (
              <div className="rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  <span>Backend: connected</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] space-y-1 font-mono bg-[var(--surface-color)] p-3 rounded-lg border border-[var(--border-color)]">
                  <p><strong className="text-[var(--text-main)]">Status:</strong> {healthData.status}</p>
                  <p><strong className="text-[var(--text-main)]">Service:</strong> {healthData.service}</p>
                  <p><strong className="text-[var(--text-main)]">Timestamp:</strong> {healthData.time}</p>
                </div>
              </div>
            )}

            {!loading && errorMessage && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm">
                  <XCircle className="w-5 h-5" aria-hidden="true" />
                  <span>Backend: not reachable</span>
                </div>
                <p className="text-xs text-rose-400 leading-relaxed">{errorMessage}</p>
                <button
                  type="button"
                  onClick={checkHealth}
                  className="inline-flex items-center text-xs font-medium text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Retry Connection
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Client: React + Vite + Tailwind</span>
              <span>API: Node + Express</span>
            </div>

            <div className="pt-2 flex justify-center">
              <Button to="/" variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                Back to Home
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
