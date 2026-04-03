// Normalise une chaîne pour la recherche : minuscules + suppression des accents
export const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
