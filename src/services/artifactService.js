const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_PATH = path.join(__dirname, '../data/artifacts.json');
const ARTIFACTS_DIR = path.join(__dirname, '../../artifacts');

function readArtifacts() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeArtifacts(artifacts) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(artifacts, null, 2));
}

function getAll(filters = {}) {
  let artifacts = readArtifacts();
  if (filters.type) {
    artifacts = artifacts.filter(a => a.type === filters.type);
  }
  if (filters.schedule) {
    artifacts = artifacts.filter(a => a.schedule === filters.schedule);
  }
  return artifacts;
}

function getById(id) {
  return readArtifacts().find(a => a.id === id) || null;
}

function create(data) {
  const artifacts = readArtifacts();
  const artifact = {
    id: `artifact-${uuidv4().split('-')[0]}`,
    name: data.name,
    description: data.description || '',
    type: data.type || 'data',
    schedule: data.schedule || 'manual',
    cronExpression: data.cronExpression || null,
    status: 'idle',
    lastRun: null,
    lastRunStatus: null,
    createdAt: new Date().toISOString(),
  };
  artifacts.push(artifact);
  writeArtifacts(artifacts);
  return artifact;
}

function updateStatus(id, status, lastRunStatus = null) {
  const artifacts = readArtifacts();
  const idx = artifacts.findIndex(a => a.id === id);
  if (idx === -1) return null;
  artifacts[idx].status = status;
  if (lastRunStatus) {
    artifacts[idx].lastRun = new Date().toISOString();
    artifacts[idx].lastRunStatus = lastRunStatus;
    artifacts[idx].status = 'idle';
  }
  writeArtifacts(artifacts);
  return artifacts[idx];
}

// Simulates running an artifact — replace with real logic per artifact
async function run(id) {
  const artifact = getById(id);
  if (!artifact) throw new Error(`Artifact ${id} not found`);

  updateStatus(id, 'running');

  return new Promise((resolve) => {
    setTimeout(() => {
      const outputFile = path.join(ARTIFACTS_DIR, `${id}-${Date.now()}.json`);
      const output = {
        artifactId: id,
        name: artifact.name,
        runAt: new Date().toISOString(),
        result: `Executed successfully`,
      };
      fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
      updateStatus(id, 'idle', 'success');
      resolve({ success: true, outputFile: path.basename(outputFile), output });
    }, 1000);
  });
}

function getOutputFiles(id) {
  const files = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.startsWith(id));
  return files.map(f => {
    const full = path.join(ARTIFACTS_DIR, f);
    const stat = fs.statSync(full);
    return { file: f, size: stat.size, createdAt: stat.birthtime };
  });
}

function getLatestOutput(id) {
  const files = fs.readdirSync(ARTIFACTS_DIR)
    .filter(f => f.startsWith(id) && f.endsWith('.json'))
    .sort()
    .reverse();
  if (!files.length) return null;
  return JSON.parse(fs.readFileSync(path.join(ARTIFACTS_DIR, files[0]), 'utf-8'));
}

function saveOutput(id, data) {
  const artifact = getById(id);
  if (!artifact) throw new Error(`Artifact ${id} not found`);
  const outputFile = path.join(ARTIFACTS_DIR, `${id}-${Date.now()}.json`);
  const payload = { artifactId: id, name: artifact.name, savedAt: new Date().toISOString(), data };
  fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
  updateStatus(id, 'idle', 'success');
  return { success: true, outputFile: path.basename(outputFile) };
}

module.exports = { getAll, getById, create, updateStatus, run, saveOutput, getOutputFiles, getLatestOutput };
