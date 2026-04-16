import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { makeCommonStyles } from '../../styles/common';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { consultationsApi, animalsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCrud } from '../../hooks/useCrud';
import AppHeader from '../../components/AppHeader';
import ConfirmModal from '../../components/ConfirmModal';
import ConsultationFormModal from '../../components/ConsultationFormModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Consultation, Animal } from '../../types';

export default function ConsultationsScreen() {
  const { isVet, isReadOnly } = useAuth();
  const { colors } = useTheme();
  const { listPadding, isMobile } = useBreakpoint();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [pastOpen, setPastOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    const [c, a] = await Promise.all([consultationsApi.list(), animalsApi.list()]);
    setAnimals(a);
    return c;
  }, []);

  const {
    items: consultations,
    loading,
    refreshing,
    setRefreshing,
    fetchData,
    modalVisible,
    setModalVisible,
    editTarget,
    confirm,
    hideConfirm,
    openCreate,
    openEdit,
    handleDelete,
  } = useCrud<Consultation, Record<string, never>>({
    fetchAll,
    createItem: consultationsApi.create,
    updateItem: consultationsApi.update,
    deleteItem: consultationsApi.delete,
    emptyForm: {},
    toPayload: () => ({}),
    itemToForm: () => ({}),
    validate: () => null,
    labels: {
      created: '',
      updated: '',
      deleted: 'Consultation supprimée',
      deleteMessage: () => 'Supprimer cette consultation ?',
    },
  });

  const now = new Date();
  // Sépare les consultations à venir et passées, puis les trie par date (les plus proches en premier pour les à venir, les plus récentes en premier pour les passées)
  const upcoming = consultations
    .filter((c) => new Date(c.dateConsultation) >= now)
    .sort((a, b) => new Date(a.dateConsultation).getTime() - new Date(b.dateConsultation).getTime());
  const past = consultations
    .filter((c) => new Date(c.dateConsultation) < now)
    .sort((a, b) => new Date(b.dateConsultation).getTime() - new Date(a.dateConsultation).getTime());

  const styles = makeStyles(colors, isMobile);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Consultations"
        right={isVet && !isReadOnly ? (
          <TouchableOpacity style={styles.addBtn} onPress={() => openCreate()}>
            <Text style={styles.addBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        ) : undefined}
      />

      <ScrollView
        style={[styles.list, { paddingHorizontal: listPadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => setUpcomingOpen(!upcomingOpen)} activeOpacity={0.7}>
              <Text style={styles.sectionTitle}>À venir ({upcoming.length})</Text>
              <MaterialCommunityIcons name={upcomingOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {upcomingOpen && (upcoming.length === 0 ? (
              <Text style={styles.emptyText}>Aucune consultation à venir</Text>
            ) : (
              upcoming.map((c) => <ConsultCard key={c.id} c={c} isVet={isVet && !isReadOnly} isMobile={isMobile} colors={colors} onEdit={openEdit} onDelete={handleDelete} styles={styles} />)
            ))}

            <TouchableOpacity style={[styles.sectionHeader, { marginTop: 12 }]} onPress={() => setPastOpen(!pastOpen)} activeOpacity={0.7}>
              <Text style={styles.sectionTitle}>Passées ({past.length})</Text>
              <MaterialCommunityIcons name={pastOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {pastOpen && (past.length === 0 ? (
              <Text style={styles.emptyText}>Aucune consultation passée</Text>
            ) : (
              past.map((c) => <ConsultCard key={c.id} c={c} isVet={isVet && !isReadOnly} isMobile={isMobile} colors={colors} onEdit={openEdit} onDelete={handleDelete} styles={styles} />)
            ))}
          </>
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

      <ConsultationFormModal
        visible={modalVisible}
        consultation={editTarget}
        animals={animals}
        onClose={() => setModalVisible(false)}
        onSaved={fetchData}
      />
    </View>
  );
}

function ConsultCard({ c, isVet, isMobile, colors, onEdit, onDelete, styles }: {
  c: Consultation; isVet: boolean; isMobile: boolean; colors: any; onEdit: (c: Consultation) => void; onDelete: (c: Consultation) => void; styles: any;
}) {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        {isMobile ? (
          <>
            <Text style={styles.cardDate}>{fmt(c.dateConsultation)}</Text>
            <View style={styles.cardAnimal}>
              <MaterialCommunityIcons name="paw" size={15} color={colors.primary} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}> {c.animal?.nom ?? '—'} ({c.animal?.espece ?? ''})</Text>
            </View>
            <Text style={styles.cardMotif}><Text style={{ fontWeight: '600' }}>Motif : </Text>{c.motif}</Text>
            {c.compteRendu ? <Text style={styles.cardField}><Text style={{ fontWeight: '600' }}>Compte-rendu : </Text>{c.compteRendu}</Text> : null}
            {c.traitements ? <Text style={styles.cardField}><Text style={{ fontWeight: '600' }}>Traitements : </Text>{c.traitements}</Text> : null}
            {c.veterinaire && (
              <Text style={{ fontSize: 12, color: colors.primary }}>Dr {c.veterinaire.name}</Text>
            )}
          </>
        ) : (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 16 }}>
              <Text style={[styles.cardDate, { marginBottom: 0 }]}>{fmt(c.dateConsultation)}</Text>
              {c.veterinaire && (
                <Text style={{ fontSize: 12, color: colors.primary }}>Dr {c.veterinaire.name}</Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={styles.cardAnimal}>
                <MaterialCommunityIcons name="paw" size={15} color={colors.primary} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}> {c.animal?.nom ?? '—'} ({c.animal?.espece ?? ''})</Text>
              </View>
              <Text style={styles.cardMotif}><Text style={{ fontWeight: '600' }}>Motif : </Text>{c.motif}</Text>
            </View>
            {c.compteRendu ? <Text style={styles.cardField}><Text style={{ fontWeight: '600' }}>Compte-rendu : </Text>{c.compteRendu}</Text> : null}
            {c.traitements ? <Text style={styles.cardField}><Text style={{ fontWeight: '600' }}>Traitements : </Text>{c.traitements}</Text> : null}
          </View>
        )}
      </View>
      {isVet && (
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => onEdit(c)}><Text style={{ fontSize: 16 }}>✏️</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(c)}><Text style={{ fontSize: 16 }}>🗑️</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}


function makeStyles(colors: any, isMobile = false) {
  return StyleSheet.create({
    ...makeCommonStyles(colors, isMobile),
    sectionHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
      marginBottom: 8, borderWidth: 1, borderColor: colors.border,
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 12 },
    cardLeft: { flex: 1 },
    cardDate: { fontSize: 13, fontWeight: '600', color: colors.primary, marginBottom: 4 },
    cardActions: { gap: 20, justifyContent: 'center' },
    cardAnimal: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    cardMotif: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
    cardField: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
    cardVet: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  });
}
