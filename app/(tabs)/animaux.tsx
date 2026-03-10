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
} from 'react-native';
import { animalsApi, ownersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../styles/colors';
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

export default function AnimauxScreen() {
  const { isVet } = useAuth();
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
      dateNaissance: animal.dateNaissance ?? '',
      remarques: animal.remarques ?? '',
      proprietaireId: animal.proprietaire?.id ?? '',
    });
    setError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.espece) {
      setError('Le nom et l\'espèce sont obligatoires.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: any = {
        nom: form.nom,
        espece: form.espece,
        race: form.race || null,
        dateNaissance: form.dateNaissance || null,
        remarques: form.remarques || null,
        proprietaireId: form.proprietaireId || null,
      };
      if (editTarget) {
        await animalsApi.update(editTarget.id, payload);
      } else {
        await animalsApi.create(payload);
      }
      setModalVisible(false);
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (animal: Animal) => {
    Alert.alert('Supprimer', `Supprimer ${animal.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await animalsApi.delete(animal.id);
          fetchData();
        },
      },
    ]);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐾 Animaux</Text>
        {isVet && (
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Text style={styles.addBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher..."
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
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
            <TextInput style={styles.input} value={form.nom} onChangeText={(v) => setForm({ ...form, nom: v })} placeholder="Rex" />

            <Text style={styles.label}>Espèce *</Text>
            <TextInput style={styles.input} value={form.espece} onChangeText={(v) => setForm({ ...form, espece: v })} placeholder="Chien" />

            <Text style={styles.label}>Race</Text>
            <TextInput style={styles.input} value={form.race} onChangeText={(v) => setForm({ ...form, race: v })} placeholder="Labrador" />

            <Text style={styles.label}>Date de naissance (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={form.dateNaissance} onChangeText={(v) => setForm({ ...form, dateNaissance: v })} placeholder="2020-05-15" />

            <Text style={styles.label}>Propriétaire</Text>
            <ScrollView style={styles.pickerList} nestedScrollEnabled>
              <TouchableOpacity
                style={[styles.pickerItem, !form.proprietaireId && styles.pickerItemActive]}
                onPress={() => setForm({ ...form, proprietaireId: '' })}
              >
                <Text style={styles.pickerItemText}>— Aucun —</Text>
              </TouchableOpacity>
              {owners.map((o) => (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.pickerItem, form.proprietaireId === o.id && styles.pickerItemActive]}
                  onPress={() => setForm({ ...form, proprietaireId: o.id })}
                >
                  <Text style={[styles.pickerItemText, form.proprietaireId === o.id && { color: Colors.primary, fontWeight: '600' }]}>
                    {o.prenom} {o.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Remarques</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={form.remarques}
              onChangeText={(v) => setForm({ ...form, remarques: v })}
              multiline
              placeholder="Informations complémentaires..."
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  searchRow: { padding: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchInput: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
  },
  list: { flex: 1, padding: 16 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16,
    marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  cardOwner: { fontSize: 12, color: Colors.primary, marginTop: 4 },
  cardDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cardRemark: { fontSize: 12, color: Colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  cardActions: { gap: 8, justifyContent: 'center' },
  editBtn: { padding: 6 },
  editBtnText: { fontSize: 18 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 18 },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 24, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  modalClose: { fontSize: 22, color: Colors.textMuted },
  modalBody: { flex: 1, padding: 20 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    padding: 12, fontSize: 15, color: Colors.textPrimary, backgroundColor: Colors.surface,
  },
  pickerList: {
    maxHeight: 140, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.surface,
  },
  pickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pickerItemActive: { backgroundColor: Colors.primaryLight },
  pickerItemText: { fontSize: 14, color: Colors.textPrimary },
  errorText: {
    color: Colors.danger, backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 10, padding: 14,
    alignItems: 'center', marginTop: 24, marginBottom: 40,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
