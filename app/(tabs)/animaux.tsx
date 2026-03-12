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
} from 'react-native';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { animalsApi, ownersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import AppHeader from '../../components/AppHeader';
import Dropdown from '../../components/Dropdown';
import ConfirmModal from '../../components/ConfirmModal';
import type { Animal, Owner } from '../../types';

type FormData = {
  nom: string;
  espece: string;
  race: string;
  dateNaissance: string;
  remarques: string;
  proprietaireId: string;
};

const EMPTY_FORM: FormData = { nom: '', espece: '', race: '', dateNaissance: '', remarques: '', proprietaireId: '' };

type ConfirmConfig = { title: string; message: string; destructive: boolean; onConfirm: () => void };

export default function AnimauxScreen() {
  const { isVet, isClient } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { listPadding, isMobile } = useBreakpoint();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Animal | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const showConfirm = (cfg: ConfirmConfig) => setConfirm(cfg);
  const hideConfirm = () => setConfirm(null);

  const fetchData = useCallback(async () => {
    try {
      const [a, o] = await Promise.all([animalsApi.list(), ownersApi.list()]);
      setAnimals(a);
      setOwners(o);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalVisible(true);
  };

  const openEdit = (animal: Animal) => {
    setEditTarget(animal);
    setForm({
      nom: animal.nom,
      espece: animal.espece,
      race: animal.race ?? '',
      dateNaissance: animal.dateNaissance ? toDisplayDate(animal.dateNaissance) : '',
      remarques: animal.remarques ?? '',
      proprietaireId: animal.proprietaire?.id ?? '',
    });
    setError('');
    setModalVisible(true);
  };

  const doSave = async () => {
    hideConfirm();
    setSaving(true);
    setError('');
    try {
      const payload: any = {
        nom: form.nom,
        espece: form.espece,
        race: form.race || null,
        dateNaissance: form.dateNaissance ? toIsoDate(form.dateNaissance) : null,
        remarques: form.remarques || null,
        proprietaireId: form.proprietaireId || null,
      };
      if (editTarget) {
        await animalsApi.update(editTarget.id, payload);
        showToast('Animal modifié avec succès');
      } else {
        await animalsApi.create(payload);
        showToast('Animal créé avec succès');
      }
      setModalVisible(false);
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!form.nom || !form.espece) {
      setError('Le nom et l\'espèce sont obligatoires.');
      return;
    }
    if (editTarget) {
      showConfirm({
        title: 'Modifier l\'animal',
        message: `Confirmer la modification de ${editTarget.nom} ?`,
        destructive: false,
        onConfirm: doSave,
      });
    } else {
      doSave();
    }
  };

  const handleDelete = (animal: Animal) => {
    showConfirm({
      title: 'Supprimer',
      message: `Supprimer ${animal.nom} ?`,
      destructive: true,
      onConfirm: async () => {
        hideConfirm();
        try {
          await animalsApi.delete(animal.id);
          showToast('Animal supprimé');
          fetchData();
        } catch (e: any) {
          showToast(e.message || 'Erreur lors de la suppression', 'error');
        }
      },
    });
  };

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtered = animals.filter((a) => {
    const q = normalize(search);
    return (
      normalize(a.nom).includes(q) ||
      normalize(a.espece).includes(q) ||
      (a.race && normalize(a.race).includes(q)) ||
      (a.proprietaire &&
        normalize(`${a.proprietaire.prenom} ${a.proprietaire.nom}`).includes(q))
    );
  });

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Animaux"
        right={isVet ? (
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Text style={styles.addBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        ) : undefined}
      />

      {!isClient && (
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher..."
            placeholderTextColor={colors.textMuted}
            clearButtonMode="while-editing"
          />
        </View>
      )}

      <ScrollView
        style={[styles.list, { paddingHorizontal: listPadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun animal trouvé</Text>
          </View>
        ) : (
          filtered.map((a) => (
            <View key={a.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{a.nom}</Text>
                <Text style={styles.cardSub}>
                  {a.espece}{a.race ? ` · ${a.race}` : ''}
                </Text>
                {a.proprietaire && (
                  <Text style={styles.cardOwner}>
                    👤 {a.proprietaire.prenom} {a.proprietaire.nom}
                  </Text>
                )}
                {a.dateNaissance && (
                  <Text style={styles.cardDate}>
                    Né(e) le {new Date(a.dateNaissance).toLocaleDateString('fr-FR')}
                  </Text>
                )}
                {a.remarques ? <Text style={styles.cardRemark}>{a.remarques}</Text> : null}
              </View>
              {isVet && (
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openEdit(a)} style={styles.editBtn}>
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(a)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <ConfirmModal
        visible={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        destructive={confirm?.destructive ?? false}
        confirmLabel={confirm?.destructive ? 'Supprimer' : 'Confirmer'}
        onConfirm={confirm?.onConfirm ?? (() => {})}
        onCancel={hideConfirm}
      />

      {/* Modal création / édition */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editTarget ? 'Modifier l\'animal' : 'Nouvel animal'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} value={form.nom} onChangeText={(v) => setForm({ ...form, nom: v })} placeholder="Rex" placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>Espèce *</Text>
            <TextInput style={styles.input} value={form.espece} onChangeText={(v) => setForm({ ...form, espece: v })} placeholder="Chien" placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>Race</Text>
            <TextInput style={styles.input} value={form.race} onChangeText={(v) => setForm({ ...form, race: v })} placeholder="Labrador" placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>Date de naissance (JJ-MM-AAAA)</Text>
            <TextInput style={styles.input} value={form.dateNaissance} onChangeText={(v) => setForm({ ...form, dateNaissance: v })} placeholder="15-05-2020" placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>Propriétaire</Text>
            <Dropdown
              items={[
                { label: '— Aucun —', value: '' },
                ...owners.map((o) => ({ label: `${o.prenom} ${o.nom}`, value: o.id })),
              ]}
              value={form.proprietaireId}
              onChange={(v) => setForm({ ...form, proprietaireId: v })}
              placeholder="Choisir un propriétaire"
            />

            <Text style={styles.label}>Remarques</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={form.remarques}
              onChangeText={(v) => setForm({ ...form, remarques: v })}
              multiline
              placeholder="Informations complémentaires..."
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

// YYYY-MM-DD → DD-MM-YYYY (affichage)
function toDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

// DD-MM-YYYY → YYYY-MM-DD (API)
function toIsoDate(display: string): string {
  const [d, m, y] = display.split('-');
  return `${y}-${m}-${d}`;
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    addBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    searchRow: { padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    searchInput: {
      backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
      borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.textPrimary,
    },
    list: { flex: 1, padding: 16 },
    empty: { paddingTop: 60 },
    emptyText: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
    card: {
      backgroundColor: colors.surface, borderRadius: 12, padding: 16,
      marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2,
    },
    cardLeft: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    cardSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    cardOwner: { fontSize: 12, color: colors.primary, marginTop: 4 },
    cardDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    cardRemark: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
    cardActions: { gap: 8, justifyContent: 'center' },
    editBtn: { padding: 6 },
    editBtnText: { fontSize: 18 },
    deleteBtn: { padding: 6 },
    deleteBtnText: { fontSize: 18 },
    modal: { flex: 1, backgroundColor: colors.background },
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
    errorText: {
      color: colors.danger, backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 8,
    },
    saveBtn: {
      backgroundColor: colors.primary, borderRadius: 10, padding: 14,
      alignItems: 'center', marginTop: 24, marginBottom: 40,
    },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  });
}
