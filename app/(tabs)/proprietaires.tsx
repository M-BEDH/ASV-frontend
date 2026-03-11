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
import { ownersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AppHeader from '../../components/AppHeader';
import type { Owner } from '../../types';

type FormData = {
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
  email: string;
};

const EMPTY_FORM: FormData = { nom: '', prenom: '', adresse: '', telephone: '', email: '' };

export default function ProprietairesScreen() {
  const { user, isVet, isClient } = useAuth();
  const { colors } = useTheme();
  const { listPadding, isMobile } = useBreakpoint();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Owner | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const data = await ownersApi.list();
      setOwners(data);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, email: isClient ? (user?.email ?? '') : '' });
    setError('');
    setModalVisible(true);
  };

  const openEdit = (owner: Owner) => {
    setEditTarget(owner);
    setForm({
      nom: owner.nom,
      prenom: owner.prenom,
      adresse: owner.adresse ?? '',
      telephone: owner.telephone ?? '',
      email: owner.email ?? '',
    });
    setError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.prenom) {
      setError('Le nom et le prénom sont obligatoires.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        adresse: form.adresse || null,
        telephone: form.telephone || null,
        email: form.email || null,
      };
      if (editTarget) {
        await ownersApi.update(editTarget.id, payload);
      } else {
        await ownersApi.create(payload);
      }
      setModalVisible(false);
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (owner: Owner) => {
    Alert.alert('Supprimer', `Supprimer ${owner.prenom} ${owner.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await ownersApi.delete(owner.id);
          fetchData();
        },
      },
    ]);
  };

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtered = owners.filter((o) => {
    const q = normalize(search);
    return (
      normalize(o.nom).includes(q) ||
      normalize(o.prenom).includes(q) ||
      (o.telephone && o.telephone.includes(q)) ||
      (o.email && normalize(o.email).includes(q))
    );
  });

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <AppHeader
        title={isClient ? 'Mon profil' : 'Propriétaires'}
        right={
          isVet ? (
            <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
              <Text style={styles.addBtnText}>+ Ajouter</Text>
            </TouchableOpacity>
          ) : isClient && owners.length === 0 ? (
            <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
              <Text style={styles.addBtnText}>Créer mon profil</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {isVet && (
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
            <Text style={styles.emptyText}>
              {isClient ? 'Aucun profil enregistré' : 'Aucun propriétaire trouvé'}
            </Text>
          </View>
        ) : (
          filtered.map((o) => (
            <View key={o.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{o.prenom} {o.nom}</Text>
                {o.telephone && <Text style={styles.cardInfo}>📞 {o.telephone}</Text>}
                {o.email && <Text style={styles.cardInfo}>✉️ {o.email}</Text>}
                {o.adresse && <Text style={styles.cardInfo}>📍 {o.adresse}</Text>}
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEdit(o)} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>✏️</Text>
                </TouchableOpacity>
                {isVet && (
                  <TouchableOpacity onPress={() => handleDelete(o)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editTarget ? 'Modifier' : 'Nouveau propriétaire'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} value={form.nom} onChangeText={(v) => setForm({ ...form, nom: v })} placeholder="Dupont" placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>Prénom *</Text>
            <TextInput style={styles.input} value={form.prenom} onChangeText={(v) => setForm({ ...form, prenom: v })} placeholder="Jean" placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>Téléphone</Text>
            <TextInput style={styles.input} value={form.telephone} onChangeText={(v) => setForm({ ...form, telephone: v })} placeholder="06 12 34 56 78" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholder="jean@email.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={form.adresse}
              onChangeText={(v) => setForm({ ...form, adresse: v })}
              multiline
              placeholder="12 rue des fleurs, 75001 Paris"
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
      backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12,
      flexDirection: 'row', justifyContent: 'space-between',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, 
    },
    cardLeft: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    cardInfo: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    cardActions: { gap: 8, justifyContent: 'center' },
    editBtn: { padding: 6 },
    editBtnText: { fontSize: 18 },
    deleteBtn: { padding: 6 },
    deleteBtnText: { fontSize: 18 },
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
