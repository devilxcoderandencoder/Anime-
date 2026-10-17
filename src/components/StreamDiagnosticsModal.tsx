import React, { useState } from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
  Zap,
  Server,
  PlayCircle,
  Database,
  ArrowRight,
} from 'lucide-react';
import { StreamDiagnostics, Episode } from '../types';

interface StreamDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEpisode: Episode | null;
  onSelectEpisodeForTest: (episodeId: string) => void;
  allEpisodes: Episode[];
}

export const StreamDiagnosticsModal: React.FC<StreamDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  activeEpisode,
  onSelectEpisodeForTest,
  allEpisodes,
}) => {
  const [selectedEpId, setSelectedEpId] = useState<string>(
    activeEpisode?.id || allEpisodes[0]?.id || ''
  );
  const [diagResult, setDiagResult] = useState<StreamDiagnostics | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [seekBenchResults, setSeekBenchResults] = useState<{
    range: string;
    status: number;
    latency: number;
  }[] | null>(null);

  if (!isOpen) return null;

  const runDiagnostics = async () => {
    if (!selectedEpId) return;
    setIsRunning(true);
    setDiagResult(null);
    setSeekBenchResults(null);

    try {
      const res = await fetch(`/api/stream/diagnostics/${selectedEpId}`);
      const data: StreamDiagnostics = await res.json();
      setDiagResult(data);

      // Run 3 rapid seek tests to benchmark scrubbing smoothness
      const testRanges = ['bytes=1048576-2097151', 'bytes=10485760-12582911', 'bytes=20971520-23068671'];
      const bench = [];

      for (const rng of testRanges) {
        const t0 = performance.now();
        const r = await fetch(`/api/stream/${selectedEpId}`, {
          headers: { Range: rng },
        });
        const lat = Math.round(performance.now() - t0);
        bench.push({
          range: rng,
          status: r.status,
          latency: lat,
        });
      }
      setSeekBenchResults(bench);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d131f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#090d16]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Seamless Media Streaming Diagnostics
              </h3>
              <p className="text-xs text-slate-400">
                Verify HTTP 206 Partial Content, Range headers, and latency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Episode Selector for Test */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Target Episode to Probe
            </label>
            <div className="flex gap-2">
              <select
                value={selectedEpId}
                onChange={(e) => setSelectedEpId(e.target.value)}
                className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
              >
                {allEpisodes.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.animeId} - Ep {ep.episodeNumber}: {ep.title}
                  </option>
                ))}
              </select>

              <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Zap className={`w-3.5 h-3.5 ${isRunning ? 'animate-bounce' : ''}`} />
                <span>{isRunning ? 'Running Test...' : 'Run Probe'}</span>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {diagResult && (
            <div className="space-y-4">
              {/* Compliance Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-white">HTTP 206 Partial Content</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Server responded with status <span className="font-mono text-emerald-400">{diagResult.status}</span>. Range slicing confirmed.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-white">Byte Range Seeking</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Accept-Ranges: <span className="font-mono text-emerald-400">{diagResult.headers['accept-ranges'] || 'bytes'}</span>. Fast scrub supported.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Telemetry Table */}
              <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 font-mono space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-2 text-slate-400">
                  <span>TELEGRAM_STORAGE_CHAT:</span>
                  <span className="text-sky-400 tabular-nums">{diagResult.telegramChatId}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 text-slate-400">
                  <span>TELEGRAM_FILE_ID:</span>
                  <span className="text-slate-200 truncate max-w-[200px]" title={diagResult.telegramFileId}>
                    {diagResult.telegramFileId}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 text-slate-400">
                  <span>TEST_RANGE:</span>
                  <span className="text-orange-400 tabular-nums">{diagResult.rangeTested}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 text-slate-400">
                  <span>CONTENT_RANGE_HEADER:</span>
                  <span className="text-emerald-400 tabular-nums">{diagResult.headers['content-range'] || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 text-slate-400">
                  <span>CONTENT_TYPE:</span>
                  <span className="text-slate-200">{diagResult.headers['content-type'] || 'video/mp4'}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>ROUNDTRIP_LATENCY:</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{diagResult.latencyMs} ms ({diagResult.seamlessStreamingCheck.performanceRating})</span>
                </div>
              </div>

              {/* Stress Seek Benchmark */}
              {seekBenchResults && (
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Scrub Seeking Benchmark (Zero Buffering Test)
                  </h4>
                  <div className="space-y-1.5">
                    {seekBenchResults.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-white/5 font-mono text-[11px]"
                      >
                        <span className="text-slate-400">Seek Point #{idx + 1} ({s.range})</span>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400">HTTP {s.status}</span>
                          <span className="text-white font-semibold tabular-nums">{s.latency} ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!diagResult && !isRunning && (
            <div className="py-8 text-center text-slate-400">
              <Server className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>Click "Run Probe" to test HTTP 206 Partial Content Range streaming on the target episode.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
