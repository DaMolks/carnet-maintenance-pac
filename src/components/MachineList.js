import React from 'react';
import EtageSection from './EtageSection';

/**
 * Composant pour afficher la liste des machines
 */
const MachineList = ({
  etageFiltre,
  etages,
  machinesParEtage,
  machinesFiltrees,
  statsByEtage,
  etagesOuverts,
  toggleEtage,
  etatFiltre,
  searchTerm,
  handleMachineSelect,
  machineSelectionnee
}) => {
  return (
    <div className="w-1/3 overflow-auto bg-white border-r p-4">
      <h2 className="text-lg font-semibold mb-4">Machines PAC</h2>
      
      {etageFiltre === 'Tous' ? (
        // Affichage groupé par étage avec menu déroulant
        etages.map(etage => (
          <EtageSection 
            key={etage}
            etage={etage}
            machines={machinesParEtage[etage] || []}
            stats={statsByEtage[etage]}
            isOpen={etagesOuverts[etage]}
            onToggle={() => toggleEtage(etage)}
            etatFiltre={etatFiltre}
            searchTerm={searchTerm}
            onMachineSelect={handleMachineSelect}
            selectedMachineId={machineSelectionnee?.id}
            multiSelectionMode={false}
            selectedMachines={[]}
          />
        ))
      ) : (
        // Affichage des résultats filtrés sans regroupement
        <div className="space-y-2">
          {machinesFiltrees.map(machine => (
            <div 
              key={machine.id}
              className={`p-2 border rounded cursor-pointer transition hover:bg-gray-50 ${
                machineSelectionnee?.id === machine.id ? 'bg-blue-50 border-blue-300' : ''
              }`}
              onClick={() => handleMachineSelect(machine)}
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
              {(machine.serialNumber || machine.neuronId) && (
                <div className="flex flex-col mt-1">
                  {machine.serialNumber && (
                    <p className="text-xs text-gray-600">SN: {machine.serialNumber}</p>
                  )}
                  {machine.neuronId && (
                    <p className="text-xs text-gray-600">Neuron ID: {machine.neuronId}</p>
                  )}
                </div>
              )}
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

export default MachineList;