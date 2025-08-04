# Server

This directory contains an Express server for the project.

## Setup

1. Install dependencies and initialize the SQLite database:
   ```bash
   npm install
   ```

2. Start the server (defaults to port 3001):
   ```bash
   npm start
   ```

The server reads machine data from `data/machines.json` on first start and persists it to `database.sqlite`.

### Database template

If you want to initialise a fresh database manually, a schema template is provided in `schema.sql`.
You can create a blank SQLite file using:

```bash
sqlite3 database.sqlite < schema.sql
```

Populate `data/machines.json` with your machines and start the server to import them.

### API

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET    | `/api/machines` | List all machines with their intervention history |
| GET    | `/api/machines/:id` | Retrieve a single machine by ID |

You can change the port by setting the `PORT` environment variable before starting the server.
