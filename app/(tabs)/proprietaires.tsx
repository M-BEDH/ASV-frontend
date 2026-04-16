import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { makeCommonStyles } from '../../styles/common';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { ownersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCrud } from '../../hooks/useCrud';
import AppHeader from '../../components/AppHeader';
import SearchBar from '../../components/SearchBar';
import ConfirmModal from '../../components/ConfirmModal';
import FormModal from '../../components/FormModal';
import FieldLabel from '../../components/FieldLabel';
import type { Owner } from '../../types';
import { normalize } from '../../utils/normalizeText';

type FormData = {
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
  email: string;
};

const EMPTY_FORM: FormData = { nom: '', prenom: '', adresse: '', telephone: '', email: '' };


export default function ProprietairesScreen() {
  const { user, isStaff, isClient } = useAuth();
  const { colors } = useTheme();
  const { listPadding, isMobile } = useBreakpoint();
  const [search, setSearch] = useState('');

  const {
    items: owners,
    loading,
    refreshing,
    setRefreshing,
    fetchData,
    modalVisible,
    setModalVisible,
    editTarget,
    form,
    setForm,
    saving,
    error,
    confirm,
    hideConfirm,
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
  } = useCrud<Owner, FormData>({
    fetchAll: ownersApi.list,
    createItem: ownersApi.create,
    updateItem: ownersApi.update,
    deleteItem: ownersApi.delete,
    emptyForm: EMPTY_FORM,
    // Convertit les données du formulaire en payload pour l'API. Les champs optionnels sont envoyés à null si vides.
    toPayload: (f) => ({
      nom: f.nom,
      prenom: f.prenom,
      adresse: f.adresse || null,
      telephone: f.telephone || null,
      email: f.email,
    }),
    // Convertit un propriétaire en données de formulaire. Les champs optionnels sont convertis en chaîne vide si null pour l'affichage.
    itemToForm: (o) => ({
      nom: o.nom,
      prenom: o.prenom,
      adresse: o.adresse ?? '',
      telephone: o.telephone ?? '',
      email: o.email,
    }),
    // Valide les données du formulaire avant l'envoi. Vérifie que les champs obligatoires sont remplis.
    validate: (f) => (!f.nom || !f.prenom || !f.email ? 'Le nom, le prénom et l\'email sont obligatoires.' : null),
    labels: {
      created: 'Propriétaire créé avec succès',
      updated: 'Propriétaire modifié avec succès',
      deleted: 'Propriétaire supprimé',
      deleteMessage: (o) => `Supprimer ${o.prenom} ${o.nom} ?`,
    },
  });

  const filtered = owners
  // Applique le filtre de recherche sur les propriétaires. La recherche est insensible à la casse et aux accents, et vérifie le nom, prénom, téléphone et email.
    .filter((o) => {
      const n = normalize(search);
      return (
        normalize(o.nom).includes(n) ||
        normalize(o.prenom).includes(n) ||
        (o.telephone && o.telephone.includes(n)) ||
        (o.email && normalize(o.email).includes(n))
      );
    })
    .sort((a, b) => normalize(a.nom).localeCompare(normalize(b.nom)));

  const styles = makeStyles(colors, isMobile);

  return (
    <View style={styles.container}>
      <AppHeader
        title={isClient ? 'Mon profil' : 'Propriétaires'}
        right={
          isStaff ? (
            <TouchableOpacity style={styles.addBtn} onPress={() => openCreate()}>
              <Text style={styles.addBtnText}>+ Ajouter</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {isStaff && (
        <SearchBar value={search} onChangeText={setSearch} isMobile={isMobile} />
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
                <View style={styles.cardRow}>
                  <Text style={styles.cardTitle}>{o.prenom} {o.nom}</Text>
                  {o.telephone && <Text style={styles.cardInfo}>{isMobile ? '' : '📞 '}{o.telephone}</Text>}
                </View>
                {(o.email || o.adresse) && (
                  <View style={styles.cardRow}>
                    {o.email && <Text style={styles.cardInfo}>✉️ {o.email}</Text>}
                    {o.adresse && <Text style={styles.cardInfo} numberOfLines={1}>{isMobile ? '' : '📍 '}{o.adresse}</Text>}
                  </View>
                )}
              </View>
              {(isStaff || isClient) && (
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openEdit(o)} style={styles.editBtn} accessibilityRole="button" accessibilityLabel="Modifier le propriétaire">
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                  {isStaff && (
                    <TouchableOpacity onPress={() => handleDelete(o)} style={styles.deleteBtn} accessibilityRole="button" accessibilityLabel="Supprimer le propriétaire">
                      <Text style={styles.deleteBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  )}
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
        confirmLabel="Supprimer"
        onConfirm={confirm?.onConfirm ?? (() => {})}
        onCancel={hideConfirm}
      />

      <FormModal
        visible={modalVisible}
        title={editTarget ? 'Modifier' : 'Nouveau propriétaire'}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        saving={saving}
        error={error}
      >
        <FieldLabel required>Nom</FieldLabel>
        <TextInput
          style={styles.input}
          value={form.nom}
          onChangeText={(v) => setForm({ ...form, nom: v })}
          placeholder="Nom"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Nom (requis)"
        />

        <FieldLabel required>Prénom</FieldLabel>
        <TextInput
          style={styles.input}
          value={form.prenom}
          onChangeText={(v) => setForm({ ...form, prenom: v })}
          placeholder="Prénom"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Prénom (requis)"
        />

        <FieldLabel>Téléphone</FieldLabel>
        <TextInput
          style={styles.input}
          value={form.telephone}
          onChangeText={(v) => setForm({ ...form, telephone: v })}
          placeholder="06 12 34 56 78"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          accessibilityLabel="Téléphone"
        />

        <FieldLabel required>Email</FieldLabel>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          placeholder="email"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Email (requis)"
        />

        <FieldLabel>Adresse</FieldLabel>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={form.adresse}
          onChangeText={(v) => setForm({ ...form, adresse: v })}
          multiline
          placeholder="Adresse"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Adresse"
        />
      </FormModal>
    </View>
  );
}

function makeStyles(colors: any, isMobile: boolean) {
  return StyleSheet.create({
    ...makeCommonStyles(colors, isMobile),
    cardLeft: { flex: 1, gap: 4 },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap'},
    cardInfo: { fontSize: 13, color: colors.textSecondary, width: '100%' },
  });
}
