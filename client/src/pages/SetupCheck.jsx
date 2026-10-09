import { useState, useEffect } from 'react';
import { get } from '../services/api';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Skill Gap Platform - Setup Check
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Phase 2: Project Scaffolding & Health Verification
          </p>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-6 text-slate-600">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm font-medium">Checking backend connection...</p>
            </div>
          )}

          {!loading && healthData && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex items-center space-x-2 text-emerald-700 font-semibold mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Backend: connected</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1 font-mono bg-white/70 p-3 rounded border border-emerald-100">
                <p><strong>Status:</strong> {healthData.status}</p>
                <p><strong>Service:</strong> {healthData.service}</p>
                <p><strong>Timestamp:</strong> {healthData.time}</p>
              </div>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
              <div className="flex items-center space-x-2 text-rose-700 font-semibold mb-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Backend: not reachable</span>
              </div>
              <p className="text-xs text-rose-600 mb-3">{errorMessage}</p>
              <button
                type="button"
                onClick={checkHealth}
                className="inline-flex items-center text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Connection
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Client: React + Vite + Tailwind</span>
            <span>API: Node + Express</span>
          </div>
        </div>
      </div>
    </div>
  );
}
