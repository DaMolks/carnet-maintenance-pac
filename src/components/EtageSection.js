import React from 'react';
import { CheckCircle, AlertTriangle, Settings, ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Composant affichant une section d'étage avec ses statistiques et ses machines
 */
const EtageSection = ({ 
  etage, 
  machines, 
  stats, 
  isOpen, 
  onToggle, 
  etatFiltre, 
  searchTerm, 
  onMachineSelect, 
  selectedMachineId,
  multiSelectionMode = false,
  selectedMachines = [] 
}) => {
  // Filtrer les machines selon les critères
  const filteredMachines = machines.filter(machine => {
    const matchEtat = etatFiltre === 'Tous' || machine.etat === etatFiltre;
    const matchSearch = !searchTerm || 
                        machine.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (machine.notes && machine.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchEtat && matchSearch;
  });
  
  // Ne pas afficher la section si aucune machine ne correspond aux filtres
  if (filteredMachines.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      {/* En-tête de la section avec statistiques */}
      <div 
        className="flex justify-between items-center bg-gray-100 p-2 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center">
          {isOpen ? 
            <ChevronDown className="w-4 h-4 mr-1" /> : 
            <ChevronRight className="w-4 h-4 mr-1" />
          }
          <h3 className="font-medium text-gray-700">Étage {etage}</h3>
        </div>
        <div className="flex space-x-2">
          <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs flex items-center">
            <CheckCircle className="w-3 h-3 mr-0.5" /> {stats?.fonctionnels || 0}
          </span>
          <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-xs flex items-center">
            <AlertTriangle className="w-3 h-3 mr-0.5" /> {stats?.hs || 0}
          </span>
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs flex items-center">
            <Settings className="w-3 h-3 mr-0.5" /> {stats?.nonVerifies || 0}
          </span>
        </div>
      </div>
      
      {/* Liste des machines si la section est ouverte */}
      {isOpen && (
        <div className="p-2 space-y-2">
          {filteredMachines.map(machine => (
            <div 
              key={machine.id}
              className={`p-2 border rounded cursor-pointer transition hover:bg-gray-50 ${
                (!multiSelectionMode && selectedMachineId === machine.id) ? 'bg-blue-50 border-blue-300' : 
                (multiSelectionMode && selectedMachines.includes(machine.id)) ? 'bg-orange-50 border-orange-300' : ''
              }`}
              onClick={() => onMachineSelect(machine)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{machine.id}</span>
                <span className={`text-sm px-2 py-0.5 rounded ${
                  machine.etat === 'Fonctionnel' ? 'bg-green-100 text-green-800' :
                  machine.etat === 'HS' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {machine.etat}
                </span>
              </div>
              {machine.notes && (
                <p className="text-sm text-gray-600 mt-1 truncate">{machine.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EtageSection;
