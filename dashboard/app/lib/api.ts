const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Artifact {
  id: string;
  name: string;
  description: string;
  type: string;
  schedule: string;
  executor: string;
  status: 'idle' | 'running';
  lastRun: string | null;
  lastRunStatus: 'success' | 'error' | null;
  createdAt: string;
}

export interface OutputFile {
  file: string;
  size: number;
  createdAt: string;
}

export interface ArtifactDetail {
  artifact: Artifact;
  outputs: OutputFile[];
}

export async function fetchArtifacts(): Promise<Artifact[]> {
  const res = await fetch(`${BASE}/artifacts`, { cache: 'no-store' });
  const data = await res.json();
  return data.artifacts;
}

export async function fetchArtifact(id: string): Promise<ArtifactDetail> {
  const res = await fetch(`${BASE}/artifacts/${id}`, { cache: 'no-store' });
  return res.json();
}

export async function runArtifact(id: string) {
  const res = await fetch(`${BASE}/artifacts/${id}/run`, { method: 'POST' });
  return res.json();
}

export async function fetchLatestOutput(id: string) {
  const detail = await fetchArtifact(id);
  if (!detail.outputs.length) return null;
  const latest = detail.outputs.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  // The API saves files to artifacts/ dir — read via a dedicated endpoint we'll add
  return latest;
}
