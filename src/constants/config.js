/**
 * Constantes de configuration pour l'application
 */

// Liste des étages disponibles
export const ETAGES = ['4', 'Technique'];

// Liste des identifiants de PAC
export const ALL_PAC_IDS = [
  'A0101', 'A0102', 'A0103', 'A0104', 'A0105', 'A0106', 'A0107', 'A0108',
  'A0201', 'A0202', 'A0203', 'A0204', 'A0205', 'A0206', 'A0207', 'A0208',
  'A0301', 'A0302', 'A0303', 'A0304', 'A0305', 'A0306', 'A0307', 'A0308',
  'A0401b', 'A0401', 'A0402', 'A0403', 'A0404', 'A0405', 'A0406',
  'A0501', 'A0502', 'A0503', 'A0504', 'A0505', 'A0506', 'A0507', 'A0508',
  'A0601', 'A0602', 'A0603', 'A0604', 'A0605', 'A0606', 'A0606b',
  'TSGR1', 'TSGR2', 'TSGR3'
];

// Types d'interventions disponibles
export const INTERVENTION_TYPES = [
  'Maintenance',
  'Réparation',
  'Inspection',
  'Remplacement'
];

// États possibles des machines
export const MACHINE_STATES = [
  'Fonctionnel',
  'HS',
  'Non vérifié'
];

// Liste des pannes courantes pour les tags
export const TAGS_PANNES_COURANTES = [
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

// Clés de stockage localStorage
export const STORAGE_KEYS = {
  MACHINES: 'carnet_maintenance_pac_machines_v2',
  INTERVENTIONS: 'carnet_maintenance_pac_interventions_v2',
  ID_HISTORY: 'carnet_maintenance_pac_id_history_v1'
};