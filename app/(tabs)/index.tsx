import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { consultationsApi } from '../../services/api';
import { Colors } from '../../styles/colors';
import type { Consultation } from '../../types';

export default function AgendaScreen() {
  const { user, logout, isVet } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const data = await consultationsApi.list();
      const now = new Date();
      const upcoming = data
        .filter((c: Consultation) => new Date(c.dateConsultation) >= now)
        .sort(
          (a: Consultation, b: Consultation) =>
            new Date(a.dateConsultation).getTime() - new Date(b.dateConsultation).getTime()
        )
        .slice(0, 20);
      setConsultations(upcoming);
    } catch {
      setConsultations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
  const todayCount = (grouped[today] || []).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>🐾 ASV</Text>
          <Text style={styles.userName}>
            {user?.name}{' '}
            <Text style={[styles.badge, { backgroundColor: roleBgColor(user?.role) }]}>
              {roleLabel(user?.role)}
            </Text>
          </Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats (vétérinaire/assistant uniquement) */}
        {isVet && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{todayCount}</Text>
              <Text style={styles.statLabel}>Aujourd'hui</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{consultations.length}</Text>
              <Text style={styles.statLabel}>À venir</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{Object.keys(grouped).length}</Text>
              <Text style={styles.statLabel}>Jours</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Agenda</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : consultations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune consultation à venir</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([dateKey, items]) => (
            <View key={dateKey} style={styles.dateGroup}>
              <View style={[styles.dateBadge, dateKey === today && styles.dateBadgeToday]}>
                <Text style={[styles.dateBadgeText, dateKey === today && styles.dateBadgeTextToday]}>
                  {formatDate(items[0].dateConsultation)}
                </Text>
              </View>
              {items.map((c) => (
                <View key={c.id} style={styles.consultCard}>
                  <View style={styles.consultTime}>
                    <Text style={styles.consultTimeText}>{formatTime(c.dateConsultation)}</Text>
                  </View>
                  <View style={styles.consultInfo}>
                    <Text style={styles.consultAnimal}>
                      {c.animal?.nom ?? '—'}{' '}
                      <Text style={styles.consultEspece}>({c.animal?.espece ?? ''})</Text>
                    </Text>
                    <Text style={styles.consultMotif}>{c.motif}</Text>
                    {isVet && c.veterinaire && (
                      <Text style={styles.consultVet}>Dr {c.veterinaire.name}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function roleLabel(role?: string | null) {
  if (role === 'veterinaire') return 'Vétérinaire';
  if (role === 'assistant') return 'Assistant(e)';
  return 'Client';
}

function roleBgColor(role?: string | null) {
  if (role === 'veterinaire') return '#DBEAFE';
  if (role === 'assistant') return '#EDE9FE';
  return '#D1FAE5';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  userName: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  badge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: { fontSize: 13, color: Colors.textSecondary },
  scroll: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 12, padding: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: 20, paddingBottom: 8 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
  dateGroup: { marginBottom: 16, paddingHorizontal: 20 },
  dateBadge: {
    backgroundColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  dateBadgeToday: { backgroundColor: Colors.primary },
  dateBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textTransform: 'capitalize' },
  dateBadgeTextToday: { color: '#fff' },
  consultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  consultTime: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    marginRight: 12,
  },
  consultTimeText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  consultInfo: { flex: 1 },
  consultAnimal: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  consultEspece: { fontSize: 13, fontWeight: '400', color: Colors.textMuted },
  consultMotif: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  consultVet: { fontSize: 12, color: Colors.primary, marginTop: 4 },
});
