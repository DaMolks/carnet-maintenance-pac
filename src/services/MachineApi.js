/**
 * Client API pour récupérer les machines depuis le serveur
 */
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function setApiBaseUrl(url) {
  API_BASE_URL = url;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function fetchMachines() {
  const res = await fetch(`${API_BASE_URL}/api/machines`);
  if (!res.ok) {
    throw new Error('Impossible de récupérer les machines');
  }
  return res.json();
}

export async function fetchMachine(id) {
  const res = await fetch(`${API_BASE_URL}/api/machines/${id}`);
  if (!res.ok) {
    throw new Error('Impossible de récupérer la machine');
  }
  return res.json();
}

export async function detectLocalServers(ports = [3001, 3002, 3003, 3004, 3005]) {
  const found = [];
  await Promise.all(
    ports.map(async (port) => {
      const url = `http://localhost:${port}`;
      try {
        const res = await fetch(`${url}/`);
        if (res.ok) {
          found.push(url);
        }
      } catch (e) {
        // ignore unavailable ports
      }
    })
  );
  return found;
}
