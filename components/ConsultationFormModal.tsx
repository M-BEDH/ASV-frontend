import { useState, useEffect } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { consultationsApi, usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { makeCommonStyles } from '../styles/common';
import FormModal from './FormModal';
import FieldLabel from './FieldLabel';
import Dropdown from './Dropdown';
import DateTimePickerInput from './DateTimePickerInput';
import type { Animal, StaffUser } from '../types';
import { dateToDisplay, toIsoDatetime } from '../utils/dateUtils';
import { consultationMotifs } from '../constants/consultationMotifs';

type ConsultForm = {
  animalId: string;
  dateConsultation: string;
  motif: string;
  veterinaire: { value: any; label: any } | null;
  compteRendu: string;
  traitements: string;
};

const EMPTY_FORM: ConsultForm = {
  animalId: '',
  dateConsultation: '',
  motif: '',
  veterinaire: null,
  compteRendu: '',
  traitements: '',
};

type Props = {
  visible: boolean;
  consultation?: any;             // fourni → mode édition
  preselectedAnimal?: Animal | null; // fourni → animal fixe (depuis détail animal)
  animals?: Animal[];             // fourni → dropdown (depuis onglet consultations)
  onClose: () => void;
  onSaved: () => void;
};

export default function ConsultationFormModal({
  visible,
  consultation,
  preselectedAnimal,
  animals,
  onClose,
  onSaved,
}: Props) {
  const { user } = useAuth(); // AuthContext
  const { colors } = useTheme(); // ThemeContext
  const { showToast } = useToast(); // ToastContext

  const [form, setForm] = useState<ConsultForm>(EMPTY_FORM);
  const [vets, setVets] = useState<StaffUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Initialise le formulaire à l'ouverture
  useEffect(() => {
    if (!visible) return;
    if (consultation) {
      setForm({
        animalId: consultation.animal?.id ?? '',
        dateConsultation: dateToDisplay(new Date(consultation.dateConsultation)),
        motif: consultation.motif,
        veterinaire: consultation.veterinaire
          ? { value: consultation.veterinaire.id, label: consultation.veterinaire.name }
          : null,
        compteRendu: consultation.compteRendu ?? '',
        traitements: consultation.traitements ?? '',
      });
    } else {
      setForm({ ...EMPTY_FORM, animalId: preselectedAnimal?.id ?? '', dateConsultation: dateToDisplay(new Date()) });
    }
    setError('');
  }, [visible, consultation?.id, preselectedAnimal?.id]);

  // Charge la liste des vétérinaires à l'ouverture
  useEffect(() => {
    if (!visible) return;
    usersApi.list().then((u) => {
      const selectable = (u as StaffUser[]).filter((u) => !!u.isVet);
      const meIsSelectable = !!(user && (user.isVet ?? (user.role === 'veterinaire' || user.role === 'responsable')));
      const meAlreadyListed = !!user && selectable.some((s) => s.id === user.id);
      setVets(
        meIsSelectable && !meAlreadyListed
          ? [...selectable, { id: user.id, email: user.email, name: user.name, role: user.role, isVet: true, pending: false, createdAt: '' }]
          : selectable,
      );
    });
  }, [visible, user]);

  const handleSave = async () => {
    const animalId = preselectedAnimal ? preselectedAnimal.id : form.animalId;
    if (!animalId || !form.dateConsultation || !form.motif) {
      setError('Animal, date et motif sont obligatoires.');
      return;
    }
    const [datePart, timePart = '00:00'] = form.dateConsultation.split(' ');
    const [d, m, y] = datePart.split('-');
    // uniquement pour la création , pas en edit si compte rendu vet généré plus tard
    if (!consultation && new Date(`${y}-${m}-${d}T${timePart}`) < new Date()) {
      setError('La date de consultation est passée.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        animalId,
        dateConsultation: toIsoDatetime(form.dateConsultation),
        motif: form.motif,
        veterinaireId: form.veterinaire?.value || null,
        compteRendu: form.compteRendu || null,
        traitements: form.traitements || null,
      };
      if (consultation) {
        await consultationsApi.update(consultation.id, payload);
        showToast('Consultation modifiée avec succès');
      } else {
        await consultationsApi.create(payload);
        showToast('Consultation créée avec succès');
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <FormModal
      visible={visible}
      title={consultation ? 'Modifier la consultation' : 'Nouvelle consultation'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      error={error}
    >
      <FieldLabel required>Animal</FieldLabel>
      {preselectedAnimal ? (
        <Text style={[styles.input, { color: colors.textPrimary, paddingTop: 14 }]}>
          {preselectedAnimal.nom} ({preselectedAnimal.espece})
        </Text>
      ) : (
        <Dropdown
          items={(animals ?? []).map((a) => ({
            label: `${a.nom} (${a.espece})${a.proprietaire ? ` — ${a.proprietaire.prenom} ${a.proprietaire.nom}` : ''}`,
            value: a.id,
          }))}
          value={form.animalId}
          onChange={(v) => setForm({ ...form, animalId: v })}
          placeholder="Choisir un animal"
        />
      )}

      <FieldLabel required>Date et heure</FieldLabel>
      <DateTimePickerInput
        value={form.dateConsultation}
        onChange={(v) => setForm({ ...form, dateConsultation: v })}
      />

      <FieldLabel required>Motif</FieldLabel>
      <Dropdown
        items={consultationMotifs}
        value={form.motif}
        onChange={(v) => setForm({ ...form, motif: v })}
        placeholder="Choisir un motif"
      />

      <FieldLabel required>Vétérinaire</FieldLabel>
      <Dropdown
        items={vets.map((v) => ({ value: v.id, label: v.name }))}
        value={form.veterinaire?.value ?? ''}
        onChange={(v) =>
          setForm({ ...form, veterinaire: v ? { value: v, label: vets.find((u) => u.id === v)?.name ?? v } : null })
        }
        placeholder={vets.length === 0 ? 'Aucun vétérinaire disponible' : 'Choisir un vétérinaire'}
      />
      {vets.length === 0 && (
        <Text style={styles.emptyText}>Aucun vétérinaire disponible pour le moment.</Text>
      )}

      <FieldLabel>Compte-rendu / Observations</FieldLabel>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={form.compteRendu}
        onChangeText={(v) => setForm({ ...form, compteRendu: v })}
        multiline
        placeholder="Résultats de l'examen..."
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Compte-rendu / Observations"
      />

      <FieldLabel>Traitements</FieldLabel>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={form.traitements}
        onChangeText={(v) => setForm({ ...form, traitements: v })}
        multiline
        placeholder="Médicaments prescrits..."
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Traitements"
      />
    </FormModal>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    ...makeCommonStyles(colors),
    emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 12 },
  });
}
