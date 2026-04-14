export type UserRole = 'client' | 'veterinaire' | 'assistant' | 'benevole' | 'responsable';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isVet?: boolean;
  // Staff (vétérinaire, responsable, assistant, bénévole)
  clinicId?: string | null;
  clinicName?: string | null;
  clinicType?: string | null;
  // Client uniquement
  clinicIds?: string[];
}

export type EtablissementType = 'clinique' | 'refuge' | 'association';

export interface Clinic {
  id: string;
  name: string;
  type: EtablissementType;
  createdAt: string;
}

export interface Owner {
  id: string;
  nom: string;
  prenom: string;
  adresse: string | null;
  telephone: string | null;
  email: string;
  clinicIds: string[];
  createdAt: string;
}

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isVet?: boolean;
  pending: boolean;
  createdAt: string;
}

export interface Animal {
  id: string;
  nom: string;
  espece: string;
  race: string | null;
  dateNaissance: string | null;
  remarques: string | null;
  clinicId: string | null;
  proprietaire: { id: string; nom: string; prenom: string } | null;
  createdAt: string;
}

export interface Consultation {
  id: string;
  dateConsultation: string;
  motif: string;
  compteRendu: string | null;
  traitements: string | null;
  clinicId: string | null;
  animal: { id: string; nom: string; espece: string } | null;
  veterinaire: { id: string; name: string } | null;
  createdAt: string;
}
