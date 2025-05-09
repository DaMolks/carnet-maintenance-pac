import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, CheckSquare, Square, Save, Search, Filter, Tag } from 'lucide-react';

// Liste des pannes courantes pour suggestion rapide
const TAGS_PANNES_COURANTES = [
  "Ventilateur HS", 
  "Compresseur HS", 
  "Fusible HS", 
  "Non communiquant", 
  "Filtre sale", 
  "Filtre à tamis obstrué", 
  "Régulateur HS", 
  "Mauvais zoning", 
  "Problème condensats", 
  "Sonde t° HS", 
  "Non opérable via GTB"
];

const MaintenanceCollectiveDetail = ({
  machines,
  etages,
  onReturn,
  onSubmit,
  interventionBase
}) => {
  // État pour stocker les machines avec leur statut de sélection et leur état
  const [machinesStatus, setMachinesStatus] = useState([]);
  // État pour stocker les informations de l'intervention
  const [intervention, setIntervention] = useState({
    date: interventionBase.date,
    technicien: interventionBase.technicien,
    description: interventionBase.description,
    type: interventionBase.type || 'Maintenance' // S'assurer que le type est défini
  });
  // État pour filtrer les machines
  const [etageFiltre, setEtageFiltre] = useState("Tous");
  const [etatFiltre, setEtatFiltre] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  // Afficher ou masquer les pannes courantes
  const [showTags, setShowTags] = useState(false);
  
  // Nouvel état pour gérer les tags par machine
  const [machinesTags, setMachinesTags] = useState({});
  const [activeTagMachine, setActiveTagMachine] = useState(null);
  
  // Initialiser l'état des machines au chargement du composant
  useEffect(() => {
    setMachinesStatus(
      machines.map(machine => ({
        ...machine,
        selected: false,
        newStatus: machine.etat
      }))
    );
  }, [machines]);
  
  // Filtrer les machines selon les critères
  const machinesFiltrees = machinesStatus.filter(machine => {
    const matchEtage = etageFiltre === "Tous" || machine.etage === etageFiltre;
    const matchEtat = etatFiltre === "Tous" || machine.etat === etatFiltre;
    const matchSearch = !searchTerm || 
                     machine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     (machine.notes && machine.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchEtage && matchEtat && matchSearch;
  });
  
  // Sélectionner/désélectionner une machine
  const toggleMachine = (id) => {
    setMachinesStatus(prevStatus => 
      prevStatus.map(machine => 
        machine.id === id ? { ...machine, selected: !machine.selected } : machine
      )
    );
  };
  
  // Sélectionner/désélectionner toutes les machines filtrées
  const toggleSelectAll = () => {
    const someSelected = machinesFiltrees.some(machine => machine.selected);
    
    setMachinesStatus(prevStatus => {
      const filteredIds = new Set(machinesFiltrees.map(machine => machine.id));
      
      return prevStatus.map(machine => {
        if (filteredIds.has(machine.id)) {
          return { ...machine, selected: !someSelected };
        }
        return machine;
      });
    });
  };
  
  // Définir un nouvel état pour une machine
  const setMachineNewStatus = (id, newStatus) => {
    setMachinesStatus(prevStatus => 
      prevStatus.map(machine => 
        machine.id === id ? { ...machine, newStatus } : machine
      )
    );
  };
  
  // Définir un état pour toutes les machines sélectionnées
  const setSelectedMachinesStatus = (newStatus) => {
    setMachinesStatus(prevStatus => 
      prevStatus.map(machine => 
        machine.selected ? { ...machine, newStatus } : machine
      )
    );
  };
  
  // Ajouter un tag de panne courante à la description
  const addTagToDescription = (tag) => {
    const newDescription = intervention.description 
      ? `${intervention.description}, ${tag}`
      : tag;
    
    setIntervention({
      ...intervention,
      description: newDescription
    });
    
    // Fermer la liste des tags
    setShowTags(false);
  };
  
  // Nouvelle fonction pour ajouter un tag à une machine spécifique
  const addTagToMachine = (machineId, tag) => {
    setMachinesTags(prev => {
      const currentTags = prev[machineId] || '';
      const newTags = currentTags ? `${currentTags}, ${tag}` : tag;
      return {
        ...prev,
        [machineId]: newTags
      };
    });
    setActiveTagMachine(null); // Fermer le sélecteur de tags
  };
  
  // Calculer le nombre de machines sélectionnées
  const selectedCount = machinesStatus.filter(machine => machine.selected).length;
  
  // Valider la maintenance collective
  const handleSubmit = () => {
    if (selectedCount === 0) {
      alert("Veuillez sélectionner au moins une machine");
      return;
    }
    
    if (!intervention.technicien) {
      alert("Veuillez saisir le nom du technicien");
      return;
    }
    
    if (!intervention.description) {
      alert("Veuillez saisir une description de l'intervention");
      return;
    }
    
    // Préparer les données pour la soumission en incluant les tags spécifiques
    const selectedMachines = machinesStatus
      .filter(machine => machine.selected)
      .map(machine => {
        // Récupérer les tags spécifiques à cette machine s'ils existent
        const machineSpecificTags = machinesTags[machine.id] || '';
        
        return {
          id: machine.id,
          newStatus: machine.newStatus,
          // Ajouter les tags à la description individuelle si présents
          specificDescription: machineSpecificTags 
                            ? `${intervention.description} - Problèmes spécifiques: ${machineSpecificTags}`
                            : intervention.description
        };
      });
    
    // Appeler la fonction de soumission fournie par le parent
    onSubmit({
      machines: selectedMachines,
      intervention: {
        ...intervention,
        useSpecificDescriptions: true // Nouveau flag pour indiquer d'utiliser des descriptions spécifiques
      }
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="bg-orange-100 border-orange-300 border-b p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={onReturn}
              className="mr-4 p-2 hover:bg-orange-200 rounded-full"
              title="Retour"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-bold">Maintenance Collective Détaillée</h2>
          </div>
          <span className="text-orange-700 font-medium">
            {selectedCount} machine(s) sélectionnée(s)
          </span>
        </div>
      </div>
      
      {/* Corps principal - Mise en page à deux colonnes 1/3 - 2/3 */}
      <div className="flex flex-1 overflow-hidden mx-4 mb-4">
        {/* Colonne gauche (1/3) - Liste des machines */}
        <div className="w-1/3 pr-4 overflow-auto">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Machines ({machinesFiltrees.length})</h3>
              <div className="flex space-x-2">
                <button
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center"
                  onClick={toggleSelectAll}
                  title={machinesFiltrees.some(m => m.selected) ? "Désélectionner tout" : "Sélectionner tout"}
                >
                  {machinesFiltrees.some(m => m.selected) ? (
                    <Square className="w-3 h-3 mr-1" />
                  ) : (
                    <CheckSquare className="w-3 h-3 mr-1" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Filtres */}
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <Filter className="text-gray-500 mr-2" size={14} />
                <select 
                  className="border rounded p-1 text-sm w-full"
                  value={etageFiltre}
                  onChange={(e) => setEtageFiltre(e.target.value)}
                >
                  <option value="Tous">Tous les étages</option>
                  {etages.map(etage => (
                    <option key={etage} value={etage}>{etage}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center mb-2">
                <select 
                  className="border rounded p-1 text-sm w-full"
                  value={etatFiltre}
                  onChange={(e) => setEtatFiltre(e.target.value)}
                >
                  <option value="Tous">Tous les états</option>
                  <option value="Fonctionnel">Fonctionnel</option>
                  <option value="HS">HS</option>
                  <option value="Non vérifié">Non vérifié</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="border rounded p-1 text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Liste déroulante des machines */}
            <div className="overflow-auto max-h-[calc(100vh-350px)]">
              {machinesFiltrees.length > 0 ? (
                <div className="grid gap-2">
                  {machinesFiltrees.map(machine => (
                    <div 
                      key={machine.id}
                      className={`p-2 border rounded flex items-center ${ 
                        machine.selected ? 'bg-orange-50 border-orange-300' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleMachine(machine.id)}
                    >
                      <div className="mr-2">
                        {machine.selected ? (
                          <CheckSquare className="w-5 h-5 text-orange-500" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium truncate">{machine.id}</span>
                          <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${ 
                            machine.etat === 'Fonctionnel' ? 'bg-green-100 text-green-800' :
                            machine.etat === 'HS' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {machine.etat}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          Étage: {machine.etage}
                          {machinesTags[machine.id] && (
                            <span className="ml-2 text-blue-600">Tags: {machinesTags[machine.id]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">Aucune machine ne correspond aux critères.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Colonne droite (2/3) - Options, détails et actions */}
        <div className="w-2/3 overflow-auto">
          {/* Informations de l'intervention */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Informations de l'intervention</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  placeholder="JJ/MM/AAAA"
                  value={intervention.date}
                  onChange={(e) => setIntervention({
                    ...intervention,
                    date: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Technicien</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  placeholder="Nom du technicien"
                  value={intervention.technicien}
                  onChange={(e) => setIntervention({
                    ...intervention,
                    technicien: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type d'intervention</label>
                <select
                  className="w-full border rounded p-2"
                  value={intervention.type}
                  onChange={(e) => setIntervention({
                    ...intervention,
                    type: e.target.value
                  })}
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Réparation">Réparation</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Remplacement">Remplacement</option>
                </select>
              </div>
              <div className="col-span-2 relative">
                <label className="block text-sm text-gray-700 mb-1">Description générale</label>
                <div className="flex">
                  <textarea
                    className="flex-1 border rounded p-2"
                    rows="2"
                    placeholder="Description de l'intervention commune à toutes les machines"
                    value={intervention.description}
                    onChange={(e) => setIntervention({
                      ...intervention,
                      description: e.target.value
                    })}
                  />
                  <button
                    className="ml-2 p-2 bg-gray-100 hover:bg-gray-200 rounded"
                    onClick={() => setShowTags(!showTags)}
                    title="Tags de pannes courantes pour toutes les machines"
                  >
                    <Tag size={20} />
                  </button>
                </div>
                
                {/* Liste des tags de pannes courantes pour la description générale */}
                {showTags && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg p-2">
                    <div className="grid grid-cols-2 gap-2">
                      {TAGS_PANNES_COURANTES.map((tag, index) => (
                        <button
                          key={index}
                          className="text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                          onClick={() => addTagToDescription(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions pour les machines sélectionnées */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Actions pour les machines sélectionnées</h3>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center"
                onClick={() => setSelectedMachinesStatus('Fonctionnel')}
                disabled={selectedCount === 0}
              >
                <Check className="w-5 h-5 mr-2" />
                Marquer fonctionnel
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded flex items-center"
                onClick={() => setSelectedMachinesStatus('HS')}
                disabled={selectedCount === 0}
              >
                <X className="w-5 h-5 mr-2" />
                Marquer HS
              </button>
            </div>
            
            {/* Tableau des machines sélectionnées avec leurs états */}
            {selectedCount > 0 && (
              <div className="overflow-auto max-h-[calc(100vh-450px)]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État actuel</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nouvel état</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags spécifiques</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {machinesStatus
                      .filter(machine => machine.selected)
                      .map(machine => (
                        <tr key={machine.id}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <div className="font-medium">{machine.id}</div>
                            <div className="text-xs text-gray-500">Étage: {machine.etage}</div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <span className={`px-2 py-0.5 rounded ${ 
                              machine.etat === 'Fonctionnel' ? 'bg-green-100 text-green-800' :
                              machine.etat === 'HS' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {machine.etat}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <select
                              className={`border rounded p-1 ${ 
                                machine.newStatus === 'Fonctionnel' ? 'bg-green-50 border-green-200' :
                                machine.newStatus === 'HS' ? 'bg-red-50 border-red-200' :
                                'bg-gray-50'
                              }`}
                              value={machine.newStatus}
                              onChange={(e) => setMachineNewStatus(machine.id, e.target.value)}
                            >
                              <option value="Fonctionnel">Fonctionnel</option>
                              <option value="HS">HS</option>
                              <option value="Non vérifié">Non vérifié</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <div className="flex items-center">
                              <span className="mr-2 truncate max-w-[200px]">
                                {machinesTags[machine.id] || '-'}
                              </span>
                              <div className="relative">
                                <button
                                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded"
                                  onClick={() => setActiveTagMachine(activeTagMachine === machine.id ? null : machine.id)}
                                  title="Ajouter un tag spécifique"
                                >
                                  <Tag size={16} />
                                </button>
                                
                                {activeTagMachine === machine.id && (
                                  <div className="absolute z-10 right-0 mt-1 w-64 bg-white border rounded-md shadow-lg p-2">
                                    <div className="grid grid-cols-1 gap-1">
                                      {TAGS_PANNES_COURANTES.map((tag, index) => (
                                        <button
                                          key={index}
                                          className="text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                                          onClick={() => addTagToMachine(machine.id, tag)}
                                        >
                                          {tag}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {selectedCount === 0 && (
              <p className="text-gray-500 text-center py-8">
                Sélectionnez des machines dans la liste pour les afficher ici.
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t bg-gray-50 mt-auto">
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            onClick={onReturn}
          >
            Annuler
          </button>
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center"
            onClick={handleSubmit}
            disabled={selectedCount === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Valider la maintenance ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCollectiveDetail;