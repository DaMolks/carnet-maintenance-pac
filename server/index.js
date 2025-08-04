const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/machines', (req, res) => {
  const machines = db.prepare('SELECT * FROM machines').all();
  const interventions = db.prepare('SELECT machine_id, date, description FROM interventions').all();
  const historyMap = {};
  interventions.forEach(i => {
    if (!historyMap[i.machine_id]) historyMap[i.machine_id] = [];
    historyMap[i.machine_id].push({ date: i.date, description: i.description });
  });
  const result = machines.map(m => ({
    id: m.id,
    serialNumber: m.serial_number,
    name: m.name,
    description: m.description,
    history: historyMap[m.id] || []
  }));
  res.json(result);
});

app.get('/api/machines/:id', (req, res) => {
  const machine = db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id);
  if (!machine) {
    return res.status(404).json({ error: 'Machine not found' });
  }
  const history = db.prepare('SELECT date, description FROM interventions WHERE machine_id = ?').all(req.params.id);
  res.json({
    id: machine.id,
    serialNumber: machine.serial_number,
    name: machine.name,
    description: machine.description,
    history
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
