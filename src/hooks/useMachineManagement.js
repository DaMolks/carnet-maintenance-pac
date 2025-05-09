import { useState } from 'react';
import dataService from '../services/DataService';
import { formatDateToFrench, getTodayFrenchFormat } from '../utils/dateUtils';

/**
 * Hook personnalisé pour gérer les machines et leurs états
 */
const useMachineManagement = () => {
  // État pour stocker les machines et leurs données
  const [machines, setMachines] = useState([]);
  const [machineSelectionnee, setMachineSelectionnee] = useState(null);
  const [interventions, setInterventions] = useState({});
  const [idHistory, setIdHistory] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    fonctionnels: 0,
    hs: 0,
    nonVerifies: 0
  });
  const [statsByEtage, setStatsByEtage] = useState({});
  
  // Chargement de toutes les données
  const loadAllData = (etages) => {
    // Charger toutes les machines
    const allMachines = dataService.getAllMachines();
    
    // Convertir les dates des machines au format français
    const machinesWithFormattedDates = allMachines.map(machine => ({
      ...machine,
      derniereVerification: formatDateToFrench(machine.derniereVerification),
      maintenancePrevue: formatDateToFrench(machine.maintenancePrevue)
    }));
    
    setMachines(machinesWithFormattedDates);
    
    // Charger les statistiques générales
    setStats(dataService.getStatistics());
    
    // Charger les statistiques par étage
    const etageStats = {};
    etages.forEach(etage => {
      etageStats[etage] = dataService.getStatisticsByEtage(etage);
    });
    setStatsByEtage(etageStats);
  };

  // Mettre à jour la liste des machines et les statistiques
  const updateMachinesList = (etages) => {
    const allMachines = dataService.getAllMachines();
    
    // Convertir les dates des machines au format français
    const machinesWithFormattedDates = allMachines.map(machine => ({
      ...machine,
      derniereVerification: formatDateToFrench(machine.derniereVerification),
      maintenancePrevue: formatDateToFrench(machine.maintenancePrevue)
    }));
    
    setMachines(machinesWithFormattedDates);
    updateStats(etages);
  };
  
  // Mettre à jour les statistiques
  const updateStats = (etages) => {
    setStats(dataService.getStatistics());
    
    const etageStats = {};
    etages.forEach(etage => {
      etageStats[etage] = dataService.getStatisticsByEtage(etage);
    });
    setStatsByEtage(etageStats);
  };

  // Gérer la sélection d'une machine
  const handleMachineSelect = (machine) => {
    // Mode normal - afficher les détails d'une machine
    setMachineSelectionnee(machine);
    
    // Charger les interventions pour cette machine
    const machineInterventions = dataService.getInterventions(machine.id);
    
    // Convertir les dates des interventions au format français
    const interventionsWithFormattedDates = machineInterventions.map(intervention => ({
      ...intervention,
      date: formatDateToFrench(intervention.date)
    }));
    
    // Charger l'historique des identifiants pour cette machine
    const history = dataService.getIdHistory(machine.id);
    
    setInterventions({
      ...interventions,
      [machine.id]: interventionsWithFormattedDates
    });
    
    setIdHistory({
      ...idHistory,
      [machine.id]: history
    });
  };

  // Mettre à jour l'état d'une machine
  const updateMachineEtat = (id, nouveauEtat, etages) => {
    // Mettre à jour via le service de données
    if (dataService.updateMachine(id, { etat: nouveauEtat })) {
      // Mettre à jour l'état local
      setMachines(machines.map(machine => 
        machine.id === id ? { ...machine, etat: nouveauEtat } : machine
      ));
      
      // Mettre à jour la machine sélectionnée si nécessaire
      if (machineSelectionnee && machineSelectionnee.id === id) {
        setMachineSelectionnee({ ...machineSelectionnee, etat: nouveauEtat });
      }
      
      // Mettre à jour les statistiques
      updateStats(etages);
    }
  };

  // Mettre à jour les notes d'une machine
  const updateMachineNotes = (id, notes) => {
    // Mettre à jour via le service de données
    if (dataService.updateMachine(id, { notes })) {
      // Mettre à jour l'état local
      setMachines(machines.map(machine => 
        machine.id === id ? { ...machine, notes } : machine
      ));
      
      // Mettre à jour la machine sélectionnée si nécessaire
      if (machineSelectionnee && machineSelectionnee.id === id) {
        setMachineSelectionnee({ ...machineSelectionnee, notes });
      }
    }
  };
  
  // Mettre à jour le numéro de série d'une machine
  const updateMachineSerialNumber = (id, serialNumber, user = null) => {
    // Mettre à jour via le service de données
    if (dataService.updateSerialNumber(id, serialNumber, user)) {
      // Mettre à jour l'état local
      setMachines(machines.map(machine => 
        machine.id === id ? { ...machine, serialNumber } : machine
      ));
      
      // Mettre à jour la machine sélectionnée si nécessaire
      if (machineSelectionnee && machineSelectionnee.id === id) {
        setMachineSelectionnee({ ...machineSelectionnee, serialNumber });
      }
      
      // Recharger l'historique des identifiants
      const updatedHistory = dataService.getIdHistory(id);
      setIdHistory({
        ...idHistory,
        [id]: updatedHistory
      });
    }
  };
  
  // Mettre à jour le Neuron ID d'une machine
  const updateMachineNeuronId = (id, neuronId, user = null) => {
    // Mettre à jour via le service de données
    if (dataService.updateNeuronId(id, neuronId, user)) {
      // Mettre à jour l'état local
      setMachines(machines.map(machine => 
        machine.id === id ? { ...machine, neuronId } : machine
      ));
      
      // Mettre à jour la machine sélectionnée si nécessaire
      if (machineSelectionnee && machineSelectionnee.id === id) {
        setMachineSelectionnee({ ...machineSelectionnee, neuronId });
      }
      
      // Recharger l'historique des identifiants
      const updatedHistory = dataService.getIdHistory(id);
      setIdHistory({
        ...idHistory,
        [id]: updatedHistory
      });
    }
  };
  
  // Supprimer une entrée de l'historique des identifiants
  const deleteIdHistoryEntry = (machineId, index) => {
    // Supprimer via le service de données
    if (dataService.deleteIdHistoryEntry(machineId, index)) {
      // Recharger l'historique des identifiants
      const updatedHistory = dataService.getIdHistory(machineId);
      setIdHistory({
        ...idHistory,
        [machineId]: updatedHistory
      });
    }
  };

  // Ajouter une nouvelle intervention
  const addIntervention = (machineSelectionnee, nouvelleIntervention, etages) => {
    if (machineSelectionnee && nouvelleIntervention.description) {
      // Ajouter via le service de données
      if (dataService.addIntervention(machineSelectionnee.id, nouvelleIntervention)) {
        // Mettre à jour l'état local des interventions
        const updatedInterventions = dataService.getInterventions(machineSelectionnee.id);
        
        // Convertir les dates des interventions au format français
        const formattedInterventions = updatedInterventions.map(intervention => ({
          ...intervention,
          date: formatDateToFrench(intervention.date)
        }));
        
        setInterventions({
          ...interventions,
          [machineSelectionnee.id]: formattedInterventions
        });
        
        // Mettre à jour la date de dernière vérification dans l'UI
        const updatedMachine = dataService.getMachineById(machineSelectionnee.id);
        
        // Convertir les dates au format français
        const updatedMachineWithFormattedDates = {
          ...updatedMachine,
          derniereVerification: formatDateToFrench(updatedMachine.derniereVerification),
          maintenancePrevue: formatDateToFrench(updatedMachine.maintenancePrevue)
        };
        
        setMachineSelectionnee(updatedMachineWithFormattedDates);
        
        // Mettre à jour la liste des machines et les statistiques
        updateMachinesList(etages);
        
        return true;
      }
    }
    return false;
  };
  
  // Supprimer une intervention
  const deleteIntervention = (machineId, index, etages) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      if (dataService.deleteIntervention(machineId, index)) {
        // Mettre à jour l'état local des interventions
        const updatedInterventions = dataService.getInterventions(machineId);
        
        // Convertir les dates des interventions au format français
        const formattedInterventions = updatedInterventions.map(intervention => ({
          ...intervention,
          date: formatDateToFrench(intervention.date)
        }));
        
        setInterventions({
          ...interventions,
          [machineId]: formattedInterventions
        });
        
        // Mettre à jour la date de dernière vérification dans l'UI
        const updatedMachine = dataService.getMachineById(machineId);
        
        // Convertir les dates au format français
        const updatedMachineWithFormattedDates = {
          ...updatedMachine,
          derniereVerification: formatDateToFrench(updatedMachine.derniereVerification),
          maintenancePrevue: formatDateToFrench(updatedMachine.maintenancePrevue)
        };
        
        // Mettre à jour la machine sélectionnée si nécessaire
        if (machineSelectionnee && machineSelectionnee.id === machineId) {
          setMachineSelectionnee(updatedMachineWithFormattedDates);
        }
        
        // Mettre à jour la liste des machines et les statistiques
        updateMachinesList(etages);
        
        return true;
      }
    }
    return false;
  };
  
  // Réinitialiser toutes les données
  const resetAllData = (etages) => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action ne peut pas être annulée.')) {
      if (dataService.resetAllData()) {
        // Recharger toutes les données
        loadAllData(etages);
        
        // Réinitialiser la sélection
        setMachineSelectionnee(null);
        setInterventions({});
        setIdHistory({});
        
        alert('Toutes les données ont été réinitialisées avec succès.');
        return true;
      }
    }
    return false;
  };
  
  // Définir l'état des machines pour la maintenance collective
  const addInterventionToMultipleMachines = (machineIds, intervention, machinesDetails, etages) => {
    // Ajouter l'intervention via le service de données
    if (dataService.addInterventionToMultipleMachines(machineIds, intervention, machinesDetails)) {
      // Mettre à jour la liste des machines et les statistiques
      updateMachinesList(etages);
      return true;
    }
    return false;
  };

  return {
    machines,
    machineSelectionnee,
    interventions,
    idHistory,
    stats,
    statsByEtage,
    setMachineSelectionnee,
    loadAllData,
    updateMachinesList,
    updateStats,
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
  };
};

export default useMachineManagement;