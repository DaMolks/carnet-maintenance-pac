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
    description: interventionBase.description
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
      
      {/* Section formulaire */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 mx-4">
        <h3 className="text-lg font-medium mb-4">Informations de l'intervention</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          <div className="md:col-span-2 relative">
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
      
      {/* Filtres et actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 mx-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <Filter className="text-gray-500 mr-2" size={16} />
              <label className="mr-2 text-gray-700 text-sm">Étage:</label>
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
              <label className="mr-2 text-gray-700 text-sm">État:</label>
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
            
            <div className="flex items-center">
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
          
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center"
              onClick={toggleSelectAll}
            >
              {machinesFiltrees.some(m => m.selected) ? (
                <>
                  <Square className="w-4 h-4 mr-1" />
                  Désélectionner tout
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Sélectionner tout
                </>
              )}
            </button>
            <button
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm flex items-center"
              onClick={() => setSelectedMachinesStatus('Fonctionnel')}
              disabled={selectedCount === 0}
            >
              <Check className="w-4 h-4 mr-1" />
              Marquer fonctionnel
            </button>
            <button
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm flex items-center"
              onClick={() => setSelectedMachinesStatus('HS')}
              disabled={selectedCount === 0}
            >
              <X className="w-4 h-4 mr-1" />
              Marquer HS
            </button>
          </div>
        </div>
      </div>
      
      {/* Liste des machines */}
      <div className="flex-1 overflow-auto mx-4 bg-white rounded-lg shadow">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Machines ({machinesFiltrees.length})</h3>
          
          {machinesFiltrees.length > 0 ? (
            <div className="grid gap-3">
              {machinesFiltrees.map(machine => (
                <div 
                  key={machine.id}
                  className={`p-3 border rounded flex items-center ${ 
                    machine.selected ? 'bg-orange-50 border-orange-300' : 'hover:bg-gray-50'
                  }`}
                >
                  <div 
                    className="mr-3 cursor-pointer"
                    onClick={() => toggleMachine(machine.id)}
                  >
                    {machine.selected ? (
                      <CheckSquare className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{machine.id}</span>
                      <span className="text-gray-500 text-sm">{machine.etage}</span>
                    </div>
                    {machine.notes && (
                      <p className="text-sm text-gray-600 mt-1 truncate">{machine.notes}</p>
                    )}
                    {/* Afficher les tags spécifiques à cette machine s'ils existent */}
                    {machinesTags[machine.id] && (
                      <p className="text-sm text-blue-600 mt-1">Problèmes spécifiques: {machinesTags[machine.id]}</p>
                    )}
                  </div>
                  
                  <div className="ml-4 flex items-center">
                    <span className="mr-2 text-sm">État actuel:</span>
                    <span className={`px-2 py-0.5 rounded text-sm ${
                      machine.etat === 'Fonctionnel' ? 'bg-green-100 text-green-800' :
                      machine.etat === 'HS' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {machine.etat}
                    </span>
                  </div>
                  
                  <div className="ml-4">
                    <span className="mr-2 text-sm">Nouvel état:</span>
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
                  </div>
                  
                  {/* Nouveau bouton de tag par machine */}
                  <div className="ml-4 relative">
                    <button
                      className="p-1 bg-gray-100 hover:bg-gray-200 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTagMachine(activeTagMachine === machine.id ? null : machine.id);
                      }}
                      title="Tags de pannes spécifiques à cette machine"
                    >
                      <Tag size={16} />
                    </button>
                    
                    {/* Afficher les tags disponibles si cette machine est active */}
                    {activeTagMachine === machine.id && (
                      <div className="absolute z-10 right-0 mt-1 w-64 bg-white border rounded-md shadow-lg p-2">
                        <div className="grid grid-cols-1 gap-1">
                          {TAGS_PANNES_COURANTES.map((tag, index) => (
                            <button
                              key={index}
                              className="text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                addTagToMachine(machine.id, tag);
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune machine ne correspond aux critères de recherche.</p>
          )}
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