import React, { useState, useEffect } from 'react';
import { Database, FileText, AlertTriangle, CheckCircle, Settings, Search,
         Save, Upload, RefreshCw, Wrench } from 'lucide-react';

// Importer le service de données
import dataService from '../services/DataService';

// Importer les composants
import EtageSection from './EtageSection';
import MachineDetails from './MachineDetails';
import MaintenanceCollective from './MaintenanceCollective';

// Liste complète des étages disponibles
const etages = ['4', 'Technique'];

const CarnetMaintenancePAC = () => {
  // État pour stocker les machines et leurs données
  const [machines, setMachines] = useState([]);
  
  // Filtres et tri
  const [etageFiltre, setEtageFiltre] = useState('Tous');
  const [etatFiltre, setEtatFiltre] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [machineSelectionnee, setMachineSelectionnee] = useState(null);
  const [nouvelleIntervention, setNouvelleIntervention] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Maintenance',
    description: '',
    technicien: ''
  });
  const [interventions, setInterventions] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    fonctionnels: 0,
    hs: 0,
    nonVerifies: 0
  });
  
  // État pour les statistiques par étage
  const [statsByEtage, setStatsByEtage] = useState({});
  
  // État pour le menu déroulant par étage
  const [etagesOuverts, setEtagesOuverts] = useState({});
  
  // État pour la maintenance collective
  const [showMaintenanceCollective, setShowMaintenanceCollective] = useState(false);
  const [machinesSelectionnees, setMachinesSelectionnees] = useState([]);
  const [maintenanceCollective, setMaintenanceCollective] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Maintenance',
    description: 'Maintenance filtres et filtres à tamis + essais de fonctionnement',
    technicien: ''
  });
  
  // Chargement initial des données
  useEffect(() => {
    loadAllData();
    
    // Initialiser tous les étages comme ouverts
    const initEtagesOuverts = {};
    etages.forEach(etage => {
      initEtagesOuverts[etage] = true;
    });
    setEtagesOuverts(initEtagesOuverts);
  }, []);
  
  // Fonction pour charger toutes les données
  const loadAllData = () => {
    // Charger toutes les machines
    const allMachines = dataService.getAllMachines();
    setMachines(allMachines);
    
    // Charger les statistiques générales
    setStats(dataService.getStatistics());
    
    // Charger les statistiques par étage
    const etageStats = {};
    etages.forEach(etage => {
      etageStats[etage] = dataService.getStatisticsByEtage(etage);
    });
    setStatsByEtage(etageStats);
  };

  // Gérer la sélection d'une machine
  const handleMachineSelect = (machine) => {
    // Si nous sommes en mode de sélection multiple pour la maintenance collective
    if (showMaintenanceCollective) {
      // Vérifier si la machine est déjà sélectionnée
      const isSelected = machinesSelectionnees.some(id => id === machine.id);
      
      if (isSelected) {
        // Désélectionner la machine
        setMachinesSelectionnees(machinesSelectionnees.filter(id => id !== machine.id));
      } else {
        // Sélectionner la machine
        setMachinesSelectionnees([...machinesSelectionnees, machine.id]);
      }
    } else {
      // Mode normal - afficher les détails d'une machine
      setMachineSelectionnee(machine);
      
      // Charger les interventions pour cette machine
      const machineInterventions = dataService.getInterventions(machine.id);
      setInterventions({
        ...interventions,
        [machine.id]: machineInterventions
      });
    }
  };

  // Mettre à jour l'état d'une machine
  const updateMachineEtat = (id, nouveauEtat) => {
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
      updateStats();
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

  // Ajouter une nouvelle intervention
  const addIntervention = () => {
    if (machineSelectionnee && nouvelleIntervention.description) {
      // Ajouter via le service de données
      if (dataService.addIntervention(machineSelectionnee.id, nouvelleIntervention)) {
        // Mettre à jour l'état local des interventions
        const updatedInterventions = {
          ...interventions,
          [machineSelectionnee.id]: dataService.getInterventions(machineSelectionnee.id)
        };
        setInterventions(updatedInterventions);
        
        // Mettre à jour la date de dernière vérification dans l'UI
        const updatedMachine = dataService.getMachineById(machineSelectionnee.id);
        setMachineSelectionnee(updatedMachine);
        
        // Mettre à jour la liste des machines et les statistiques
        updateMachinesList();
        
        // Réinitialiser le formulaire
        setNouvelleIntervention({
          date: new Date().toISOString().split('T')[0],
          type: 'Maintenance',
          description: '',
          technicien: ''
        });
      }
    }
  };
  
  // Supprimer une intervention
  const deleteIntervention = (machineId, index) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      if (dataService.deleteIntervention(machineId, index)) {
        // Mettre à jour l'état local des interventions
        const updatedInterventions = {
          ...interventions,
          [machineId]: dataService.getInterventions(machineId)
        };
        setInterventions(updatedInterventions);
        
        // Mettre à jour la date de dernière vérification dans l'UI
        const updatedMachine = dataService.getMachineById(machineId);
        
        // Mettre à jour la machine sélectionnée si nécessaire
        if (machineSelectionnee && machineSelectionnee.id === machineId) {
          setMachineSelectionnee(updatedMachine);
        }
        
        // Mettre à jour la liste des machines et les statistiques
        updateMachinesList();
      }
    }
  };
  
  // Réinitialiser toutes les données
  const resetAllData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action ne peut pas être annulée.')) {
      if (dataService.resetAllData()) {
        // Recharger toutes les données
        loadAllData();
        
        // Réinitialiser la sélection
        setMachineSelectionnee(null);
        setInterventions({});
        
        alert('Toutes les données ont été réinitialisées avec succès.');
      }
    }
  };
  
  // Exporter les données
  const handleExport = () => {
    const jsonData = dataService.exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `carnet-maintenance-pac-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Importer des données
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonData = e.target.result;
      if (dataService.importData(jsonData)) {
        // Recharger les données après l'import
        loadAllData();
        
        // Réinitialiser la sélection
        setMachineSelectionnee(null);
        setInterventions({});
        
        alert('Données importées avec succès !');
      } else {
        alert('Erreur lors de l\'importation des données. Vérifiez le format du fichier.');
      }
    };
    reader.readAsText(file);
    
    // Réinitialiser l'input file
    event.target.value = '';
  };
  
  // Mettre à jour la liste des machines et les statistiques
  const updateMachinesList = () => {
    const allMachines = dataService.getAllMachines();
    setMachines(allMachines);
    updateStats();
  };
  
  // Mettre à jour les statistiques
  const updateStats = () => {
    setStats(dataService.getStatistics());
    
    const etageStats = {};
    etages.forEach(etage => {
      etageStats[etage] = dataService.getStatisticsByEtage(etage);
    });
    setStatsByEtage(etageStats);
  };
  
  // Activer/désactiver le mode de maintenance collective
  const toggleMaintenanceCollective = () => {
    setShowMaintenanceCollective(!showMaintenanceCollective);
    
    if (showMaintenanceCollective) {
      // Désactiver le mode et réinitialiser les sélections
      setMachinesSelectionnees([]);
    } else {
      // Si on active le mode, désélectionner la machine courante
      setMachineSelectionnee(null);
    }
  };
  
  // Ajouter une intervention de maintenance collective sur plusieurs machines
  const addMaintenanceCollective = () => {
    if (machinesSelectionnees.length === 0 || !maintenanceCollective.technicien) {
      alert('Veuillez sélectionner au moins une machine et renseigner un technicien.');
      return;
    }
    
    if (window.confirm(`Êtes-vous sûr de vouloir ajouter cette intervention de maintenance sur ${machinesSelectionnees.length} machine(s) ?`)) {
      // Ajouter l'intervention via le service de données
      if (dataService.addInterventionToMultipleMachines(machinesSelectionnees, maintenanceCollective)) {
        // Mettre à jour la liste des machines et les statistiques
        updateMachinesList();
        
        // Réinitialiser le formulaire
        setMaintenanceCollective({
          date: new Date().toISOString().split('T')[0],
          type: 'Maintenance',
          description: 'Maintenance filtres et filtres à tamis + essais de fonctionnement',
          technicien: ''
        });
        
        // Désactiver le mode maintenance collective
        setShowMaintenanceCollective(false);
        setMachinesSelectionnees([]);
        
        alert('Maintenance collective ajoutée avec succès!');
      }
    }
  };
  
  // Annuler la maintenance collective
  const cancelMaintenanceCollective = () => {
    setShowMaintenanceCollective(false);
    setMachinesSelectionnees([]);
  };
  
  // Basculer l'état ouvert/fermé d'un étage
  const toggleEtage = (etage) => {
    setEtagesOuverts({
      ...etagesOuverts,
      [etage]: !etagesOuverts[etage]
    });
  };
  
  // Organiser les machines par étage
  const machinesParEtage = {};
  etages.forEach(etage => {
    machinesParEtage[etage] = machines.filter(machine => machine.etage === etage);
  });

  // Filtrer les machines selon les critères sélectionnés
  const machinesFiltrees = machines.filter(machine => {
    const matchEtage = etageFiltre === 'Tous' || machine.etage === etageFiltre;
    const matchEtat = etatFiltre === 'Tous' || machine.etat === etatFiltre;
    const matchSearch = !searchTerm || 
                      machine.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (machine.notes && machine.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchEtage && matchEtat && matchSearch;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* En-tête */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Database className="mr-2" />
            <h1 className="text-xl font-bold">Carnet de Maintenance PAC</h1>
          </div>
          <div className="flex space-x-4">
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-green-500 rounded-md flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-1" /> {stats.fonctionnels} Fonctionnels
              </span>
              <span className="px-2 py-1 bg-red-500 rounded-md flex items-center text-sm">
                <AlertTriangle className="w-4 h-4 mr-1" /> {stats.hs} HS
              </span>
              <span className="px-2 py-1 bg-gray-500 rounded-md flex items-center text-sm">
                <Settings className="w-4 h-4 mr-1" /> {stats.nonVerifies} Non vérifiés
              </span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={toggleMaintenanceCollective}
                className={`${showMaintenanceCollective ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-700 hover:bg-blue-800'} text-white px-3 py-1 rounded flex items-center text-sm`}
                title="Maintenance collective"
              >
                <Wrench className="w-4 h-4 mr-1" /> {showMaintenanceCollective ? 'Annuler maintenance' : 'Maintenance collective'}
              </button>
              <button 
                onClick={handleExport}
                className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded flex items-center text-sm"
                title="Exporter les données"
              >
                <Save className="w-4 h-4 mr-1" /> Exporter
              </button>
              <label className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded flex items-center text-sm cursor-pointer"
                     title="Importer des données">
                <Upload className="w-4 h-4 mr-1" /> Importer
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleImport}
                />
              </label>
              <button 
                onClick={resetAllData}
                className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded flex items-center text-sm"
                title="Réinitialiser toutes les données"
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtres et recherche */}
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
              placeholder="Rechercher..."
              className="border rounded p-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Module de maintenance collective */}
      <MaintenanceCollective 
        isActive={showMaintenanceCollective}
        machinesSelectionnees={machinesSelectionnees}
        maintenance={maintenanceCollective}
        setMaintenance={setMaintenanceCollective}
        onValider={addMaintenanceCollective}
        onAnnuler={cancelMaintenanceCollective}
      />

      {/* Contenu principal - Liste et détail */}
      <div className="flex flex-1 overflow-hidden">
        {/* Liste des machines (côté gauche) */}
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
                multiSelectionMode={showMaintenanceCollective}
                selectedMachines={machinesSelectionnees}
              />
            ))
          ) : (
            // Affichage des résultats filtrés sans regroupement
            <div className="space-y-2">
              {machinesFiltrees.map(machine => (
                <div 
                  key={machine.id}
                  className={`p-2 border rounded cursor-pointer transition hover:bg-gray-50 ${
                    (machineSelectionnee?.id === machine.id ? 'bg-blue-50 border-blue-300' : '') ||
                    (machinesSelectionnees.includes(machine.id) ? 'bg-orange-50 border-orange-300' : '')
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
                  {machine.notes && (
                    <p className="text-sm text-gray-600 mt-1 truncate">{machine.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Détail de la machine (côté droit) */}
        <div className="flex-1 overflow-auto p-4">
          {machineSelectionnee && !showMaintenanceCollective ? (
            <MachineDetails 
              machine={machineSelectionnee}
              interventions={interventions[machineSelectionnee.id] || []}
              onUpdateEtat={updateMachineEtat}
              onUpdateNotes={updateMachineNotes}
              onDeleteIntervention={deleteIntervention}
              nouvelleIntervention={nouvelleIntervention}
              setNouvelleIntervention={setNouvelleIntervention}
              onAddIntervention={addIntervention}
            />
          ) : !showMaintenanceCollective ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-16 h-16 mb-4" />
              <p>Sélectionnez une machine pour afficher ses détails</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Wrench className="w-16 h-16 mb-4" />
              <p>Sélectionnez les machines à inclure dans la maintenance collective</p>
              <p className="mt-2 text-sm text-orange-600">{machinesSelectionnees.length} machine(s) sélectionnée(s)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarnetMaintenancePAC;
