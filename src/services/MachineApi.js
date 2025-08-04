/**
 * Client API pour récupérer les machines depuis le serveur
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
