const express = require('express');
const router = express.Router();
const service = require('../services/artifactService');

// GET /artifacts?type=report&schedule=weekly
router.get('/', (req, res) => {
  const { type, schedule } = req.query;
  const artifacts = service.getAll({ type, schedule });
  res.json({ count: artifacts.length, artifacts });
});

// GET /artifacts/:id
router.get('/:id', (req, res) => {
  const artifact = service.getById(req.params.id);
  if (!artifact) return res.status(404).json({ error: 'Artifact not found' });
  const outputs = service.getOutputFiles(artifact.id);
  res.json({ artifact, outputs });
});

// POST /artifacts — create new artifact definition
router.post('/', (req, res) => {
  const { name, description, type, schedule, cronExpression } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const artifact = service.create({ name, description, type, schedule, cronExpression });
  res.status(201).json(artifact);
});

// POST /artifacts/:id/run — trigger artifact manually
router.post('/:id/run', async (req, res) => {
  const artifact = service.getById(req.params.id);
  if (!artifact) return res.status(404).json({ error: 'Artifact not found' });

  if (artifact.executor === 'claude') {
    return res.status(202).json({
      message: 'This artifact is executed by Claude. Ask Claude to run it.',
      artifactId: artifact.id,
      name: artifact.name,
    });
  }

  try {
    const result = await service.run(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /artifacts/:id/output — Claude pushes output directly
router.post('/:id/output', (req, res) => {
  const artifact = service.getById(req.params.id);
  if (!artifact) return res.status(404).json({ error: 'Artifact not found' });
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'data is required' });
  const result = service.saveOutput(req.params.id, data);
  res.status(201).json(result);
});

// GET /artifacts/:id/outputs — list output files for an artifact
router.get('/:id/outputs', (req, res) => {
  const artifact = service.getById(req.params.id);
  if (!artifact) return res.status(404).json({ error: 'Artifact not found' });
  const outputs = service.getOutputFiles(artifact.id);
  res.json({ artifactId: req.params.id, outputs });
});

module.exports = router;
