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