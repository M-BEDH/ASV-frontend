import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { makeModalStyles } from '../styles/modal';
import { makeCommonStyles } from '../styles/common';
import { animalsApi, consultationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import FormModal from './FormModal';
import ConfirmModal from './ConfirmModal';
import FieldLabel from './FieldLabel';
import Dropdown from './Dropdown';
import DateTimePickerInput from './DateTimePickerInput';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Animal, Owner } from '../types';
import { dateToDisplay, toIsoDatetime } from '../utils/dateUtils';
import { consultationMotifs } from '../constants/consultationMotifs';

type Props = {
  animal: Animal | null;
  owners: Owner[];
  consultations: any[];
  consultationsLoading: boolean;
  onClose: () => void;
  onConsultationsChange: (c: any[]) => void;
};

const EMPTY_CONSULT_FORM = { dateConsultation: '', motif: '', compteRendu: '', traitements: '' };

export default function AnimalDetailModal({
  animal,
  owners,
  consultations,
  consultationsLoading,
  onClose,
  onConsultationsChange,
}: Props) {
  const { isVet } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [consultModalVisible, setConsultModalVisible] = useState(false);
  const [editConsultTarget, setEditConsultTarget] = useState<any | null>(null);
  const [consultForm, setConsultForm] = useState(EMPTY_CONSULT_FORM);
  const [consultSaving, setConsultSaving] = useState(false);
  const [consultError, setConsultError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);

  const openConsultModal = (consult?: any) => {
    if (consult) {
      setEditConsultTarget(consult);
      const d = new Date(consult.dateConsultation);
      setConsultForm({
        dateConsultation: dateToDisplay(d),
        motif: consult.motif,
        compteRendu: consult.compteRendu ?? '',
        traitements: consult.traitements ?? '',
      });
    } else {
      setEditConsultTarget(null);
      setConsultForm({ ...EMPTY_CONSULT_FORM, dateConsultation: dateToDisplay(new Date()) });
    }
    setConsultError('');
    setConsultModalVisible(true);
  };

  const handleSaveConsultation = async () => {
    if (!consultForm.motif || !consultForm.dateConsultation) {
      setConsultError('La date et le motif sont obligatoires.');
      return;
    }
    setConsultSaving(true);
    setConsultError('');
    try {
      const isoDate = toIsoDatetime(consultForm.dateConsultation);
      const payload = {
        animalId: animal!.id,
        dateConsultation: isoDate,
        motif: consultForm.motif,
        compteRendu: consultForm.compteRendu || null,
        traitements: consultForm.traitements || null,
      };
      if (editConsultTarget) {
        await consultationsApi.update(editConsultTarget.id, payload);
      } else {
        await consultationsApi.create(payload);
      }
      setConsultModalVisible(false);
      showToast(editConsultTarget ? 'Consultation modifiée' : 'Consultation ajoutée');
      onConsultationsChange(await animalsApi.getConsultations(animal!.id));
    } catch (e: any) {
      setConsultError(e.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setConsultSaving(false);
    }
  };

  const handleDeleteConsultation = (consult: any) => {
    setDeleteConfirm(consult);
  };

  const confirmDeleteConsultation = async () => {
    if (!deleteConfirm) return;
    const consult = deleteConfirm;
    setDeleteConfirm(null);
    try {
      onConsultationsChange(consultations.filter((c) => c.id !== consult.id));
      await consultationsApi.delete(consult.id);
    } catch (e: any) {
      showToast(e.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const styles = makeStyles(colors);

  const owner = animal?.proprietaire
    ? owners.find((o) => o.id === animal.proprietaire!.id)
    : undefined;

  return (
    <>
      <Modal visible={!!animal} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{animal?.nom ?? ''}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.body}>
            {/* ── Informations ── */}
            <View style={styles.detailSection}>
              <View style={styles.detailSectionHeader}>
                <MaterialCommunityIcons name="paw" size={18} color={colors.primary} />
                <Text style={styles.detailSectionTitle}>Informations</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Espèce</Text>
                <Text style={styles.detailValue}>{animal?.espece}</Text>
              </View>
              {animal?.race ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Race</Text>
                  <Text style={styles.detailValue}>{animal.race}</Text>
                </View>
              ) : null}
              {animal?.dateNaissance ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date de naissance</Text>
                  <Text style={styles.detailValue}>{new Date(animal.dateNaissance).toLocaleDateString('fr-FR')}</Text>
                </View>
              ) : null}
              {animal?.remarques ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Remarques</Text>
                  <Text style={[styles.detailValue, { fontStyle: 'italic' }]}>{animal.remarques}</Text>
                </View>
              ) : null}
            </View>

            {/* ── Propriétaire ── */}
            {animal?.proprietaire ? (
              <View style={styles.detailSection}>
                <View style={styles.detailSectionHeader}>
                  <MaterialCommunityIcons name="account-outline" size={18} color={colors.primary} />
                  <Text style={styles.detailSectionTitle}>Propriétaire</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nom</Text>
                  <Text style={styles.detailValue}>{animal.proprietaire.prenom} {animal.proprietaire.nom}</Text>
                </View>
                {owner?.telephone ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Téléphone</Text>
                    <Text style={styles.detailValue}>{owner.telephone}</Text>
                  </View>
                ) : null}
                {owner?.email ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{owner.email}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* ── Consultations ── */}
            <View style={styles.detailSection}>
              <View style={[styles.detailSectionHeader, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="stethoscope" size={18} color={colors.primary} />
                  <Text style={styles.detailSectionTitle}>Consultations</Text>
                </View>
                {isVet && (
                  <TouchableOpacity style={styles.addConsultBtn} onPress={() => openConsultModal()}>
                    <Text style={styles.addConsultBtnText}>+ Ajouter</Text>
                  </TouchableOpacity>
                )}
              </View>
              {consultationsLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />
              ) : consultations.length === 0 ? (
                <Text style={styles.detailEmpty}>Aucune consultation enregistrée</Text>
              ) : (
                consultations.map((c) => (
                  <View key={c.id} style={[styles.consultationCard, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.consultationDate}>
                        {new Date(c.dateConsultation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        {' à '}{new Date(c.dateConsultation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text style={styles.consultationMotif}>{c.motif}</Text>
                      {c.compteRendu ? <Text style={styles.consultationField}>{c.compteRendu}</Text> : null}
                      {c.traitements ? <Text style={styles.consultationField}>{c.traitements}</Text> : null}
                      {c.veterinaire && <Text style={styles.consultationVet}>Dr {c.veterinaire.name}</Text>}
                    </View>
                    {isVet && (
                      <View style={{ gap: 12, justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => openConsultModal(c)}><Text style={{ fontSize: 16 }}>✏️</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteConsultation(c)}><Text style={{ fontSize: 16 }}>🗑️</Text></TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ── Formulaire consultation ── */}
      <FormModal
        visible={consultModalVisible}
        title={editConsultTarget ? 'Modifier la consultation' : 'Nouvelle consultation'}
        onClose={() => setConsultModalVisible(false)}
        onSave={handleSaveConsultation}
        saving={consultSaving}
        error={consultError}
      >
        <FieldLabel>Animal</FieldLabel>
        <Text style={[styles.input, { color: colors.textPrimary, paddingTop: 14 }]}>{animal?.nom} ({animal?.espece})</Text>

        <FieldLabel required>Date et heure</FieldLabel>
        <DateTimePickerInput
          value={consultForm.dateConsultation}
          onChange={(v) => setConsultForm({ ...consultForm, dateConsultation: v })}
        />

        <FieldLabel required>Motif</FieldLabel>
        <Dropdown
          items={consultationMotifs}
          value={consultForm.motif}
          onChange={(v) => setConsultForm({ ...consultForm, motif: v })}
          placeholder="Choisir un motif"
        />

        <FieldLabel>Compte-rendu</FieldLabel>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={consultForm.compteRendu}
          onChangeText={(v) => setConsultForm({ ...consultForm, compteRendu: v })}
          multiline
          placeholder="Résultats de l'examen..."
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Compte-rendu"
        />

        <FieldLabel>Traitements</FieldLabel>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={consultForm.traitements}
          onChangeText={(v) => setConsultForm({ ...consultForm, traitements: v })}
          multiline
          placeholder="Médicaments prescrits..."
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Traitements"
        />
      </FormModal>

      {/* ── Confirmation suppression consultation ── */}
      <ConfirmModal
        visible={!!deleteConfirm}
        title="Supprimer"
        message="Supprimer cette consultation ?"
        destructive
        confirmLabel="Supprimer"
        onConfirm={confirmDeleteConsultation}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    ...makeModalStyles(colors),
    ...makeCommonStyles(colors),
    detailSection: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
    detailSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    detailSectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    addConsultBtn: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
    addConsultBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
    detailValue: { fontSize: 13, color: colors.textPrimary, flex: 2, textAlign: 'right' },
    detailEmpty: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },
    consultationCard: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    consultationDate: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
    consultationMotif: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    consultationVet: { fontSize: 12, color: colors.primary, marginTop: 4 },
    consultationField: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  });
}
