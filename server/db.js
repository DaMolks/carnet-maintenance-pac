const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    serial_number TEXT,
    name TEXT,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS interventions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id TEXT,
    date TEXT,
    description TEXT,
    FOREIGN KEY(machine_id) REFERENCES machines(id) ON DELETE CASCADE
  );
`);

const machineCount = db.prepare('SELECT COUNT(*) as count FROM machines').get().count;
if (machineCount === 0) {
  const dataFile = path.join(__dirname, 'data', 'machines.json');
  const machines = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

  const insertMachine = db.prepare('INSERT INTO machines (id, serial_number, name, description) VALUES (?, ?, ?, ?)');
  const insertIntervention = db.prepare('INSERT INTO interventions (machine_id, date, description) VALUES (?, ?, ?)');

  const seed = db.transaction(() => {
    machines.forEach(m => {
      insertMachine.run(m.id, m.serialNumber, m.name, m.description);
      if (Array.isArray(m.history)) {
        m.history.forEach(h => {
          insertIntervention.run(m.id, h.date, h.description);
        });
      }
    });
  });

  seed();
}

module.exports = db;
