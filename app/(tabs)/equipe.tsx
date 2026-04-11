import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../services/api';
import AppHeader from '../../components/AppHeader';
import Dropdown from '../../components/Dropdown';
import FormModal from '../../components/FormModal';
import ConfirmModal from '../../components/ConfirmModal';
import FieldLabel from '../../components/FieldLabel';
import { makeCommonStyles } from '../../styles/common';
import type { StaffUser } from '../../types';

const ASSIGNABLE_ROLES = [
  { label: 'Vétérinaire', value: 'veterinaire' },
  { label: 'Assistant(e)', value: 'assistant' },
  { label: 'Bénévole', value: 'benevole' },
];

type FormData = { name: string; email: string; role: string };
const EMPTY_FORM: FormData = { name: '', email: '', role: '' };

export default function EquipeScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { isResponsable } = useAuth();
  const { listPadding, isMobile } = useBreakpoint();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<{ user: StaffUser } | null>(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await usersApi.list();
      setUsers(data.filter((u: StaffUser) => u.role !== 'responsable' && u.role !== 'client'));
    } catch {
      showToast("Impossible de charger l'équipe.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.role) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const newUser = await usersApi.create(form);
      setUsers(prev => [...prev, newUser]);
      setModalVisible(false);
      setForm(EMPTY_FORM);
      showToast('Collaborateur ajouté.', 'success');
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (user: StaffUser) => {
    setConfirm({ user });
  };

  const confirmDelete = async () => {
    if (!confirm) return;
    const user = confirm.user;
    setConfirm(null);
    try {
      await usersApi.delete(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showToast('Compte anonymisé.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Erreur lors de la suppression.', 'error');
    }
  };

  const styles = makeStyles(colors, isMobile);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Mon équipe"
        right={isResponsable ? (
          <TouchableOpacity style={styles.addBtn} onPress={() => { setForm(EMPTY_FORM); setError(''); setModalVisible(true); }}>
            <Text style={styles.addBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        ) : undefined}
      />

      <ScrollView style={[styles.list, { paddingHorizontal: listPadding }]}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : users.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun collaborateur pour l'instant.</Text>
          </View>
        ) : (
          users.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardInfo}>{item.email}</Text>
                <Text style={[styles.cardInfo, !(item as any).password && styles.pendingBadge]}>
                  {item.role}{item.pending ? ' · en attente' : ''}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <ConfirmModal
        visible={!!confirm}
        title="Supprimer le collaborateur"
        message={confirm ? `Êtes-vous sûr de vouloir supprimer le compte de ${confirm.user.name} ? Il sera anonymisé.` : ''}
        confirmLabel="Supprimer"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />

      <FormModal
        visible={modalVisible}
        title="Ajouter un collaborateur"
        onClose={() => setModalVisible(false)}
        onSave={handleCreate}
        saving={saving}
        error={error}
      >
        <FieldLabel required>Nom</FieldLabel>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          placeholder="Prénom Nom"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Nom (requis)"
        />

        <FieldLabel required>Email</FieldLabel>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          placeholder="email@exemple.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Email (requis)"
        />

        <FieldLabel required>Rôle</FieldLabel>
        <Dropdown
          items={ASSIGNABLE_ROLES}
          value={form.role}
          onChange={(v) => setForm({ ...form, role: v })}
          placeholder="Choisir un rôle"
        />
      </FormModal>
    </View>
  );
}

function makeStyles(colors: any, isMobile: boolean) {
  return StyleSheet.create({
    ...makeCommonStyles(colors, isMobile),
    list: { width: isMobile ? '100%' : '74%', margin: 'auto' },
    cardLeft: { flex: 1, gap: 4 },
    cardInfo: { fontSize: 12, color: colors.textSecondary },
    pendingBadge: { color: colors.textMuted, fontStyle: 'italic' },
  });
}
