/**
 * Calcule le nombre de secousses requis selon le jour de la semaine.
 * j : Lundi=1, Mardi=2, Mercredi=3, Jeudi=4, Vendredi=5, Samedi=6, Dimanche=7
 * Formule : (j * j) % 5  — minimum 1 pour éviter 0 secousses (cas Vendredi)
 */
export function getRequiredShakes() {
  const jsDay = new Date().getDay(); // 0=Dimanche, 1=Lundi … 6=Samedi
  const j = jsDay === 0 ? 7 : jsDay;  // convertir en 1-7 (Lundi=1 … Dimanche=7)
  const count = (j * j) % 5;
  return count; // Retourne 0 à 4
}

/**
 * Retourne le nom du jour courant en français.
 */
export function getTodayName() {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[new Date().getDay()];
}
