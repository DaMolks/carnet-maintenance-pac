import { useState, useMemo } from 'react';

/**
 * Hook personnalisé pour gérer les filtres et recherches
 */
const useFilters = (machines, etages) => {
  // Filtres et recherche
  const [etageFiltre, setEtageFiltre] = useState('Tous');
  const [etatFiltre, setEtatFiltre] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [etagesOuverts, setEtagesOuverts] = useState(
    etages.reduce((acc, etage) => ({ ...acc, [etage]: true }), {})
  );
  
  // Organiser les machines par étage
  const machinesParEtage = useMemo(() => {
    const result = {};
    etages.forEach(etage => {
      result[etage] = machines.filter(machine => machine.etage === etage);
    });
    return result;
  }, [machines, etages]);

  // Filtrer les machines selon les critères sélectionnés
  const machinesFiltrees = useMemo(() => {
    return machines.filter(machine => {
      const matchEtage = etageFiltre === 'Tous' || machine.etage === etageFiltre;
      const matchEtat = etatFiltre === 'Tous' || machine.etat === etatFiltre;
      const matchSearch = !searchTerm || 
                        machine.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (machine.notes && machine.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (machine.serialNumber && machine.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (machine.neuronId && machine.neuronId.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchEtage && matchEtat && matchSearch;
    });
  }, [machines, etageFiltre, etatFiltre, searchTerm]);
  
  // Basculer l'état ouvert/fermé d'un étage
  const toggleEtage = (etage) => {
    setEtagesOuverts({
      ...etagesOuverts,
      [etage]: !etagesOuverts[etage]
    });
  };
  
  return {
    etageFiltre,
    setEtageFiltre,
    etatFiltre,
    setEtatFiltre,
    searchTerm,
    setSearchTerm,
    etagesOuverts,
    machinesParEtage,
    machinesFiltrees,
    toggleEtage
  };
};

export default useFilters;