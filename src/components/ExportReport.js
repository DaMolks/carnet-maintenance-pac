import React, { useState, useEffect } from 'react';
import { X, FileText, Download } from 'lucide-react';
import dataService from '../services/DataService';
import { formatDateToFrench } from '../utils/dateUtils';

/**
 * Composant pour l'export de rapports clients
 */
const ExportReport = ({ onClose, machines, etages }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEtage, setSelectedEtage] = useState('Tous');
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [includeInterventions, setIncludeInterventions] = useState(true);
  const [includeIdentifiants, setIncludeIdentifiants] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [reportFormat, setReportFormat] = useState('pdf');
  
  const [filteredMachines, setFilteredMachines] = useState([]);
  
  // Filtrer les machines en fonction de l'étage
  useEffect(() => {
    let filtered = [...machines];
    
    if (selectedEtage !== 'Tous') {
      filtered = filtered.filter(machine => machine.etage === selectedEtage);
    }
    
    setFilteredMachines(filtered);
  }, [selectedEtage, machines]);
  
  // Sélectionner/désélectionner toutes les machines
  const toggleSelectAll = () => {
    if (selectedMachines.length === filteredMachines.length) {
      setSelectedMachines([]);
    } else {
      setSelectedMachines(filteredMachines.map(machine => machine.id));
    }
  };
  
  // Sélectionner/désélectionner une machine
  const toggleMachine = (machineId) => {
    if (selectedMachines.includes(machineId)) {
      setSelectedMachines(selectedMachines.filter(id => id !== machineId));
    } else {
      setSelectedMachines([...selectedMachines, machineId]);
    }
  };
  
  // Générer le rapport
  const generateReport = () => {
    // Vérifier qu'au moins une machine est sélectionnée
    if (selectedMachines.length === 0) {
      alert('Veuillez sélectionner au moins une machine.');
      return;
    }
    
    // Récupérer les données des machines sélectionnées
    const selectedMachinesData = machines.filter(machine => 
      selectedMachines.includes(machine.id)
    );
    
    // Récupérer les interventions pour chaque machine sélectionnée
    // et filtrer par plage de dates si spécifiée
    const interventionsData = {};
    selectedMachines.forEach(machineId => {
      const machineInterventions = dataService.getInterventions(machineId);
      
      // Filtrer par date si une plage est spécifiée
      let filteredInterventions = [...machineInterventions];
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        filteredInterventions = filteredInterventions.filter(intervention => {
          const interventionDate = new Date(intervention.date);
          return interventionDate >= start && interventionDate <= end;
        });
      }
      
      // Convertir les dates au format français
      filteredInterventions = filteredInterventions.map(intervention => ({
        ...intervention,
        date: formatDateToFrench(intervention.date)
      }));
      
      interventionsData[machineId] = filteredInterventions;
    });
    
    // Récupérer l'historique des identifiants si nécessaire
    const idHistoryData = {};
    if (includeIdentifiants) {
      selectedMachines.forEach(machineId => {
        idHistoryData[machineId] = dataService.getIdHistory(machineId);
      });
    }
    
    // Données du rapport
    const reportData = {
      title: "Rapport de maintenance PAC",
      dateGeneration: new Date().toLocaleDateString('fr-FR'),
      period: startDate && endDate ? `Du ${formatDateToFrench(startDate)} au ${formatDateToFrench(endDate)}` : "Toutes périodes",
      machines: selectedMachinesData,
      interventions: includeInterventions ? interventionsData : null,
      idHistory: includeIdentifiants ? idHistoryData : null,
      includeNotes
    };
    
    // Génération du rapport selon le format choisi
    if (reportFormat === 'pdf') {
      generatePDFReport(reportData);
    } else if (reportFormat === 'excel') {
      generateExcelReport(reportData);
    } else {
      generateHTMLReport(reportData);
    }
  };
  
  // Générer un rapport PDF
  const generatePDFReport = (data) => {
    // Créer un nouvel onglet pour le rapport HTML que l'utilisateur pourra imprimer en PDF
    const reportWindow = window.open('', '_blank');
    
    // Créer le contenu HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2563eb;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
          }
          .info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .machine-header {
            background-color: #e5edff;
            padding: 10px;
            margin-top: 20px;
            border-radius: 5px;
          }
          .status {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.9em;
          }
          .status-ok {
            background-color: #d1fae5;
            color: #065f46;
          }
          .status-hs {
            background-color: #fee2e2;
            color: #b91c1c;
          }
          .status-unknown {
            background-color: #f3f4f6;
            color: #374151;
          }
          .page-break {
            page-break-after: always;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 0.8em;
            color: #6b7280;
          }
          @media print {
            body {
              padding: 0;
              font-size: 12px;
            }
            h1 {
              font-size: 20px;
            }
            h2 {
              font-size: 16px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.title}</h1>
          <p>Généré le ${data.dateGeneration}</p>
          <p>${data.period}</p>
        </div>
        
        <div class="info">
          <div>
            <p><strong>Nombre de machines :</strong> ${data.machines.length}</p>
            <p><strong>Étage(s) :</strong> ${selectedEtage === 'Tous' ? 'Tous' : selectedEtage}</p>
          </div>
          <div>
            <button class="no-print" onclick="window.print()">Imprimer</button>
          </div>
        </div>
        
        <h2>Résumé des machines</h2>
        <table>
          <thead>
            <tr>
              <th>Identifiant</th>
              <th>Étage</th>
              <th>État</th>
              ${includeIdentifiants ? '<th>Numéro de série</th><th>Neuron ID</th>' : ''}
              ${includeNotes ? '<th>Notes</th>' : ''}
              <th>Dernière vérification</th>
            </tr>
          </thead>
          <tbody>
            ${data.machines.map(machine => `
              <tr>
                <td>${machine.id}</td>
                <td>${machine.etage}</td>
                <td>
                  <span class="status ${
                    machine.etat === 'Fonctionnel' ? 'status-ok' : 
                    machine.etat === 'HS' ? 'status-hs' : 'status-unknown'
                  }">
                    ${machine.etat}
                  </span>
                </td>
                ${includeIdentifiants ? `<td>${machine.serialNumber || '-'}</td><td>${machine.neuronId || '-'}</td>` : ''}
                ${includeNotes ? `<td>${machine.notes || '-'}</td>` : ''}
                <td>${machine.derniereVerification}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${includeInterventions ? `
          <h2>Détail des interventions</h2>
          ${data.machines.map(machine => `
            <div class="machine-header">
              <h3>Machine: ${machine.id} - ${machine.etat}</h3>
              ${includeIdentifiants ? `
                <p><strong>Numéro de série:</strong> ${machine.serialNumber || '-'}</p>
                <p><strong>Neuron ID:</strong> ${machine.neuronId || '-'}</p>
              ` : ''}
            </div>
            
            ${data.interventions[machine.id] && data.interventions[machine.id].length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Technicien</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.interventions[machine.id].map(intervention => `
                    <tr>
                      <td>${intervention.date}</td>
                      <td>${intervention.type}</td>
                      <td>${intervention.description}</td>
                      <td>${intervention.technicien}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>Aucune intervention enregistrée pour cette période.</p>'}
            
            ${includeIdentifiants && data.idHistory[machine.id] && data.idHistory[machine.id].entries && data.idHistory[machine.id].entries.length > 0 ? `
              <h4>Historique des modifications d'identifiants</h4>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Champ</th>
                    <th>Ancienne valeur</th>
                    <th>Nouvelle valeur</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.idHistory[machine.id].entries.map(entry => `
                    <tr>
                      <td>${entry.date}</td>
                      <td>${entry.field}</td>
                      <td>${entry.oldValue || '-'}</td>
                      <td>${entry.newValue}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            
            <div class="page-break"></div>
          `).join('')}
        ` : ''}
        
        <div class="footer">
          <p>Carnet de Maintenance PAC - Rapport généré le ${data.dateGeneration}</p>
        </div>
      </body>
      </html>
    `;
    
    // Écrire le contenu HTML dans la nouvelle fenêtre
    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };
  
  // Générer un rapport Excel
  const generateExcelReport = (data) => {
    // Cette fonction serait à implémenter avec une bibliothèque comme xlsx ou exceljs
    // Pour l'instant, on utilise le rapport HTML comme solution temporaire
    alert('La fonctionnalité d\'export Excel sera disponible dans une prochaine mise à jour. Un rapport HTML va être généré à la place.');
    generateHTMLReport(data);
  };
  
  // Générer un rapport HTML à télécharger
  const generateHTMLReport = (data) => {
    // Créer le contenu HTML (identique au rapport PDF)
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2563eb;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
          }
          .info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .machine-header {
            background-color: #e5edff;
            padding: 10px;
            margin-top: 20px;
            border-radius: 5px;
          }
          .status {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.9em;
          }
          .status-ok {
            background-color: #d1fae5;
            color: #065f46;
          }
          .status-hs {
            background-color: #fee2e2;
            color: #b91c1c;
          }
          .status-unknown {
            background-color: #f3f4f6;
            color: #374151;
          }
          .page-break {
            page-break-after: always;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 0.8em;
            color: #6b7280;
          }
          @media print {
            body {
              padding: 0;
              font-size: 12px;
            }
            h1 {
              font-size: 20px;
            }
            h2 {
              font-size: 16px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.title}</h1>
          <p>Généré le ${data.dateGeneration}</p>
          <p>${data.period}</p>
        </div>
        
        <div class="info">
          <div>
            <p><strong>Nombre de machines :</strong> ${data.machines.length}</p>
            <p><strong>Étage(s) :</strong> ${selectedEtage === 'Tous' ? 'Tous' : selectedEtage}</p>
          </div>
          <div>
            <button class="no-print" onclick="window.print()">Imprimer</button>
          </div>
        </div>
        
        <h2>Résumé des machines</h2>
        <table>
          <thead>
            <tr>
              <th>Identifiant</th>
              <th>Étage</th>
              <th>État</th>
              ${includeIdentifiants ? '<th>Numéro de série</th><th>Neuron ID</th>' : ''}
              ${includeNotes ? '<th>Notes</th>' : ''}
              <th>Dernière vérification</th>
            </tr>
          </thead>
          <tbody>
            ${data.machines.map(machine => `
              <tr>
                <td>${machine.id}</td>
                <td>${machine.etage}</td>
                <td>
                  <span class="status ${
                    machine.etat === 'Fonctionnel' ? 'status-ok' : 
                    machine.etat === 'HS' ? 'status-hs' : 'status-unknown'
                  }">
                    ${machine.etat}
                  </span>
                </td>
                ${includeIdentifiants ? `<td>${machine.serialNumber || '-'}</td><td>${machine.neuronId || '-'}</td>` : ''}
                ${includeNotes ? `<td>${machine.notes || '-'}</td>` : ''}
                <td>${machine.derniereVerification}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${includeInterventions ? `
          <h2>Détail des interventions</h2>
          ${data.machines.map(machine => `
            <div class="machine-header">
              <h3>Machine: ${machine.id} - ${machine.etat}</h3>
              ${includeIdentifiants ? `
                <p><strong>Numéro de série:</strong> ${machine.serialNumber || '-'}</p>
                <p><strong>Neuron ID:</strong> ${machine.neuronId || '-'}</p>
              ` : ''}
            </div>
            
            ${data.interventions[machine.id] && data.interventions[machine.id].length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Technicien</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.interventions[machine.id].map(intervention => `
                    <tr>
                      <td>${intervention.date}</td>
                      <td>${intervention.type}</td>
                      <td>${intervention.description}</td>
                      <td>${intervention.technicien}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>Aucune intervention enregistrée pour cette période.</p>'}
            
            ${includeIdentifiants && data.idHistory[machine.id] && data.idHistory[machine.id].entries && data.idHistory[machine.id].entries.length > 0 ? `
              <h4>Historique des modifications d'identifiants</h4>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Champ</th>
                    <th>Ancienne valeur</th>
                    <th>Nouvelle valeur</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.idHistory[machine.id].entries.map(entry => `
                    <tr>
                      <td>${entry.date}</td>
                      <td>${entry.field}</td>
                      <td>${entry.oldValue || '-'}</td>
                      <td>${entry.newValue}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            
            <div class="page-break"></div>
          `).join('')}
        ` : ''}
        
        <div class="footer">
          <p>Carnet de Maintenance PAC - Rapport généré le ${data.dateGeneration}</p>
        </div>
      </body>
      </html>
    `;
    
    // Créer un Blob avec le contenu HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Créer une URL pour le Blob
    const url = URL.createObjectURL(blob);
    
    // Créer un lien pour télécharger le fichier
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-maintenance-pac-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-4/5 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold flex items-center">
            <FileText className="mr-2" /> Exporter un rapport
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full"
            title="Fermer"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Période</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date de début</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date de fin</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Options du rapport</h3>
              <div className="space-y-3">
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5"
                      checked={includeInterventions}
                      onChange={(e) => setIncludeInterventions(e.target.checked)}
                    />
                    <span className="ml-2">Inclure les interventions</span>
                  </label>
                </div>
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5"
                      checked={includeIdentifiants}
                      onChange={(e) => setIncludeIdentifiants(e.target.checked)}
                    />
                    <span className="ml-2">Inclure les numéros de série et Neuron ID</span>
                  </label>
                </div>
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5"
                      checked={includeNotes}
                      onChange={(e) => setIncludeNotes(e.target.checked)}
                    />
                    <span className="ml-2">Inclure les notes</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Format du rapport</label>
                  <select
                    className="w-full border rounded p-2"
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value)}
                  >
                    <option value="pdf">PDF (via navigateur)</option>
                    <option value="html">HTML</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Sélection des machines</h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Étage</label>
              <select
                className="w-full border rounded p-2"
                value={selectedEtage}
                onChange={(e) => setSelectedEtage(e.target.value)}
              >
                <option value="Tous">Tous</option>
                {etages.map(etage => (
                  <option key={etage} value={etage}>{etage}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-2 flex justify-between items-center">
              <span>Machines ({filteredMachines.length})</span>
              <button
                onClick={toggleSelectAll}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {selectedMachines.length === filteredMachines.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto border rounded p-2">
              {filteredMachines.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {filteredMachines.map(machine => (
                    <label
                      key={machine.id}
                      className={`p-2 border rounded flex items-center cursor-pointer ${
                        selectedMachines.includes(machine.id) ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 mr-2"
                        checked={selectedMachines.includes(machine.id)}
                        onChange={() => toggleMachine(machine.id)}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{machine.id}</span>
                        <span className={`text-xs ${
                          machine.etat === 'Fonctionnel' ? 'text-green-600' :
                          machine.etat === 'HS' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {machine.etat}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune machine disponible pour les critères sélectionnés.</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 mr-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              onClick={generateReport}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              disabled={selectedMachines.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Générer le rapport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReport;