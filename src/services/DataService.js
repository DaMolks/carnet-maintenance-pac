/**
 * Service de gestion des données pour le carnet de maintenance PAC
 * Ce service fournit une abstraction entre l'interface utilisateur et le stockage des données
 * Actuellement basé sur localStorage, mais conçu pour faciliter la migration vers une BD
 */

// Clé utilisée pour le stockage des machines dans localStorage
const STORAGE_KEY_MACHINES = 'carnet_maintenance_pac_machines';
const STORAGE_KEY_INTERVENTIONS = 'carnet_maintenance_pac_interventions';

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

// Quelques données initiales pour démonstration
const initialMachines = [
  { id: 'A0401', etage: '4', etat: 'Fonctionnel', derniereVerification: '2025-04-15', maintenancePrevue: '2025-07-15', notes: 'RAS' },
  { id: 'A0402', etage: '4', etat: 'Fonctionnel', derniereVerification: '2025-04-15', maintenancePrevue: '2025-07-15', notes: 'Filtre à changer prochainement' },
  { id: 'A0403', etage: '4', etat: 'Fonctionnel', derniereVerification: '2025-04-16', maintenancePrevue: '2025-07-16', notes: 'RAS' },
  { id: 'A0401b', etage: '4', etat: 'HS', derniereVerification: '2025-04-16', maintenancePrevue: '2025-05-20', notes: 'Panne compresseur - Pièce commandée' }
];

const initialInterventions = {
  'A0401': [
    { date: '2025-01-15', type: 'Installation', description: 'Installation initiale', technicien: 'Martin D.' },
    { date: '2025-04-01', type: 'Maintenance', description: 'Vérification des filtres', technicien: 'Sophie L.' }
  ],
  'A0402': [
    { date: '2025-01-15', type: 'Installation', description: 'Installation initiale', technicien: 'Martin D.' }
  ]
};

class DataService {
  /**
   * Initialise le service de données et charge les données depuis le stockage
   * ou crée des données par défaut si aucune n'existe
   */
  constructor() {
    this.machines = this._loadMachines();
    this.interventions = this._loadInterventions();
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
      // Toutes sur l'étage 4 comme indiqué
      const defaultMachines = allPacIds.map(id => {
        // Vérifier si une machine initiale existe avec cet ID
        const initialMachine = initialMachines.find(m => m.id === id);
        
        if (initialMachine) {
          return initialMachine;
        }
        
        // Sinon, créer une nouvelle entrée avec l'étage 4 par défaut
        return {
          id,
          etage: '4', // Toutes sur l'étage 4 comme indiqué
          etat: 'Non vérifié',
          derniereVerification: '-',
          maintenancePrevue: '-',
          notes: ''
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
   * Charge les interventions depuis le localStorage ou initialise avec des données par défaut
   * @returns {Object} Interventions indexées par ID de machine
   */
  _loadInterventions() {
    try {
      const storedInterventions = localStorage.getItem(STORAGE_KEY_INTERVENTIONS);
      
      if (storedInterventions) {
        return JSON.parse(storedInterventions);
      }
      
      // Si aucune donnée n'existe, initialiser avec les interventions par défaut
      localStorage.setItem(STORAGE_KEY_INTERVENTIONS, JSON.stringify(initialInterventions));
      
      return { ...initialInterventions };
    } catch (error) {
      console.error('Erreur lors du chargement des interventions:', error);
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
    
    // Ajouter l'intervention en haut de la liste (la plus récente en premier)
    this.interventions[machineId] = [
      intervention,
      ...this.interventions[machineId]
    ];
    
    this._saveInterventions();
    
    // Mettre à jour la date de dernière vérification sur la machine
    this.updateMachine(machineId, { derniereVerification: intervention.date });
    
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
   * Exporte toutes les données au format JSON
   * @returns {string} Données au format JSON
   */
  exportData() {
    return JSON.stringify({
      machines: this.machines,
      interventions: this.interventions
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
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation des données:', error);
      return false;
    }
  }
}

// Exportation d'une instance unique du service (singleton)
const dataService = new DataService();
export default dataService;
