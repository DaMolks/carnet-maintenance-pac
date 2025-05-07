import React, { useState } from 'react';
import { PlusCircle, Trash2, Tag, History } from 'lucide-react';

// Liste des pannes courantes pour suggestion rapide (identique à MaintenanceCollectiveDetail)
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

/**
 * Composant affichant les détails d'une machine et ses interventions
 */
const MachineDetails = ({ 
  machine, 
  interventions = [], 
  onUpdateEtat, 
  onUpdateNotes, 
  onDeleteIntervention,
  nouvelleIntervention,
  setNouvelleIntervention,
  onAddIntervention,
  onUpdateSerialNumber,
  onUpdateNeuronId,
  idHistory = {}
}) => {
  const [showTags, setShowTags] = useState(false);
  const [showIdHistory, setShowIdHistory] = useState(false);
  
  // Ajouter un tag de panne courante à la description
  const addTagToDescription = (tag) => {
    const newDescription = nouvelleIntervention.description 
      ? `${nouvelleIntervention.description}, ${tag}`
      : tag;
    
    setNouvelleIntervention({
      ...nouvelleIntervention,
      description: newDescription
    });
    
    // Fermer la liste des tags
    setShowTags(false);
  };
  
  if (!machine) return null;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{machine.id}</h2>
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => onUpdateEtat(machine.id, 'Fonctionnel')}
          >
            Marquer Fonctionnel
          </button>
          <button 
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => onUpdateEtat(machine.id, 'HS')}
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
            <p>{machine.etage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">État actuel</p>
            <p className={`font-medium ${
              machine.etat === 'Fonctionnel' ? 'text-green-600' :
              machine.etat === 'HS' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {machine.etat}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dernière vérification</p>
            <p>{machine.derniereVerification}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Maintenance prévue</p>
            <p>{machine.maintenancePrevue}</p>
          </div>
        </div>
      </div>
      
      {/* Identifiants techniques */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Identifiants techniques</h3>
          <button
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            onClick={() => setShowIdHistory(!showIdHistory)}
          >
            <History size={16} className="mr-1" />
            {showIdHistory ? "Masquer l'historique" : "Voir l'historique"}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Numéro de série</p>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={machine.serialNumber || ""}
              onChange={(e) => onUpdateSerialNumber(machine.id, e.target.value)}
              placeholder="Entrez le numéro de série"
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Neuron ID</p>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={machine.neuronId || ""}
              onChange={(e) => onUpdateNeuronId(machine.id, e.target.value)}
              placeholder="Entrez le Neuron ID"
            />
          </div>
        </div>
        
        {/* Historique des modifications des identifiants */}
        {showIdHistory && (
          <div className="mt-4 border-t pt-3">
            <h4 className="text-md font-medium mb-2">Historique des modifications</h4>
            {idHistory && idHistory.entries && idHistory.entries.length > 0 ? (
              <div className="overflow-auto max-h-48">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Champ</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur précédente</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nouvelle valeur</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {idHistory.entries.map((entry, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 whitespace-nowrap">{entry.date}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{entry.field}</td>
                        <td className="px-4 py-2">{entry.oldValue || "-"}</td>
                        <td className="px-4 py-2">{entry.newValue}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{entry.user || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucune modification enregistrée.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Notes */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <p className="text-sm text-gray-500 mb-1">Notes</p>
        <textarea
          className="w-full border rounded p-2"
          rows="2"
          value={machine.notes || ""}
          onChange={(e) => onUpdateNotes(machine.id, e.target.value)}
          placeholder="Ajouter des notes sur cette machine"
        />
      </div>
      
      {/* Historique des interventions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-lg font-medium mb-2">Historique des interventions</h3>
        
        {interventions.length > 0 ? (
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
                {interventions.map((intervention, idx) => (
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
                          onDeleteIntervention(machine.id, idx);
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
              type="text"
              className="w-full border rounded p-2"
              placeholder="JJ/MM/AAAA"
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
          <div className="col-span-2 relative">
            <label className="block text-sm text-gray-500 mb-1">Description</label>
            <div className="flex">
              <textarea
                className="w-full border rounded p-2"
                rows="2"
                value={nouvelleIntervention.description}
                onChange={(e) => setNouvelleIntervention({
                  ...nouvelleIntervention,
                  description: e.target.value
                })}
              />
              <button
                className="ml-2 p-2 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => setShowTags(!showTags)}
                title="Tags de pannes courantes"
              >
                <Tag size={20} />
              </button>
            </div>
            
            {/* Liste des tags de pannes courantes */}
            {showTags && (
              <div className="absolute z-10 right-0 mt-1 w-64 bg-white border rounded-md shadow-lg p-2">
                <div className="grid grid-cols-1 gap-1">
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
              onClick={onAddIntervention}
              disabled={!nouvelleIntervention.description}
            >
              <PlusCircle className="w-4 h-4 mr-1" /> Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineDetails;