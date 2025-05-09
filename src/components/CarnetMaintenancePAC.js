import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

// Importer les constantes
import { ETAGES } from '../constants/config';

// Importer les hooks personnalisés
import useMachineManagement from '../hooks/useMachineManagement';
import useDataOperations from '../hooks/useDataOperations';
import useFilters from '../hooks/useFilters';
import useMaintenanceCollective from '../hooks/useMaintenanceCollective';

// Importer les composants
import Header from './Header';
import Filters from './Filters';
import MachineList from './MachineList';
import MachineDetails from './MachineDetails';
import MaintenanceCollectiveDetail from './MaintenanceCollectiveDetail';
import ExportReport from './ExportReport';

// Importer les utilitaires de date
import { getTodayFrenchFormat } from '../utils/dateUtils';

/**
 * Composant principal de l'application
 */
const CarnetMaintenancePAC = () => {
  // Utiliser les hooks personnalisés
  const {
    machines,
    machineSelectionnee,
    interventions,
    idHistory,
    stats,
    statsByEtage,
    setMachineSelectionnee,
    loadAllData,
    handleMachineSelect,
    updateMachineEtat,
    updateMachineNotes,
    updateMachineSerialNumber,
    updateMachineNeuronId,
    deleteIdHistoryEntry,
    addIntervention,
    deleteIntervention,
    resetAllData,
    addInterventionToMultipleMachines
  } = useMachineManagement();

  // Hook pour les interventions
  const [nouvelleIntervention, setNouvelleIntervention] = useState({
    date: getTodayFrenchFormat(),
    type: 'Maintenance',
    description: '',
    technicien: ''
  });

  // Hook pour les opérations d'import/export
  const {
    showExportReport,
    handleExport,
    handleImport,
    showExportReportModal,
    closeExportReportModal
  } = useDataOperations(() => {
    // Callback pour recharger les données après un import
    loadAllData(ETAGES);
    setMachineSelectionnee(null);
  });

  // Hook pour les filtres
  const {
    etageFiltre,
    setEtageFiltre,
    etatFiltre,
    setEtatFiltre,
    searchTerm,
    setSearchTerm,
    etagesOuverts,
    machinesParEtage,
    machinesFiltrees,
    toggleEtage
  } = useFilters(machines, ETAGES);

  // Hook pour la maintenance collective
  const {
    showMaintenanceCollectiveDetail,
    maintenanceCollective,
    toggleMaintenanceCollective,
    handleMaintenanceCollectiveDetailSubmit,
    handleMaintenanceCollectiveDetailReturn
  } = useMaintenanceCollective(addInterventionToMultipleMachines, ETAGES);

  // Chargement initial des données
  useEffect(() => {
    loadAllData(ETAGES);
  }, []);

  // Handler pour ajouter une intervention
  const handleAddIntervention = () => {
    if (machineSelectionnee && nouvelleIntervention.description) {
      if (addIntervention(machineSelectionnee, nouvelleIntervention, ETAGES)) {
        setNouvelleIntervention({
          date: getTodayFrenchFormat(),
          type: 'Maintenance',
          description: '',
          technicien: ''
        });
      }
    }
  };

  // Handler pour réinitialiser les données
  const handleResetData = () => {
    if (resetAllData(ETAGES)) {
      setMachineSelectionnee(null);
    }
  };

  // Si le mode de maintenance collective détaillée est activé, afficher cet écran
  if (showMaintenanceCollectiveDetail) {
    return (
      <MaintenanceCollectiveDetail 
        machines={machines}
        etages={ETAGES}
        onReturn={handleMaintenanceCollectiveDetailReturn}
        onSubmit={handleMaintenanceCollectiveDetailSubmit}
        interventionBase={maintenanceCollective}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* En-tête */}
      <Header 
        stats={stats}
        onToggleMaintenanceCollective={toggleMaintenanceCollective}
        onShowExportReport={showExportReportModal}
        onExportData={handleExport}
        onImportData={handleImport}
        onResetData={handleResetData}
      />

      {/* Filtres et recherche */}
      <Filters 
        etages={ETAGES}
        etageFiltre={etageFiltre}
        setEtageFiltre={setEtageFiltre}
        etatFiltre={etatFiltre}
        setEtatFiltre={setEtatFiltre}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Contenu principal - Liste et détail */}
      <div className="flex flex-1 overflow-hidden">
        {/* Liste des machines (côté gauche) */}
        <MachineList 
          etageFiltre={etageFiltre}
          etages={ETAGES}
          machinesParEtage={machinesParEtage}
          machinesFiltrees={machinesFiltrees}
          statsByEtage={statsByEtage}
          etagesOuverts={etagesOuverts}
          toggleEtage={toggleEtage}
          etatFiltre={etatFiltre}
          searchTerm={searchTerm}
          handleMachineSelect={handleMachineSelect}
          machineSelectionnee={machineSelectionnee}
        />
        
        {/* Détail de la machine (côté droit) */}
        <div className="flex-1 overflow-auto p-4">
          {machineSelectionnee ? (
            <MachineDetails 
              machine={machineSelectionnee}
              interventions={interventions[machineSelectionnee.id] || []}
              onUpdateEtat={(id, etat) => updateMachineEtat(id, etat, ETAGES)}
              onUpdateNotes={updateMachineNotes}
              onUpdateSerialNumber={updateMachineSerialNumber}
              onUpdateNeuronId={updateMachineNeuronId}
              onDeleteIntervention={(id, index) => deleteIntervention(id, index, ETAGES)}
              nouvelleIntervention={nouvelleIntervention}
              setNouvelleIntervention={setNouvelleIntervention}
              onAddIntervention={handleAddIntervention}
              onDeleteIdHistoryEntry={deleteIdHistoryEntry}
              idHistory={idHistory[machineSelectionnee.id] || { entries: [] }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-16 h-16 mb-4" />
              <p>Sélectionnez une machine pour afficher ses détails</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal pour l'export de rapport */}
      {showExportReport && (
        <ExportReport
          onClose={closeExportReportModal}
          machines={machines}
          etages={ETAGES}
        />
      )}
    </div>
  );
};

export default CarnetMaintenancePAC;