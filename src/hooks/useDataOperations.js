import { useState } from 'react';
import dataService from '../services/DataService';

/**
 * Hook personnalisé pour gérer les opérations d'export et d'import de données
 */
const useDataOperations = (onDataImported) => {
  // État pour l'interface d'export de rapport
  const [showExportReport, setShowExportReport] = useState(false);
  
  // Exporter les données en JSON
  const handleExport = () => {
    const jsonData = dataService.exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Obtenir la date au format français pour le nom du fichier
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `carnet-maintenance-pac-${formattedDate}.json`;
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
        // Callback pour recharger les données après l'import
        if (onDataImported) {
          onDataImported();
        }
        
        alert('Données importées avec succès !');
      } else {
        alert('Erreur lors de l\'importation des données. Vérifiez le format du fichier.');
      }
    };
    reader.readAsText(file);
    
    // Réinitialiser l'input file
    event.target.value = '';
  };
  
  // Afficher l'interface d'export de rapport
  const showExportReportModal = () => {
    setShowExportReport(true);
  };
  
  // Fermer l'interface d'export de rapport
  const closeExportReportModal = () => {
    setShowExportReport(false);
  };
  
  return {
    showExportReport,
    handleExport,
    handleImport,
    showExportReportModal,
    closeExportReportModal
  };
};

export default useDataOperations;