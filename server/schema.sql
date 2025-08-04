-- Schema template for machine maintenance database
CREATE TABLE machines (
  id TEXT PRIMARY KEY,
  serial_number TEXT,
  name TEXT,
  description TEXT
);

CREATE TABLE interventions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_id TEXT,
  date TEXT,
  description TEXT,
  FOREIGN KEY(machine_id) REFERENCES machines(id) ON DELETE CASCADE
);
