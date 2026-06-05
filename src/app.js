require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const artifactService = require('./services/artifactService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/artifacts', require('./routes/artifacts'));

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Schedule all artifacts that have a cronExpression
function registerSchedules() {
  const artifacts = artifactService.getAll();
  artifacts.forEach(artifact => {
    if (artifact.cronExpression && cron.validate(artifact.cronExpression)) {
      cron.schedule(artifact.cronExpression, async () => {
        console.log(`[CRON] Running artifact: ${artifact.name} (${artifact.id})`);
        try {
          await artifactService.run(artifact.id);
          console.log(`[CRON] Done: ${artifact.id}`);
        } catch (err) {
          console.error(`[CRON] Failed: ${artifact.id}`, err.message);
        }
      });
      console.log(`[SCHEDULE] Registered "${artifact.name}" → ${artifact.cronExpression}`);
    }
  });
}

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  registerSchedules();
});

module.exports = app;
