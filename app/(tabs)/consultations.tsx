import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { consultationsApi, animalsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AppHeader from '../../components/AppHeader';
import Dropdown from '../../components/Dropdown';
import DateTimePickerInput from '../../components/DateTimePickerInput';
import type { Consultation, Animal } from '../../types';

type FormData = {
  animalId: string;
  dateConsultation: string;
  motif: string;
  compteRendu: string;
  traitements: string;
};

const EMPTY_FORM: FormData = {
  animalId: '',
  dateConsultation: '',
  motif: '',
  compteRendu: '',
  traitements: '',
};

export default function ConsultationsScreen() {
  const { isVet } = useAuth();
  const { colors } = useTheme();
  const { listPadding, isMobile } = useBreakpoint();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Consultation | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [c, a] = await Promise.all([consultationsApi.list(), animalsApi.list()]);
      setConsultations(c);
      setAnimals(a);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const now = new Date();
  const upcoming = consultations
    .filter((c) => new Date(c.dateConsultation) >= now)
    .sort((a, b) => new Date(a.dateConsultation).getTime() - new Date(b.dateConsultation).getTime());
  const past = consultations
    .filter((c) => new Date(c.dateConsultation) < now)
    .sort((a, b) => new Date(b.dateConsultation).getTime() - new Date(a.dateConsultation).getTime());

  const displayed = tab === 'upcoming' ? upcoming : past;

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, dateConsultation: formatDatetimeLocal(new Date()) });
    setError('');
    setModalVisible(true);
  };

  const openEdit = (c: Consultation) => {
    setEditTarget(c);
    setForm({
      animalId: c.animal?.id ?? '',
      dateConsultation: formatDatetimeLocal(new Date(c.dateConsultation)),
      motif: c.motif,
      compteRendu: c.compteRendu ?? '',
      traitements: c.traitements ?? '',
    });
    setError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.animalId || !form.dateConsultation || !form.motif) {
      setError('Animal, date et motif sont obligatoires.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        animalId: form.animalId,
        dateConsultation: toIsoDatetime(form.dateConsultation),
        motif: form.motif,
        compteRendu: form.compteRendu || null,
        traitements: form.traitements || null,
      };
      if (editTarget) {
        await consultationsApi.update(editTarget.id, payload);
      } else {
        await consultationsApi.create(payload);
      }
      setModalVisible(false);
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (c: Consultation) => {
    Alert.alert('Supprimer', 'Supprimer cette consultation ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          await consultationsApi.delete(c.id);
          fetchData();
        },
      },
    ]);
  };

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Consultations"
        right={isVet ? (
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Text style={styles.addBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        ) : undefined}
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'upcoming' && styles.tabBtnActive]}
          onPress={() => setTab('upcoming')}
        >
          <Text style={[styles.tabBtnText, tab === 'upcoming' && styles.tabBtnTextActive]}>
            {isMobile ? `À venir (${upcoming.length})` : `Consultations à venir (${upcoming.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'past' && styles.tabBtnActive]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.tabBtnText, tab === 'past' && styles.tabBtnTextActive]}>
            {isMobile ? `Passées (${past.length})` : `Consultations passées (${past.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.list, { paddingHorizontal: listPadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : displayed.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune consultation</Text>
          </View>
        ) : (
          displayed.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{fmt(c.dateConsultation)}</Text>
                {isVet && (
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEdit(c)}><Text style={{ fontSize: 18 }}>✏️</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(c)}><Text style={{ fontSize: 18 }}>🗑️</Text></TouchableOpacity>
                  </View>
                )}
              </View>
              <Text style={styles.cardAnimal}>
                🐾 {c.animal?.nom ?? '—'} ({c.animal?.espece ?? ''})
              </Text>
              <Text style={styles.cardMotif}><Text style={{ fontWeight: '600' }}>Motif : </Text>{c.motif}</Text>
              {c.compteRendu ? (
                <Text style={styles.cardField}><Text style={{ fontWeight: '600' }}>Compte-rendu : </Text>{c.compteRendu}</Text>
              ) : null}
              {c.traitements ? (
                <Text style={styles.cardField}><Text style={{ fontWeight: '600' }}>Traitements : </Text>{c.traitements}</Text>
              ) : null}
              {c.veterinaire && (
                <Text style={styles.cardVet}>Dr {c.veterinaire.name}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editTarget ? 'Modifier' : 'Nouvelle consultation'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.label}>Animal *</Text>
            <Dropdown
              items={animals.map((a) => ({
                label: `${a.nom} (${a.espece})${a.proprietaire ? ` — ${a.proprietaire.prenom} ${a.proprietaire.nom}` : ''}`,
                value: a.id,
              }))}
              value={form.animalId}
              onChange={(v) => setForm({ ...form, animalId: v })}
              placeholder="Choisir un animal"
            />

            <Text style={styles.label}>Date et heure *</Text>
            <DateTimePickerInput
              value={form.dateConsultation}
              onChange={(v) => setForm({ ...form, dateConsultation: v })}
            />

            <Text style={styles.label}>Motif *</Text>
            <Dropdown
              items={[
                { label: 'Vaccin', value: 'Vaccin' },
                { label: 'Consultation', value: 'Consultation' },
                { label: 'Urgence', value: 'Urgence' },
                { label: 'Autre', value: 'Autre' },
              ]}
              value={form.motif}
              onChange={(v) => setForm({ ...form, motif: v })}
              placeholder="Choisir un motif"
            />

            <Text style={styles.label}>Compte-rendu</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              value={form.compteRendu}
              onChangeText={(v) => setForm({ ...form, compteRendu: v })}
              multiline
              placeholder="Résultats de l'examen..."
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Traitements</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={form.traitements}
              onChangeText={(v) => setForm({ ...form, traitements: v })}
              multiline
              placeholder="Médicaments prescrits..."
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              style={[styles.saveBtn, !isMobile && { alignSelf: 'center', width: '25%' }, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// Date → DD-MM-YYYY HH:MM (affichage)
function formatDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// DD-MM-YYYY HH:MM → YYYY-MM-DD HH:MM (API)
function toIsoDatetime(display: string): string {
  const [datePart, timePart] = display.split(' ');
  const [d, m, y] = datePart.split('-');
  return `${y}-${m}-${d} ${timePart ?? '00:00'}`;
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    addBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabBtnActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
    tabBtnText: { fontSize: 14, color: colors.textMuted },
    tabBtnTextActive: { color: colors.primary, fontWeight: '700' },
    list: { flex: 1, padding: 16 },
    empty: { paddingTop: 60 },
    emptyText: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
    card: {
      backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, 
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardDate: { fontSize: 13, fontWeight: '600', color: colors.primary, flex: 1 },
    cardActions: { flexDirection: 'row', gap: 8 },
    cardAnimal: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
    cardMotif: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
    cardField: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
    cardVet: { fontSize: 12, color: colors.primary, marginTop: 6 },
    modal: { flex: 1, backgroundColor: colors.background, maxWidth: Platform.OS === 'web' ? 680 : undefined, alignSelf: Platform.OS === 'web' ? 'center' : undefined, width: '100%' },
    modalHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: 20, paddingTop: 24, backgroundColor: colors.surface,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    modalClose: { fontSize: 22, color: colors.textMuted },
    modalBody: { flex: 1, padding: 20 },
    label: { fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
    input: {
      borderWidth: 1, borderColor: colors.border, borderRadius: 10,
      padding: 12, fontSize: 15, color: colors.textPrimary, backgroundColor: colors.surface,
    },
    errorText: { color: colors.danger, backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 8 },
    saveBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 24, marginBottom: 40 },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  });
}
