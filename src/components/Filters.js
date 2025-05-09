import React from 'react';
import { Search } from 'lucide-react';

/**
 * Composant de filtres pour l'application
 */
const Filters = ({ 
  etages, 
  etageFiltre, 
  setEtageFiltre, 
  etatFiltre, 
  setEtatFiltre, 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div className="bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <label className="mr-2 text-gray-700">Étage:</label>
          <select 
            className="border rounded p-1"
            value={etageFiltre}
            onChange={(e) => setEtageFiltre(e.target.value)}
          >
            <option value="Tous">Tous</option>
            {etages.map(etage => (
              <option key={etage} value={etage}>{etage}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <label className="mr-2 text-gray-700">État:</label>
          <select 
            className="border rounded p-1"
            value={etatFiltre}
            onChange={(e) => setEtatFiltre(e.target.value)}
          >
            <option value="Tous">Tous</option>
            <option value="Fonctionnel">Fonctionnel</option>
            <option value="HS">HS</option>
            <option value="Non vérifié">Non vérifié</option>
          </select>
        </div>
        
        <div className="flex items-center ml-auto">
          <Search className="w-4 h-4 mr-2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher ID, notes, numéro de série ou Neuron ID..."
            className="border rounded p-1 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;