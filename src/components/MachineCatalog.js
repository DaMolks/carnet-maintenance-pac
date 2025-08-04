import React, { useEffect, useState } from 'react';
import { fetchMachines } from '../services/MachineApi';

/**
 * Affiche la liste des machines récupérées depuis l'API backend
 */
const MachineCatalog = () => {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    fetchMachines()
      .then(setMachines)
      .catch(err => console.error('Erreur de chargement des machines', err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Catalogue des machines</h2>
      <ul className="space-y-2">
        {machines.map(machine => (
          <li key={machine.id} className="border p-2 rounded">
            <p className="font-medium">{machine.name} ({machine.serialNumber})</p>
            <p className="text-sm text-gray-600 mb-1">{machine.description}</p>
            {machine.history.length > 0 && (
              <ul className="ml-4 list-disc text-sm text-gray-700">
                {machine.history.map((h, idx) => (
                  <li key={idx}>{h.date} - {h.description}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MachineCatalog;
