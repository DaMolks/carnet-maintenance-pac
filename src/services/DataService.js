/**
 * Service de gestion des données pour le carnet de maintenance PAC
 * Ce service fournit une abstraction entre l'interface utilisateur et le stockage des données
 * Actuellement basé sur localStorage, mais conçu pour faciliter la migration vers une BD
 */

import { formatDateToISO, getTodayFrenchFormat, formatDateToFrench } from '../utils/dateUtils';

// Clé utilisée pour le stockage des machines dans localStorage
const STORAGE_KEY_MACHINES = 'carnet_maintenance_pac_machines_v2';
const STORAGE_KEY_INTERVENTIONS = 'carnet_maintenance_pac_interventions_v2';
const STORAGE_KEY_ID_HISTORY = 'carnet_maintenance_pac_id_history_v1';

// Liste de tous les identifiants de PAC (tous sur l'étage 4 comme indiqué)
const allPacIds = [
  'A0101', 'A0102', 'A0103', 'A0103b', 'A0104', 'A0105', 'A0106', 'A0107', 'A0108',
  'A0201', 'A0202', 'A0203', 'A0204', 'A0205', 'A0206', 'A0207', 'A0208',
  'A0301', 'A0302', 'A0303', 'A0304', 'A0305', 'A0306', 'A0306b', 'A0307', 'A0308',
  'A0401b', 'A0401', 'A0402', 'A0403', 'A0404', 'A0405', 'A0406', 'A0407', 'A0408', 'A0409', 'A0410', 'A0411', 'A0412',
  'A0501', 'A0502', 'A0503', 'A0504', 'A0505', 'A0506', 'A0507', 'A0507b', 'A0508', 'A0509', 'A0510', 'A0511', 'A0512', 'A0513', 'A0514', 'A0515', 'A0516',
  'A0601', 'A0602', 'A0603', 'A0604', 'A0605', 'A0606', 'A0606b', 'A0607', 'A0608', 'A0609', 'A0610', 'A0611', 'A0612',
  'TSGR1', 'TSGR2', 'TSGR3', 'TSGR4'
];

class DataService {
  /**
   * Initialise le service de données et charge les données depuis le stockage
   * ou crée des données par défaut si aucune n'existe
   */
  constructor() {
    this.machines = this._loadMachines();
    this.interventions = this._loadInterventions();
    this.idHistory = this._loadIdHistory();
  }

  /**
   * Charge les machines depuis le localStorage ou initialise avec des données par défaut
   * @returns {Array} Liste des machines PAC
   */
  _loadMachines() {
    try {
      const storedMachines = localStorage.getItem(STORAGE_KEY_MACHINES);
      
      if (storedMachines) {
        return JSON.parse(storedMachines);
      }
      
      // Si aucune donnée n'existe, initialiser avec la liste complète des machines
      // Toutes sur l'étage 4 comme indiqué, sans exemples pré-remplis
      const defaultMachines = allPacIds.map(id => {
        return {
          id,
          etage: id.startsWith('T') ? 'Technique' : '4', // Étage Technique pour les TSGR, sinon étage 4
          etat: 'Non vérifié',
          derniereVerification: '-',
          maintenancePrevue: '-',
          notes: '',
          serialNumber: '',
          neuronId: ''
        };
      });
      
      // Sauvegarder dans localStorage
      localStorage.setItem(STORAGE_KEY_MACHINES, JSON.stringify(defaultMachines));
      
      return defaultMachines;
    } catch (error) {
      console.error('Erreur lors du chargement des machines:', error);
      return [];
    }
  }

  /**
   * Charge les interventions depuis le localStorage ou initialise avec un objet vide
   * @returns {Object} Interventions indexées par ID de machine
   */
  _loadInterventions() {
    try {
      const storedInterventions = localStorage.getItem(STORAGE_KEY_INTERVENTIONS);
      
      if (storedInterventions) {
        return JSON.parse(storedInterventions);
      }
      
      // Si aucune donnée n'existe, initialiser avec un objet vide (pas d'exemples)
      localStorage.setItem(STORAGE_KEY_INTERVENTIONS, JSON.stringify({}));
      
      return {};
    } catch (error) {
      console.error('Erreur lors du chargement des interventions:', error);
      return {};
    }
  }
  
  /**
   * Charge l'historique des modifications d'identifiants depuis le localStorage ou initialise avec un objet vide
   * @returns {Object} Historique des modifications indexé par ID de machine
   */
  _loadIdHistory() {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY_ID_HISTORY);
      
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
      
      // Si aucune donnée n'existe, initialiser avec un objet vide
      const defaultHistory = {};
      
      // Pour chaque machine, créer une entrée vide
      allPacIds.forEach(id => {
        defaultHistory[id] = {
          entries: []
        };
      });
      
      localStorage.setItem(STORAGE_KEY_ID_HISTORY, JSON.stringify(defaultHistory));
      
      return defaultHistory;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des identifiants:', error);
      return {};
    }
  }

  /**
   * Sauvegarde les modifications de machines dans le stockage
   */
  _saveMachines() {
    try {
      localStorage.setItem(STORAGE_KEY_MACHINES, JSON.stringify(this.machines));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des machines:', error);
    }
  }

  /**
   * Sauvegarde les modifications d'interventions dans le stockage
   */
  _saveInterventions() {
    try {
      localStorage.setItem(STORAGE_KEY_INTERVENTIONS, JSON.stringify(this.interventions));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des interventions:', error);
    }
  }
  
  /**
   * Sauvegarde les modifications de l'historique des identifiants dans le stockage
   */
  _saveIdHistory() {
    try {
      localStorage.setItem(STORAGE_KEY_ID_HISTORY, JSON.stringify(this.idHistory));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique des identifiants:', error);
    }
  }

  /**
   * Récupère toutes les machines
   * @returns {Array} Liste des machines PAC
   */
  getAllMachines() {
    return [...this.machines];
  }

  /**
   * Récupère une machine par son ID
   * @param {string} id Identifiant de la machine
   * @returns {Object|null} Données de la machine ou null si non trouvée
   */
  getMachineById(id) {
    return this.machines.find(machine => machine.id === id) || null;
  }

  /**
   * Met à jour une machine existante
   * @param {string} id Identifiant de la machine
   * @param {Object} updatedData Nouvelles données partielles
   * @returns {boolean} Succès de l'opération
   */
  updateMachine(id, updatedData) {
    const index = this.machines.findIndex(machine => machine.id === id);
    
    if (index === -1) {
      return false;
    }
    
    // Mettre à jour seulement les propriétés fournies
    this.machines[index] = {
      ...this.machines[index],
      ...updatedData
    };
    
    this._saveMachines();
    return true;
  }
  
  /**
   * Met à jour le numéro de série d'une machine et enregistre l'historique
   * @param {string} id Identifiant de la machine
   * @param {string} serialNumber Nouveau numéro de série
   * @param {string} user Utilisateur qui effectue la modification (optionnel)
   * @returns {boolean} Succès de l'opération
   */
  updateSerialNumber(id, serialNumber, user = null) {
    const machine = this.getMachineById(id);
    
    if (!machine) {
      return false;
    }
    
    // Si la valeur est identique, ne rien faire
    if (machine.serialNumber === serialNumber) {
      return true;
    }
    
    // Enregistrer l'historique de la modification
    if (!this.idHistory[id]) {
      this.idHistory[id] = { entries: [] };
    }
    
    // Ajouter l'entrée d'historique
    this.idHistory[id].entries.unshift({
      date: getTodayFrenchFormat(),
      field: 'Numéro de série',
      oldValue: machine.serialNumber || '',
      newValue: serialNumber,
      user: user
    });
    
    // Sauvegarder l'historique
    this._saveIdHistory();
    
    // Mettre à jour la machine
    return this.updateMachine(id, { serialNumber });
  }
  
  /**
   * Met à jour le Neuron ID d'une machine et enregistre l'historique
   * @param {string} id Identifiant de la machine
   * @param {string} neuronId Nouveau Neuron ID
   * @param {string} user Utilisateur qui effectue la modification (optionnel)
   * @returns {boolean} Succès de l'opération
   */
  updateNeuronId(id, neuronId, user = null) {
    const machine = this.getMachineById(id);
    
    if (!machine) {
      return false;
    }
    
    // Si la valeur est identique, ne rien faire
    if (machine.neuronId === neuronId) {
      return true;
    }
    
    // Enregistrer l'historique de la modification
    if (!this.idHistory[id]) {
      this.idHistory[id] = { entries: [] };
    }
    
    // Ajouter l'entrée d'historique
    this.idHistory[id].entries.unshift({
      date: getTodayFrenchFormat(),
      field: 'Neuron ID',
      oldValue: machine.neuronId || '',
      newValue: neuronId,
      user: user
    });
    
    // Sauvegarder l'historique
    this._saveIdHistory();
    
    // Mettre à jour la machine
    return this.updateMachine(id, { neuronId });
  }
  
  /**
   * Récupère l'historique des modifications d'identifiants pour une machine
   * @param {string} id Identifiant de la machine
   * @returns {Object} Historique des modifications ou objet vide si aucun
   */
  getIdHistory(id) {
    return this.idHistory[id] || { entries: [] };
  }

  /**
   * Met à jour plusieurs machines à la fois
   * @param {Array} ids Liste des identifiants des machines à mettre à jour
   * @param {Object} updatedData Nouvelles données partielles
   * @returns {boolean} Succès de l'opération
   */
  updateMultipleMachines(ids, updatedData) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return false;
    }
    
    // Mettre à jour chaque machine
    let success = true;
    for (const id of ids) {
      const result = this.updateMachine(id, updatedData);
      if (!result) {
        success = false;
      }
    }
    
    return success;
  }

  /**
   * Récupère les interventions pour une machine spécifique
   * @param {string} machineId Identifiant de la machine
   * @returns {Array} Liste des interventions ou tableau vide si aucune
   */
  getInterventions(machineId) {
    return this.interventions[machineId] || [];
  }

  /**
   * Ajoute une nouvelle intervention pour une machine
   * @param {string} machineId Identifiant de la machine
   * @param {Object} intervention Données de l'intervention
   * @returns {boolean} Succès de l'opération
   */
  addIntervention(machineId, intervention) {
    if (!this.machines.some(machine => machine.id === machineId)) {
      return false;
    }
    
    if (!this.interventions[machineId]) {
      this.interventions[machineId] = [];
    }
    
    // Créer une copie de l'intervention
    const newIntervention = {...intervention};
    
    // Convertir la date au format ISO pour le stockage si elle est au format français
    if (newIntervention.date && newIntervention.date.includes('/')) {
      newIntervention.date = formatDateToISO(newIntervention.date);
    }
    
    // Ajouter l'intervention en haut de la liste (la plus récente en premier)
    this.interventions[machineId] = [
      newIntervention,
      ...this.interventions[machineId]
    ];
    
    this._saveInterventions();
    
    // Mettre à jour la date de dernière vérification sur la machine
    this.updateMachine(machineId, { derniereVerification: newIntervention.date });
    
    return true;
  }
  
  /**
   * Ajoute la même intervention pour plusieurs machines à la fois
   * @param {Array} machineIds Liste des identifiants des machines
   * @param {Object} intervention Données de l'intervention
   * @param {Array} machinesDetails Liste des machines avec leurs états et descriptions spécifiques à mettre à jour
   * @returns {boolean} Succès de l'opération
   */
  addInterventionToMultipleMachines(machineIds, intervention, machinesDetails = null) {
    if (!Array.isArray(machineIds) || machineIds.length === 0) {
      return false;
    }
    
    // Vérifier que toutes les machines existent
    const allMachinesExist = machineIds.every(id => 
      this.machines.some(machine => machine.id === id)
    );
    
    if (!allMachinesExist) {
      return false;
    }
    
    // Créer une copie de l'intervention
    const newIntervention = {...intervention};
    
    // Convertir la date au format ISO pour le stockage si elle est au format français
    if (newIntervention.date && newIntervention.date.includes('/')) {
      newIntervention.date = formatDateToISO(newIntervention.date);
    }
    
    // Créer un Map avec les états personnalisés et descriptions spécifiques des machines 
    const machineStates = new Map();
    const machineDescriptions = new Map();
    
    if (machinesDetails && Array.isArray(machinesDetails)) {
      machinesDetails.forEach(machine => {
        if (machine.id) {
          // Stocker le nouvel état si fourni
          if (machine.newStatus) {
            machineStates.set(machine.id, machine.newStatus);
          }
          
          // Stocker la description spécifique si fournie
          if (machine.specificDescription) {
            machineDescriptions.set(machine.id, machine.specificDescription);
          }
        }
      });
    }
    
    // Utiliser des descriptions individuelles si spécifié
    const useSpecificDescriptions = intervention.useSpecificDescriptions === true;
    
    // Ajouter l'intervention à chaque machine
    for (const machineId of machineIds) {
      if (!this.interventions[machineId]) {
        this.interventions[machineId] = [];
      }
      
      // Créer une copie spécifique de l'intervention pour cette machine
      const machineIntervention = {...newIntervention};
      
      // Utiliser la description spécifique si disponible et si spécifié
      if (useSpecificDescriptions && machineDescriptions.has(machineId)) {
        machineIntervention.description = machineDescriptions.get(machineId);
      }
      
      // Ajouter l'intervention à la machine
      this.interventions[machineId] = [
        machineIntervention,
        ...this.interventions[machineId]
      ];
      
      // Déterminer le nouvel état à appliquer
      const newStatus = machineStates.has(machineId) 
        ? machineStates.get(machineId) 
        : 'Fonctionnel'; // Par défaut, mettre à jour l'état à Fonctionnel
      
      // Mettre à jour la date de dernière vérification et l'état
      this.updateMachine(machineId, { 
        derniereVerification: newIntervention.date,
        etat: newStatus
      });
    }
    
    this._saveInterventions();
    return true;
  }

  /**
   * Supprime une intervention spécifique pour une machine
   * @param {string} machineId Identifiant de la machine
   * @param {number} index Index de l'intervention à supprimer
   * @returns {boolean} Succès de l'opération
   */
  deleteIntervention(machineId, index) {
    if (!this.interventions[machineId] || index >= this.interventions[machineId].length) {
      return false;
    }
    
    // Supprimer l'intervention à l'index spécifié
    this.interventions[machineId].splice(index, 1);
    
    // Si c'était la dernière intervention, mettre à jour la date de dernière vérification
    if (this.interventions[machineId].length > 0) {
      this.updateMachine(machineId, { 
        derniereVerification: this.interventions[machineId][0].date 
      });
    } else {
      // S'il n'y a plus d'interventions, réinitialiser la date de dernière vérification
      this.updateMachine(machineId, { derniereVerification: '-' });
      
      // Si le tableau d'interventions est vide, supprimer l'entrée
      delete this.interventions[machineId];
    }
    
    this._saveInterventions();
    return true;
  }

  /**
   * Obtient des statistiques sur l'état des machines
   * @returns {Object} Statistiques des machines
   */
  getStatistics() {
    return {
      total: this.machines.length,
      fonctionnels: this.machines.filter(m => m.etat === 'Fonctionnel').length,
      hs: this.machines.filter(m => m.etat === 'HS').length,
      nonVerifies: this.machines.filter(m => m.etat === 'Non vérifié').length
    };
  }
  
  /**
   * Obtient des statistiques pour un étage spécifique
   * @param {string} etage L'étage pour lequel obtenir les statistiques
   * @returns {Object} Statistiques des machines pour cet étage
   */
  getStatisticsByEtage(etage) {
    const machinesEtage = this.machines.filter(m => m.etage === etage);
    
    return {
      total: machinesEtage.length,
      fonctionnels: machinesEtage.filter(m => m.etat === 'Fonctionnel').length,
      hs: machinesEtage.filter(m => m.etat === 'HS').length,
      nonVerifies: machinesEtage.filter(m => m.etat === 'Non vérifié').length
    };
  }

  /**
   * Exporte toutes les données au format JSON
   * @returns {string} Données au format JSON
   */
  exportData() {
    return JSON.stringify({
      machines: this.machines,
      interventions: this.interventions,
      idHistory: this.idHistory
    });
  }

  /**
   * Importe des données au format JSON
   * @param {string} jsonData Données au format JSON
   * @returns {boolean} Succès de l'opération
   */
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.machines && Array.isArray(data.machines)) {
        this.machines = data.machines;
        this._saveMachines();
      }
      
      if (data.interventions && typeof data.interventions === 'object') {
        this.interventions = data.interventions;
        this._saveInterventions();
      }
      
      if (data.idHistory && typeof data.idHistory === 'object') {
        this.idHistory = data.idHistory;
        this._saveIdHistory();
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation des données:', error);
      return false;
    }
  }

  /**
   * Réinitialise toutes les données (pour un reset complet)
   */
  resetAllData() {
    // Réinitialiser les machines à leur état par défaut
    this.machines = allPacIds.map(id => ({
      id,
      etage: id.startsWith('T') ? 'Technique' : '4', // Étage Technique pour les TSGR, sinon étage 4
      etat: 'Non vérifié',
      derniereVerification: '-',
      maintenancePrevue: '-',
      notes: '',
      serialNumber: '',
      neuronId: ''
    }));
    
    // Réinitialiser les interventions
    this.interventions = {};
    
    // Réinitialiser l'historique des identifiants
    this.idHistory = {};
    allPacIds.forEach(id => {
      this.idHistory[id] = { entries: [] };
    });
    
    // Sauvegarder les changements
    this._saveMachines();
    this._saveInterventions();
    this._saveIdHistory();
    
    return true;
  }
}

// Exportation d'une instance unique du service (singleton)
const dataService = new DataService();
export default dataService;