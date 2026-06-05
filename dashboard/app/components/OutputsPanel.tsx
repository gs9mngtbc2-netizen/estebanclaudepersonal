'use client';
import { OutputFile } from '../lib/api';
import { FileJson, Clock } from 'lucide-react';

interface Props {
  artifactId: string;
  outputs: OutputFile[];
}

export default function OutputsPanel({ artifactId, outputs }: Props) {
  if (!outputs.length) return (
    <p className="text-zinc-500 text-sm">Sin outputs todavía.</p>
  );

  return (
    <div className="space-y-2">
      {outputs
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((o, i) => (
          <div key={o.file} className="flex items-center gap-3 bg-zinc-800/40 rounded-lg px-3 py-2 text-sm">
            <FileJson size={14} className="text-blue-400 shrink-0" />
            <span className="flex-1 text-zinc-300 font-mono truncate text-xs">{o.file}</span>
            {i === 0 && (
              <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full">latest</span>
            )}
            <span className="text-zinc-500 text-xs flex items-center gap-1">
              <Clock size={10} />
              {new Date(o.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-zinc-600 text-xs">{(o.size / 1024).toFixed(1)}kb</span>
          </div>
        ))}
    </div>
  );
}
