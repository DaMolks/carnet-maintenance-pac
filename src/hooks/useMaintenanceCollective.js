import { useState } from 'react';
import { getTodayFrenchFormat } from '../utils/dateUtils';

/**
 * Hook personnalisé pour gérer la maintenance collective
 */
const useMaintenanceCollective = (addInterventionToMultipleMachines, etages) => {
  // État pour la maintenance collective
  const [showMaintenanceCollectiveDetail, setShowMaintenanceCollectiveDetail] = useState(false);
  const [machinesSelectionnees, setMachinesSelectionnees] = useState([]);
  const [maintenanceCollective, setMaintenanceCollective] = useState({
    date: getTodayFrenchFormat(),
    type: 'Maintenance',
    description: 'Maintenance filtres et filtres à tamis + essais de fonctionnement',
    technicien: ''
  });
  
  // Activer ou désactiver le mode de maintenance collective détaillée
  const toggleMaintenanceCollective = () => {
    // Si nous sommes déjà en mode maintenance collective détaillée, tout désactiver
    if (showMaintenanceCollectiveDetail) {
      setShowMaintenanceCollectiveDetail(false);
      setMachinesSelectionnees([]);
      return;
    }
    
    // Sinon, ouvrir directement l'écran de maintenance collective détaillée
    setShowMaintenanceCollectiveDetail(true);
  };
  
  // Traiter la validation de la maintenance collective détaillée
  const handleMaintenanceCollectiveDetailSubmit = (data) => {
    // Vérifier qu'il y a des machines sélectionnées
    if (data.machines.length === 0) {
      alert('Aucune machine sélectionnée.');
      return;
    }
    
    // Préparer les données pour le traitement
    const machineIds = data.machines.map(m => m.id);
    
    // Ajouter l'intervention via le service de données
    // Passer le flag useSpecificDescriptions pour indiquer qu'il faut utiliser les descriptions spécifiques
    if (addInterventionToMultipleMachines(machineIds, {
      ...data.intervention,
      useSpecificDescriptions: true
    }, data.machines, etages)) {
      // Réinitialiser le formulaire et désactiver le mode maintenance collective
      setMaintenanceCollective({
        date: getTodayFrenchFormat(),
        type: 'Maintenance',
        description: 'Maintenance filtres et filtres à tamis + essais de fonctionnement',
        technicien: ''
      });
      
      // Désactiver le mode maintenance collective détaillée
      setShowMaintenanceCollectiveDetail(false);
      setMachinesSelectionnees([]);
      
      alert('Maintenance collective ajoutée avec succès!');
    }
  };
  
  // Fermer l'écran de maintenance collective détaillée
  const handleMaintenanceCollectiveDetailReturn = () => {
    setShowMaintenanceCollectiveDetail(false);
    setMachinesSelectionnees([]);
  };
  
  return {
    showMaintenanceCollectiveDetail,
    machinesSelectionnees,
    maintenanceCollective,
    toggleMaintenanceCollective,
    handleMaintenanceCollectiveDetailSubmit,
    handleMaintenanceCollectiveDetailReturn
  };
};

export default useMaintenanceCollective;