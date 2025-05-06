import React, { useState, useEffect } from 'react';
import { Database, FileText, AlertTriangle, CheckCircle, Settings, Calendar, Search, Filter, PlusCircle } from 'lucide-react';

// Structure de données pour les machines PAC
const initialMachines = [
  // 1er étage
  { id: 'A0101', etage: '1', etat: 'Fonctionnel', derniereVerification: '2025-04-15', maintenancePrevue: '2025-07-15', notes: 'RAS' },
  { id: 'A0102', etage: '1', etat: 'Fonctionnel', derniereVerification: '2025-04-15', maintenancePrevue: '2025-07-15', notes: 'Filtre à changer prochainement' },
  { id: 'A0103', etage: '1', etat: 'Fonctionnel', derniereVerification: '2025-04-16', maintenancePrevue: '2025-07-16', notes: 'RAS' },
  { id: 'A0103b', etage: '1', etat: 'HS', derniereVerification: '2025-04-16', maintenancePrevue: '2025-05-20', notes: 'Panne compresseur - Pièce commandée' },
  // Quelques exemples pour les autres étages
  { id: 'A0201', etage: '2', etat: 'Fonctionnel', derniereVerification: '2025-04-10', maintenancePrevue: '2025-07-10', notes: 'RAS' },
  { id: 'A0301', etage: '3', etat: 'HS', derniereVerification: '2025-04-05', maintenancePrevue: '2025-05-15', notes: 'Problème électrique - Intervention prévue' },
  { id: 'TSGR1', etage: 'Technique', etat: 'Fonctionnel', derniereVerification: '2025-04-01', maintenancePrevue: '2025-07-01', notes: 'Vérification complète effectuée' },
];

// Tous les identifiants de machines
const allMachineIds = [
  'A0101', 'A0102', 'A0103', 'A0103b', 'A0104', 'A0105', 'A0106', 'A0107', 'A0108',
  'A0201', 'A0202', 'A0203', 'A0204', 'A0205', 'A0206', 'A0207', 'A0208',
  'A0301', 'A0302', 'A0303', 'A0304', 'A0305', 'A0306', 'A0306b', 'A0307', 'A0308',
  'A0401b', 'A0401', 'A0402', 'A0403', 'A0404', 'A0405', 'A0406', 'A0407', 'A0408', 'A0409', 'A0410', 'A0411', 'A0412',
  'A0501', 'A0502', 'A0503', 'A0504', 'A0505', 'A0506', 'A0507', 'A0507b', 'A0508', 'A0509', 'A0510', 'A0511', 'A0512', 'A0513', 'A0514', 'A0515', 'A0516',
  'A0601', 'A0602', 'A0603', 'A0604', 'A0605', 'A0606', 'A0606b', 'A0607', 'A0608', 'A0609', 'A0610', 'A0611', 'A0612',
  'TSGR1', 'TSGR2', 'TSGR3', 'TSGR4'
];

// Liste complète des étages
const etages = ['1', '2', '3', '4', '5', '6', 'Technique'];

const CarnetMaintenancePAC = () => {
  // État pour stocker les machines et leurs données
  const [machines, setMachines] = useState(() => {
    // Créer une liste complète avec tous les IDs
    const completeList = allMachineIds.map(id => {
      // Chercher si la machine existe déjà dans initialMachines
      const existingMachine = initialMachines.find(m => m.id === id);
      if (existingMachine) {
        return existingMachine;
      }
      
      // Déterminer l'étage basé sur l'ID
      let etage = 'Inconnu';
      if (id.startsWith('A01')) etage = '1';
      else if (id.startsWith('A02')) etage = '2';
      else if (id.startsWith('A03')) etage = '3';
      else if (id.startsWith('A04')) etage = '4';
      else if (id.startsWith('A05')) etage = '5';
      else if (id.startsWith('A06')) etage = '6';
      else if (id.startsWith('TSGR')) etage = 'Technique';
      
      // Créer une nouvelle entrée par défaut
      return {
        id,
        etage,
        etat: 'Non vérifié',
        derniereVerification: '-',
        maintenancePrevue: '-',
        notes: ''
      };
    });
    
    return completeList;
  });
  
  // Filtres et tri
  const [etageFiltre, setEtageFiltre] = useState('Tous');
  const [etatFiltre, setEtatFiltre] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [machineSelectionnee, setMachineSelectionnee] = useState(null);
  const [historiqueIntervention, setHistoriqueIntervention] = useState({});
  const [nouvelleIntervention, setNouvelleIntervention] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Maintenance',
    description: '',
    technicien: ''
  });

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
    
    // Simuler l'historique des interventions
    if (!historiqueIntervention[machine.id]) {
      // Générer un historique factice pour la démo
      setHistoriqueIntervention({
        ...historiqueIntervention,
        [machine.id]: [
          { date: '2025-01-15', type: 'Installation', description: 'Installation initiale', technicien: 'Martin D.' },
          { date: '2025-04-01', type: 'Maintenance', description: 'Vérification des filtres', technicien: 'Sophie L.' },
        ]
      });
    }
  };

  // Mettre à jour l'état d'une machine
  const updateMachineEtat = (id, nouveauEtat) => {
    setMachines(machines.map(machine => 
      machine.id === id ? { ...machine, etat: nouveauEtat } : machine
    ));
  };

  // Ajouter une nouvelle intervention
  const addIntervention = () => {
    if (machineSelectionnee && nouvelleIntervention.description) {
      const updatedHistorique = {
        ...historiqueIntervention,
        [machineSelectionnee.id]: [
          nouvelleIntervention,
          ...(historiqueIntervention[machineSelectionnee.id] || [])
        ]
      };
      
      setHistoriqueIntervention(updatedHistorique);
      
      // Mettre à jour la date de dernière vérification
      setMachines(machines.map(machine => 
        machine.id === machineSelectionnee.id ? 
          { ...machine, derniereVerification: nouvelleIntervention.date } : machine
      ));
      
      // Réinitialiser le formulaire
      setNouvelleIntervention({
        date: new Date().toISOString().split('T')[0],
        type: 'Maintenance',
        description: '',
        technicien: ''
      });
    }
  };

  // Statistiques générales
  const stats = {
    total: machines.length,
    fonctionnels: machines.filter(m => m.etat === 'Fonctionnel').length,
    hs: machines.filter(m => m.etat === 'HS').length,
    nonVerifies: machines.filter(m => m.etat === 'Non vérifié').length
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
                  {machinesParEtage[etage].filter(machine => {
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
                    onChange={(e) => {
                      const updatedNotes = e.target.value;
                      setMachines(machines.map(machine => 
                        machine.id === machineSelectionnee.id ? 
                          { ...machine, notes: updatedNotes } : machine
                      ));
                      setMachineSelectionnee({ ...machineSelectionnee, notes: updatedNotes });
                    }}
                  />
                </div>
              </div>
              
              {/* Historique des interventions */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 className="text-lg font-medium mb-2">Historique des interventions</h3>
                
                {historiqueIntervention[machineSelectionnee.id]?.length > 0 ? (
                  <div className="overflow-auto max-h-48">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technicien</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {historiqueIntervention[machineSelectionnee.id].map((intervention, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{intervention.date}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{intervention.type}</td>
                            <td className="px-4 py-2 text-sm">{intervention.description}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{intervention.technicien}</td>
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
