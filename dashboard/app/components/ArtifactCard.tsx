'use client';
import { Artifact } from '../lib/api';
import { Play, Clock, CheckCircle2, XCircle, Loader2, Bot } from 'lucide-react';

interface Props {
  artifact: Artifact;
  onRun: (id: string) => void;
  running: boolean;
  onClick: () => void;
}

const typeColors: Record<string, string> = {
  report: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  data: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  image: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function ArtifactCard({ artifact, onRun, running, onClick }: Props) {
  const isClaudeExecutor = artifact.executor === 'claude';

  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{artifact.name}</h3>
            {isClaudeExecutor && (
              <span title="Ejecutado por Claude" className="shrink-0">
                <Bot size={14} className="text-orange-400" />
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 line-clamp-2">{artifact.description}</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onRun(artifact.id); }}
          disabled={running}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm text-white"
        >
          {running
            ? <Loader2 size={14} className="animate-spin" />
            : <Play size={14} />}
          {running ? 'Running' : 'Run'}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[artifact.type] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
          {artifact.type}
        </span>
        <span className="text-xs text-zinc-500 flex items-center gap-1">
          <Clock size={11} /> {artifact.schedule}
        </span>
        {artifact.lastRun && (
          <span className="text-xs text-zinc-500 flex items-center gap-1 ml-auto">
            {artifact.lastRunStatus === 'success'
              ? <CheckCircle2 size={12} className="text-green-400" />
              : <XCircle size={12} className="text-red-400" />}
            {new Date(artifact.lastRun).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
