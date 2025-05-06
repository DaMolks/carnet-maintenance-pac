import React, { useState, useEffect } from 'react';
import { Database, FileText, AlertTriangle, CheckCircle, Settings, Calendar, Search, 
         Filter, PlusCircle, Save, Upload, Trash2, RefreshCw } from 'lucide-react';

// Importer le service de données
import dataService from '../services/DataService';

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
  
  // Chargement initial des données
  useEffect(() => {
    loadAllData();
  }, []);
  
  // Fonction pour charger toutes les données
  const loadAllData = () => {
    // Charger toutes les machines
    const allMachines = dataService.getAllMachines();
    setMachines(allMachines);
    
    // Charger les statistiques
    setStats(dataService.getStatistics());
  };

  // Filtrer les machines selon les critères
  const machinesFiltrees = machines.filter(machine => {
    const matchEtage = etageFiltre === 'Tous' || machine.etage === etageFiltre;
    const matchEtat = etatFiltre === 'Tous' || machine.etat === etatFiltre;
    const matchSearch = !searchTerm || machine.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (machine.notes && machine.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchEtage && matchEtat && matchSearch;
  });

  // Regrouper les machines par étage pour l'affichage par onglets
  const machinesParEtage = {};
  etages.forEach(etage => {
    machinesParEtage[etage] = machines.filter(machine => machine.etage === etage);
  });

  // Gérer la sélection d'une machine
  const handleMachineSelect = (machine) => {
    setMachineSelectionnee(machine);
    
    // Charger les interventions pour cette machine
    const machineInterventions = dataService.getInterventions(machine.id);
    setInterventions({
      ...interventions,
      [machine.id]: machineInterventions
    });
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
      setStats(dataService.getStatistics());
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
        
        // Mettre à jour la liste des machines
        setMachines(machines.map(machine => 
          machine.id === machineSelectionnee.id ? updatedMachine : machine
        ));
        
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
        
        // Mettre à jour la liste des machines
        setMachines(machines.map(machine => 
          machine.id === machineId ? updatedMachine : machine
        ));
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

      {/* Contenu principal - Liste et détail */}
      <div className="flex flex-1 overflow-hidden">
        {/* Liste des machines (côté gauche) */}
        <div className="w-1/3 overflow-auto bg-white border-r p-4">
          <h2 className="text-lg font-semibold mb-4">Machines PAC</h2>
          
          {etageFiltre === 'Tous' ? (
            // Affichage groupé par étage
            etages.map(etage => (
              <div key={etage} className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Étage {etage}</h3>
                <div className="space-y-2">
                  {machinesParEtage[etage]?.filter(machine => {
                    const matchEtat = etatFiltre === 'Tous' || machine.etat === etatFiltre;
                    const matchSearch = !searchTerm || machine.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        (machine.notes && machine.notes.toLowerCase().includes(searchTerm.toLowerCase()));
                    return matchEtat && matchSearch;
                  }).map(machine => (
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
                      {machine.notes && (
                        <p className="text-sm text-gray-600 mt-1 truncate">{machine.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
          {machineSelectionnee ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{machineSelectionnee.id}</h2>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => updateMachineEtat(machineSelectionnee.id, 'Fonctionnel')}
                  >
                    Marquer Fonctionnel
                  </button>
                  <button 
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => updateMachineEtat(machineSelectionnee.id, 'HS')}
                  >
                    Marquer HS
                  </button>
                </div>
              </div>
              
              {/* Informations générales */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 className="text-lg font-medium mb-2">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Étage</p>
                    <p>{machineSelectionnee.etage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">État actuel</p>
                    <p className={`font-medium ${
                      machineSelectionnee.etat === 'Fonctionnel' ? 'text-green-600' :
                      machineSelectionnee.etat === 'HS' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {machineSelectionnee.etat}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dernière vérification</p>
                    <p>{machineSelectionnee.derniereVerification}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Maintenance prévue</p>
                    <p>{machineSelectionnee.maintenancePrevue}</p>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <textarea
                    className="w-full border rounded p-2"
                    rows="2"
                    value={machineSelectionnee.notes}
                    onChange={(e) => updateMachineNotes(machineSelectionnee.id, e.target.value)}
                  />
                </div>
              </div>
              
              {/* Historique des interventions */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 className="text-lg font-medium mb-2">Historique des interventions</h3>
                
                {interventions[machineSelectionnee.id]?.length > 0 ? (
                  <div className="overflow-auto max-h-48">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technicien</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {interventions[machineSelectionnee.id].map((intervention, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{intervention.date}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{intervention.type}</td>
                            <td className="px-4 py-2 text-sm">{intervention.description}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{intervention.technicien}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteIntervention(machineSelectionnee.id, idx);
                                }}
                                title="Supprimer cette intervention"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Aucune intervention enregistrée</p>
                )}
              </div>
              
              {/* Formulaire nouvelle intervention */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-medium mb-2">Ajouter une intervention</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full border rounded p-2"
                      value={nouvelleIntervention.date}
                      onChange={(e) => setNouvelleIntervention({
                        ...nouvelleIntervention,
                        date: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Type</label>
                    <select
                      className="w-full border rounded p-2"
                      value={nouvelleIntervention.type}
                      onChange={(e) => setNouvelleIntervention({
                        ...nouvelleIntervention,
                        type: e.target.value
                      })}
                    >
                      <option>Maintenance</option>
                      <option>Réparation</option>
                      <option>Inspection</option>
                      <option>Remplacement</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-500 mb-1">Description</label>
                    <textarea
                      className="w-full border rounded p-2"
                      rows="2"
                      value={nouvelleIntervention.description}
                      onChange={(e) => setNouvelleIntervention({
                        ...nouvelleIntervention,
                        description: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Technicien</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      value={nouvelleIntervention.technicien}
                      onChange={(e) => setNouvelleIntervention({
                        ...nouvelleIntervention,
                        technicien: e.target.value
                      })}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                      onClick={addIntervention}
                    >
                      <PlusCircle className="w-4 h-4 mr-1" /> Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-16 h-16 mb-4" />
              <p>Sélectionnez une machine pour afficher ses détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarnetMaintenancePAC;
