/**
 * Utilitaires pour la manipulation et le formatage des dates
 */

/**
 * Convertit une date au format ISO (AAAA-MM-JJ) en format français (JJ/MM/AAAA)
 * @param {string} isoDate - Date au format ISO (AAAA-MM-JJ)
 * @returns {string} - Date au format français (JJ/MM/AAAA)
 */
export const formatDateToFrench = (isoDate) => {
  if (!isoDate || isoDate === '-') return '-';
  
  try {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return isoDate; // Retourner la date d'origine en cas d'erreur
  }
};

/**
 * Convertit une date au format français (JJ/MM/AAAA) en format ISO (AAAA-MM-JJ)
 * @param {string} frenchDate - Date au format français (JJ/MM/AAAA)
 * @returns {string} - Date au format ISO (AAAA-MM-JJ)
 */
export const formatDateToISO = (frenchDate) => {
  if (!frenchDate || frenchDate === '-') return '-';
  
  try {
    const [day, month, year] = frenchDate.split('/');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return frenchDate; // Retourner la date d'origine en cas d'erreur
  }
};

/**
 * Retourne la date d'aujourd'hui au format français (JJ/MM/AAAA)
 * @returns {string} - Date actuelle au format français
 */
export const getTodayFrenchFormat = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Retourne la date d'aujourd'hui au format ISO (AAAA-MM-JJ)
 * @returns {string} - Date actuelle au format ISO
 */
export const getTodayISOFormat = () => {
  return new Date().toISOString().split('T')[0];
};
