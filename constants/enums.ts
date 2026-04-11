import type { UserRole, EtablissementType } from '../types';

// Seul le responsable peut créer son compte librement.
// Collaborateurs et clients sont ajoutés par le responsable — ils activent leur compte via cet écran.
export const userRoles: { value: UserRole; label: string }[] = [
  { value: 'responsable', label: 'Responsable / Directeur' },
];

export const etablissementTypes: { value: EtablissementType; label: string }[] = [
  { value: 'clinique', label: 'Clinique' },
  { value: 'refuge', label: 'Refuge' },
  { value: 'association', label: 'Association' },
];
