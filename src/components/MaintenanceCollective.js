import React from 'react';
import { Check } from 'lucide-react';

/**
 * Composant pour effectuer une maintenance collective sur plusieurs machines
 */
const MaintenanceCollective = ({ 
  isActive, 
  machinesSelectionnees,
  maintenance,
  setMaintenance,
  onValider,
  onAnnuler
}) => {
  if (!isActive) return null;
  
  return (
    <div className="bg-orange-100 border-orange-300 border-t border-b p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-orange-800">Mode Maintenance Collective</h2>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
              onClick={onValider}
            >
              <Check className="w-4 h-4 mr-1" /> Valider ({machinesSelectionnees.length} machines)
            </button>
            <button 
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center"
              onClick={onAnnuler}
            >
              Annuler
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Date</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              placeholder="JJ/MM/AAAA"
              value={maintenance.date}
              onChange={(e) => setMaintenance({
                ...maintenance,
                date: e.target.value
              })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Technicien</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={maintenance.technicien}
              onChange={(e) => setMaintenance({
                ...maintenance,
                technicien: e.target.value
              })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border rounded p-2"
              rows="2"
              value={maintenance.description}
              onChange={(e) => setMaintenance({
                ...maintenance,
                description: e.target.value
              })}
            />
          </div>
        </div>
        <p className="text-sm text-orange-700">
          <strong>Instructions:</strong> Sélectionnez les machines sur lesquelles vous souhaitez appliquer cette maintenance, puis cliquez sur "Valider".
        </p>
      </div>
    </div>
  );
};

export default MaintenanceCollective;
