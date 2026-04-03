import type { UserRole, EtablissementType } from '../types';

export const userRoles: { value: UserRole; label: string }[] = [
  { value: 'veterinaire', label: 'Vétérinaire' },
  { value: 'responsable', label: 'Responsable / Directeur' },
  { value: 'assistant', label: 'Assistant(e)' },
  { value: 'benevole', label: 'Bénévole' },
  { value: 'client', label: 'Client' },
];

export const etablissementTypes: { value: EtablissementType; label: string }[] = [
  { value: 'clinique', label: 'Clinique' },
  { value: 'refuge', label: 'Refuge' },
  { value: 'association', label: 'Association' },
];
