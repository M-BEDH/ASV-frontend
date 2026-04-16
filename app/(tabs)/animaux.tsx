import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { makeCommonStyles } from '../../styles/common';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { animalsApi, ownersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCrud } from '../../hooks/useCrud';
import AppHeader from '../../components/AppHeader';
import Dropdown from '../../components/Dropdown';
import ConfirmModal from '../../components/ConfirmModal';
import FormModal from '../../components/FormModal';
import FieldLabel from '../../components/FieldLabel';
import DateTimePickerInput from '../../components/DateTimePickerInput';
import AnimalDetailModal from '../../components/AnimalDetailModal';
import SearchBar from '../../components/SearchBar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Animal, Owner } from '../../types';
import { toDisplayDate, toIsoDate } from '../../utils/dateUtils';
import { normalize } from '../../utils/normalizeText';

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
  const { isClient, canWrite } = useAuth();
  const { colors } = useTheme();
  const { listPadding, isMobile } = useBreakpoint();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [search, setSearch] = useState('');
  const [detailAnimal, setDetailAnimal] = useState<Animal | null>(null);
  const [detailConsultations, setDetailConsultations] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    const [a, o] = await Promise.all([animalsApi.list(), ownersApi.list()]);
    setOwners(o);
    return a;
  }, []);

  const {
    items: animals,
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
  } = useCrud<Animal, FormData>({
    fetchAll,
    createItem: animalsApi.create,
    updateItem: animalsApi.update,
    deleteItem: animalsApi.delete,
    emptyForm: EMPTY_FORM,
    // Convertit les données du formulaire en payload pour l'API. Les champs optionnels sont envoyés à null si vides, et la date est convertie au format ISO attendu par le backend.
    toPayload: (f) => ({
      nom: f.nom,
      espece: f.espece,
      race: f.race || null,
      dateNaissance: f.dateNaissance ? toIsoDate(f.dateNaissance) : null,
      remarques: f.remarques || null,
      proprietaireId: f.proprietaireId || null,
    }),
    // Convertit un animal en données de formulaire. Les champs optionnels sont convertis en chaîne vide si null pour l'affichage, et la date est convertie au format local pour l'affichage.
    itemToForm: (a) => ({
      nom: a.nom,
      espece: a.espece,
      race: a.race ?? '',
      dateNaissance: a.dateNaissance ? toDisplayDate(a.dateNaissance) : '',
      remarques: a.remarques ?? '',
      proprietaireId: a.proprietaire?.id ?? '',
    }),
    // Valide les données du formulaire avant l'envoi. Vérifie que les champs obligatoires sont remplis.
    validate: (f) => (!f.nom || !f.espece) ? "Le nom et l'espèce sont obligatoires." : null,
    labels: {
      created: 'Animal créé avec succès',
      updated: 'Animal modifié avec succès',
      deleted: 'Animal supprimé',
      deleteMessage: (a) => `Supprimer ${a.nom} ?`,
    },
  });

  // ─── Détail animal ────────────────────────────────────────────────────────

  const openDetail = async (animal: Animal) => {
    // Ouvre le modal de détail pour un animal donné. Charge les consultations associées à l'animal.
    setDetailAnimal(animal);
    setDetailConsultations([]);
    setDetailLoading(true);
    try {
      setDetailConsultations(await animalsApi.getConsultations(animal.id));
    } catch {
      setDetailConsultations([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailAnimal(null);
    setDetailConsultations([]);
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  // Normalise une chaîne pour la recherche en supprimant les accents et en convertissant en minuscules. Permet une recherche insensible à la casse et aux accents.

  const filtered = animals
  // Applique le filtre de recherche sur les animaux. La recherche est insensible à la casse et aux accents, et vérifie le nom, l'espèce, la race et le nom du propriétaire.
    .filter((a) => {
      const q = normalize(search);
      return (
        normalize(a.nom).includes(q) ||
        normalize(a.espece).includes(q) ||
        (a.race && normalize(a.race).includes(q)) ||
        (a.proprietaire && normalize(`${a.proprietaire.prenom} ${a.proprietaire.nom}`).includes(q))
      );
    })
    // Trie les animaux par nom de manière insensible à la casse et aux accents.
    .sort((a, b) => normalize(a.nom).localeCompare(normalize(b.nom)));

  const styles = makeStyles(colors, isMobile);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Animaux"
        right={canWrite ? (
          <TouchableOpacity style={styles.addBtn} onPress={() => openCreate()}>
            <Text style={styles.addBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        ) : undefined}
      />

      {!isClient && (
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
            <Text style={styles.emptyText}>Aucun animal trouvé</Text>
          </View>
        ) : (
          filtered.map((a) => (
            <View key={a.id} style={styles.card}>
              <TouchableOpacity style={styles.cardLeft} onPress={() => openDetail(a)} activeOpacity={0.7}>
                {isMobile ? (
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {a.nom}{' '}
                    <Text style={styles.cardSub}>{a.espece}{a.race ? ` · ${a.race}` : ''}</Text>
                  </Text>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                    <Text style={styles.cardTitle}>{a.nom}</Text>
                    <Text style={styles.cardSub}>{a.espece}</Text>
                    {a.race ? <Text style={styles.cardSub}>{a.race}</Text> : null}
                    {a.dateNaissance ? <Text style={styles.cardSub}>Né(e) le {new Date(a.dateNaissance).toLocaleDateString('fr-FR')}</Text> : null}
                  </View>
                )}
                {a.proprietaire && (
                  <View style={styles.cardOwner}>
                    <MaterialCommunityIcons name="account-outline" size={13} color={colors.primary} />
                    <Text style={styles.cardOwnerText}>{a.proprietaire.prenom} {a.proprietaire.nom}</Text>
                  </View>
                )}
                {isMobile && a.dateNaissance && (
                  <Text style={styles.cardDate}>Né(e) le {new Date(a.dateNaissance).toLocaleDateString('fr-FR')}</Text>
                )}
                {a.remarques ? <Text style={styles.cardRemark}>{a.remarques}</Text> : null}
              </TouchableOpacity>
              {canWrite && (
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openEdit(a)} style={styles.editBtn} accessibilityRole="button" accessibilityLabel="Modifier l'animal">
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(a)} style={styles.deleteBtn} accessibilityRole="button" accessibilityLabel="Supprimer l'animal">
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
        confirmLabel="Supprimer"
        onConfirm={confirm?.onConfirm ?? (() => {})}
        onCancel={hideConfirm}
      />

      <AnimalDetailModal
        animal={detailAnimal}
        owners={owners}
        consultations={detailConsultations}
        consultationsLoading={detailLoading}
        onClose={closeDetail}
        onConsultationsChange={setDetailConsultations}
      />

      {/* ── Formulaire animal ── */}
      <FormModal
        visible={modalVisible}
        title={editTarget ? "Modifier l'animal" : 'Nouvel animal'}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        saving={saving}
        error={error}
      >
        <FieldLabel required>Nom</FieldLabel>
        <TextInput style={styles.input} value={form.nom} onChangeText={(v) => setForm({ ...form, nom: v })} placeholder="Nom de l'animal" placeholderTextColor={colors.textMuted} accessibilityLabel="Nom de l'animal (requis)" />

        <FieldLabel required>Espèce</FieldLabel>
        <TextInput style={styles.input} value={form.espece} onChangeText={(v) => setForm({ ...form, espece: v })} placeholder="Espèce" placeholderTextColor={colors.textMuted} accessibilityLabel="Espèce (requis)" />

        <FieldLabel>Race</FieldLabel>
        <TextInput style={styles.input} value={form.race} onChangeText={(v) => setForm({ ...form, race: v })} placeholder="Race (optionnel)" placeholderTextColor={colors.textMuted} accessibilityLabel="Race" />

        <FieldLabel>Date de naissance</FieldLabel>
        <DateTimePickerInput
          value={form.dateNaissance}
          onChange={(v) => setForm({ ...form, dateNaissance: v })}
          dateOnly
        />

        <FieldLabel>Propriétaire</FieldLabel>
        <Dropdown
          items={[
            { label: '— Aucun —', value: '' },
            ...owners.map((o) => ({ label: `${o.prenom} ${o.nom}`, value: o.id })),
          ]}
          value={form.proprietaireId}
          onChange={(v) => setForm({ ...form, proprietaireId: v })}
          placeholder="Choisir un propriétaire"
        />

        <FieldLabel>Remarques</FieldLabel>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={form.remarques}
          onChangeText={(v) => setForm({ ...form, remarques: v })}
          multiline
          placeholder="Informations complémentaires..."
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Remarques"
        />
      </FormModal>
    </View>
  );
}


function makeStyles(colors: any, isMobile: boolean) {
  return StyleSheet.create({
    ...makeCommonStyles(colors, isMobile),
    cardLeft: { flex: 1, gap: isMobile ? 4 : 8 },
    cardSub: { fontSize: 12, fontWeight: 'normal', color: colors.textSecondary },
    cardOwner: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    cardOwnerText: { fontSize: 12, color: colors.primary, marginLeft: 3, flex: 1 },
    cardDate: { fontSize: 12, color: colors.textMuted },
    cardRemark: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
  });
}
