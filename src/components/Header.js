import React from 'react';
import { 
  Database, AlertTriangle, CheckCircle, Settings, 
  Save, Upload, RefreshCw, Wrench, FileBarChart 
} from 'lucide-react';

/**
 * Composant d'en-tête pour l'application
 */
const Header = ({ 
  stats, 
  onToggleMaintenanceCollective, 
  onShowExportReport,
  onExportData,
  onImportData,
  onResetData
}) => {
  return (
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
              onClick={onToggleMaintenanceCollective}
              className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded flex items-center text-sm"
              title="Maintenance collective"
            >
              <Wrench className="w-4 h-4 mr-1" /> Maintenance collective
            </button>
            <button 
              onClick={onShowExportReport}
              className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded flex items-center text-sm"
              title="Générer rapport"
            >
              <FileBarChart className="w-4 h-4 mr-1" /> Rapport
            </button>
            <button 
              onClick={onExportData}
              className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded flex items-center text-sm"
              title="Exporter les données"
            >
              <Save className="w-4 h-4 mr-1" /> Exporter JSON
            </button>
            <label className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded flex items-center text-sm cursor-pointer"
                   title="Importer des données">
              <Upload className="w-4 h-4 mr-1" /> Importer
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={onImportData}
              />
            </label>
            <button 
              onClick={onResetData}
              className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded flex items-center text-sm"
              title="Réinitialiser toutes les données"
            >
              <RefreshCw className="w-4 h-4 mr-1" /> Reset
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;