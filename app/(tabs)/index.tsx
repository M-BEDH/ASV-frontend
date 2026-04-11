import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { consultationsApi, clinicsApi } from '../../services/api';
import { TextInput } from 'react-native';
import AppHeader from '../../components/AppHeader';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Consultation } from '../../types';
import { roleLabel, roleBgColor } from '../../utils/roles';

export default function AgendaScreen() {
  const { user, logout, isVet, refreshUser } = useAuth();
  const { colors, theme } = useTheme();
  const { listPadding, isMobile } = useBreakpoint();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today'>('all');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [clinicModalVisible, setClinicModalVisible] = useState(false);
  const [clinicNameInput, setClinicNameInput] = useState('');
  const canEditClinic = user?.role === 'responsable';

  const fetchData = async () => {
    try {
      const data = await consultationsApi.list();
      const now = new Date();
      // Filtrer les consultations à venir (date >= aujourd'hui) et trier par date croissante. 
      const upcoming = data
        .filter((c: Consultation) => new Date(c.dateConsultation) >= now)
        // Trier les consultations par date de manière croissante (les plus proches en premier).
        .sort(
          (a: Consultation, b: Consultation) =>
            new Date(a.dateConsultation).getTime() - new Date(b.dateConsultation).getTime()
        )
        // Limiter à 20 consultations pour éviter de surcharger l'affichage. 
        .slice(0, 20);
        // Mettre à jour l'état avec les consultations à venir.
      setConsultations(upcoming);
    } catch {
      setConsultations([]);
    } finally {
      // Arrêter les indicateurs de chargement et de rafraîchissement une fois les données chargées ou en cas d'erreur.
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les données une seule fois au montage du composant.
  useEffect(() => { fetchData(); }, []);
 // Recharger les données à chaque fois que l'écran est focalisé (utile si on revient sur cet écran après avoir ajouté une consultation, par exemple).
  useFocusEffect(useCallback(() => { fetchData(); }, [])); //  useCallback avec [] est obligatoire pour useFocusEffect — il mémorise la fonction pour éviter des re-renders infinis.

  // Fonction de rafraîchissement déclenchée par pull-to-refresh. (tirer vers le bas sur mobile)
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Regrouper par date
  const grouped: Record<string, Consultation[]> = {};
  for (const c of consultations) {
    const key = new Date(c.dateConsultation).toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }

  const today = new Date().toDateString();
  // Compter le nombre de consultations pour aujourd'hui en vérifiant si la clé existe dans le regroupement. Si aucune consultation n'est prévue pour aujourd'hui, le compte sera de 0.
  const todayCount = (grouped[today] || []).length;

  // Appliquer le filtre pour n'afficher que les consultations d'aujourd'hui ou toutes les consultations à venir. Si le filtre est sur "today", on vérifie si la clé du jour existe dans le regroupement et on retourne uniquement ce groupe, sinon on retourne tous les groupes.
  const filteredGrouped: Record<string, Consultation[]> =
    filter === 'today'
      ? grouped[today] ? { [today]: grouped[today] } : {}
      : grouped;

  const sectionLabel = filter === 'today' ? "Aujourd'hui" : "Prochains rendez-vous";

  const styles = makeStyles(colors, theme, isMobile);

  return (
    <View style={styles.container}>
      <AppHeader
        title={`${user?.name ?? ''}`}
        badge={{ label: roleLabel(user?.role), bgColor: roleBgColor(user?.role, colors), color: '#ffffff' }}
        clinicName={user?.clinicName ?? undefined}
        clinicNameRight={canEditClinic ? (
          <TouchableOpacity onPress={() => { setClinicNameInput(user?.clinicName ?? ''); setClinicModalVisible(true); }}>
            <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        ) : undefined}
        right={
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={clinicModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Modifier le nom de l'établissement</Text>
            <TextInput
              style={styles.modalInput}
              value={clinicNameInput}
              onChangeText={setClinicNameInput}
              placeholder="Nom de l'établissement"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setClinicModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: colors.textSecondary }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={async () => {
                  if (!clinicNameInput.trim() || !user?.clinicId) return;
                  await clinicsApi.update(user.clinicId, clinicNameInput.trim());
                  await refreshUser();
                  setClinicModalVisible(false);
                }}
              >
                <Text style={{ color: '#fff' }}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: listPadding }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.list}>
        {/* Stats (vétérinaire/assistant uniquement) */}
        {isVet && (
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statCard, filter === 'today' && styles.statCardActive]}
              onPress={() => { setFilter(filter === 'today' ? 'all' : 'today'); setExpandedDay(null); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.statNumber, { color: '#16a34a' }]}>{todayCount}</Text>
              <Text style={styles.statLabel}>Aujourd'hui</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statCard, filter === 'all' && styles.statCardActive]}
              onPress={() => { setFilter('all'); setExpandedDay(null); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.statNumber, { color: '#052fec' }]}>{consultations.length}</Text>
              <Text style={styles.statLabel}>À venir</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>{sectionLabel}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : Object.keys(filteredGrouped).length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune consultation à venir</Text>
          </View>
        ) : (
          Object.entries(filteredGrouped).map(([dateKey, items]) => {
            const isExpanded = expandedDay === dateKey;
            const isToday = dateKey === today;
            return (
              <View key={dateKey} style={styles.dateGroup}>
                <TouchableOpacity
                  style={[styles.dayRow, isToday && styles.dayRowToday]}
                  onPress={() => setExpandedDay(isExpanded ? null : dateKey)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayRowDate, isToday && styles.dayRowDateToday]}>
                    {formatDate(items[0].dateConsultation)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.dayRowBadge, isToday && styles.dayRowBadgeToday]}>
                      <Text style={[styles.dayRowCount, isToday && styles.dayRowCountToday]}>
                        {items.length} rdv
                      </Text>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 16 }}>{isExpanded ? '▲' : '▼'}</Text>
                  </View>
                </TouchableOpacity>
                {isExpanded && items.map((c) => (
                  <View key={c.id} style={styles.consultCard}>
                    <View style={styles.consultTime}>
                      <Text style={styles.consultTimeText}>{formatTime(c.dateConsultation)}</Text>
                    </View>
                    {isMobile ? (
                      <View style={styles.consultInfo}>
                        <Text style={styles.consultAnimal}>
                          {c.animal?.nom ?? '—'}{' '}
                          <Text style={styles.consultEspece}>({c.animal?.espece ?? ''})</Text>
                        </Text>
                        <Text style={styles.consultMotif} numberOfLines={2}>{c.motif}</Text>
                        {isVet && c.veterinaire && (
                          <Text style={{ fontSize: 12, color: colors.primary }}>Dr {c.veterinaire.name}</Text>
                        )}
                      </View>
                    ) : (
                      <View style={[styles.consultInfo, { flexDirection: 'row', alignItems: 'center', gap: 20, flexWrap: 'wrap' }]}>
                        <Text style={styles.consultAnimal}>
                          {c.animal?.nom ?? '—'}{' '}
                          <Text style={styles.consultEspece}>({c.animal?.espece ?? ''})</Text>
                        </Text>
                        <Text style={styles.consultMotif} numberOfLines={1}>{c.motif}</Text>
                        {isVet && c.veterinaire && (
                          <View style={styles.consultVet}>
                            <MaterialCommunityIcons name="stethoscope" size={13} color={colors.primary} />
                            <Text style={{ fontSize: 12, color: colors.primary }}> Dr {c.veterinaire.name}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            );
          })
        )}
        </View>
      </ScrollView>
    </View>
  );
}


function makeStyles(colors: any, theme: 'light' | 'dark', isMobile: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { width: isMobile ? '100%' : '72%', margin: 'auto' },
    logoutBtn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    logoutText: { fontSize: 13, color: colors.textSecondary },
    scroll: { flex: 1 },
    statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 16 },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 4,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
    },
    statCardActive: { borderWidth: 2, borderColor: colors.primary },
    statNumber: { fontSize: 24, fontWeight: '800', color: colors.primary, textAlign: 'center', width: '100%' },
    statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: 'center', width: '100%' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, paddingHorizontal: 20, paddingBottom: 8 },
    empty: { paddingTop: 60 },
    emptyText: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
    dayRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 8,
    },
    dayRowToday: { borderWidth: 2, borderColor: colors.primary },
    dayRowDate: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, textTransform: 'capitalize', flex: 1 },
    dayRowDateToday: { color: colors.primary },
    dayRowBadge: { backgroundColor: colors.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    dayRowBadgeToday: { backgroundColor: colors.primary },
    dayRowCount: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    dayRowCountToday: { color: '#fff' },
    dateGroup: { marginBottom: 8 },
    consultCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      flexDirection: 'row',
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
    },
    consultTime: {
      width: 56,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
      marginRight: 12,
    },
    consultTimeText: { fontSize: 13, fontWeight: '700', color: theme === 'dark' ? '#ffffff' : colors.primary },
    consultInfo: { flex: 1 },
    consultAnimal: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    consultEspece: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
    consultMotif: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    consultVet: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
    modalTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
    modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 15, color: colors.textPrimary, backgroundColor: colors.background, marginBottom: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalCancel: { paddingHorizontal: 16, paddingVertical: 10 },
    modalConfirm: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  });
}
