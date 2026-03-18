import { useCallback, useEffect, useState } from 'react';
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
import { useToast } from '../../context/ToastContext';
import AppHeader from '../../components/AppHeader';
import Dropdown from '../../components/Dropdown';
import ConfirmModal from '../../components/ConfirmModal';
import FormModal from '../../components/FormModal';
import DateTimePickerInput from '../../components/DateTimePickerInput';
import AnimalDetailModal from '../../components/AnimalDetailModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
  const [detailAnimal, setDetailAnimal] = useState<Animal | null>(null);
  const [detailConsultations, setDetailConsultations] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

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

  // ─── Détail animal ────────────────────────────────────────────────────────

  const openDetail = async (animal: Animal) => {
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

  // ─── Animal CRUD ──────────────────────────────────────────────────────────

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

  const handleSave = async () => {
    if (!form.nom || !form.espece) {
      setError('Le nom et l\'espèce sont obligatoires.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        nom: form.nom,
        espece: form.espece,
        race: form.race || null,
        dateNaissance: form.dateNaissance ? toIsoDate(form.dateNaissance) : null,
        remarques: form.remarques || null,
        proprietaireId: form.proprietaireId || null,
      };
      if (editTarget) {
        const updated = await animalsApi.update(editTarget.id, payload);
        setAnimals((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...updated } : a));
        setModalVisible(false);
        setTimeout(() => showToast('Animal modifié avec succès'), 400);
      } else {
        const created = await animalsApi.create(payload);
        setAnimals((prev) => [created, ...prev]);
        setModalVisible(false);
        setTimeout(() => showToast('Animal créé avec succès'), 400);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
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
          setAnimals((prev) => prev.filter((a) => a.id !== animal.id));
          showToast('Animal supprimé');
        } catch (e: any) {
          showToast(e.message || 'Erreur lors de la suppression', 'error');
        }
      },
    });
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtered = animals
    .filter((a) => {
      const q = normalize(search);
      return (
        normalize(a.nom).includes(q) ||
        normalize(a.espece).includes(q) ||
        (a.race && normalize(a.race).includes(q)) ||
        (a.proprietaire && normalize(`${a.proprietaire.prenom} ${a.proprietaire.nom}`).includes(q))
      );
    })
    .sort((a, b) => normalize(a.nom).localeCompare(normalize(b.nom)));

  const styles = makeStyles(colors, isMobile);

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
        title={editTarget ? 'Modifier l\'animal' : 'Nouvel animal'}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        saving={saving}
        error={error}
      >
        <Text style={styles.label}>Nom *</Text>
        <TextInput style={styles.input} value={form.nom} onChangeText={(v) => setForm({ ...form, nom: v })} placeholder="Nom de l'animal" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Espèce *</Text>
        <TextInput style={styles.input} value={form.espece} onChangeText={(v) => setForm({ ...form, espece: v })} placeholder="Espèce" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Race</Text>
        <TextInput style={styles.input} value={form.race} onChangeText={(v) => setForm({ ...form, race: v })} placeholder="Race (optionnel)" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Date de naissance</Text>
        <DateTimePickerInput
          value={form.dateNaissance}
          onChange={(v) => setForm({ ...form, dateNaissance: v })}
          dateOnly
        />

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
      </FormModal>
    </View>
  );
}

function toDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

function toIsoDate(display: string): string {
  const [d, m, y] = display.split('-');
  return `${y}-${m}-${d}`;
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
