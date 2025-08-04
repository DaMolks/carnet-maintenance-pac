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

### API

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET    | `/api/machines` | List all machines with their intervention history |
| GET    | `/api/machines/:id` | Retrieve a single machine by ID |

You can change the port by setting the `PORT` environment variable before starting the server.
