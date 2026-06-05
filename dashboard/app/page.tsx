'use client';
import { useEffect, useState } from 'react';
import { fetchArtifacts, fetchArtifact, runArtifact, Artifact, ArtifactDetail } from './lib/api';
import ArtifactCard from './components/ArtifactCard';
import StravaWidget from './components/StravaWidget';
import OutputsPanel from './components/OutputsPanel';
import { X, Bot } from 'lucide-react';

export default function Home() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<ArtifactDetail | null>(null);
  const [runMsg, setRunMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchArtifacts().then(setArtifacts);
  }, []);

  async function handleRun(id: string) {
    setRunning(r => ({ ...r, [id]: true }));
    const res = await runArtifact(id);
    setRunning(r => ({ ...r, [id]: false }));
    if (res.message) {
      setRunMsg(res.message);
    } else {
      setArtifacts(await fetchArtifacts());
    }
  }

  async function handleSelect(id: string) {
    const detail = await fetchArtifact(id);
    setSelected(detail);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-0.5">Artefactos activos y métricas semanales</p>
          </div>
          <div className="text-xs text-zinc-600 flex items-center gap-1.5">
            <Bot size={12} className="text-orange-400" /> = ejecutado por Claude
          </div>
        </div>

        <StravaWidget />

        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Artefactos</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {artifacts.map(a => (
              <ArtifactCard
                key={a.id}
                artifact={a}
                onRun={handleRun}
                running={!!running[a.id]}
                onClick={() => handleSelect(a.id)}
              />
            ))}
          </div>
        </div>

        {runMsg && (
          <div className="fixed bottom-6 right-6 max-w-sm bg-zinc-800 border border-orange-500/30 rounded-xl p-4 shadow-xl flex gap-3 items-start">
            <Bot size={16} className="text-orange-400 mt-0.5 shrink-0" />
            <p className="text-sm text-zinc-300 flex-1">{runMsg}</p>
            <button onClick={() => setRunMsg(null)} className="text-zinc-500 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-end" onClick={() => setSelected(null)}>
            <div className="bg-zinc-900 border-l border-zinc-800 w-full max-w-md h-full overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">{selected.artifact.name}</h2>
                <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-zinc-400">{selected.artifact.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Tipo', selected.artifact.type],
                  ['Schedule', selected.artifact.schedule],
                  ['Executor', selected.artifact.executor],
                  ['Último run', selected.artifact.lastRun ? new Date(selected.artifact.lastRun).toLocaleDateString('es-ES') : '—'],
                  ['Estado', selected.artifact.lastRunStatus ?? '—'],
                  ['Outputs', String(selected.outputs.length)],
                ].map(([k, v]) => (
                  <div key={k} className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="text-zinc-500 text-xs mb-1">{k}</div>
                    <div className="text-white font-medium">{v}</div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 mb-3">Historial de outputs</h3>
                <OutputsPanel artifactId={selected.artifact.id} outputs={selected.outputs} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
