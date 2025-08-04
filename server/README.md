# Server

This directory contains an Express server for the project.

## Setup

1. Install dependencies and initialize the SQLite database:
This directory contains a simple Express server for the project.

## Setup

1. Install dependencies:


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
=======
3. Visit [http://localhost:3001](http://localhost:3001) to verify the server is running.
4. 
You can change the port by setting the `PORT` environment variable before starting the server.
