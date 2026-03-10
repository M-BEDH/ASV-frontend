import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { authApi, clinicsApi } from '../../services/api';
import { Colors } from '../../styles/colors';
import type { Clinic, UserRole } from '../../types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'veterinaire', label: 'Vétérinaire' },
  { value: 'assistant', label: 'Assistant(e)' },
  { value: 'client', label: 'Client' },
];

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [newClinicName, setNewClinicName] = useState('');
  const [vetOption, setVetOption] = useState<'create' | 'join'>('create');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clinicsApi.list().then(setClinics).catch(() => {});
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Nom, email et mot de passe sont obligatoires.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload: any = { name, email, password, role };

      if (role === 'veterinaire') {
        if (vetOption === 'create') {
          if (!newClinicName.trim()) {
            setError('Veuillez saisir un nom de clinique.');
            setLoading(false);
            return;
          }
          payload.clinicName = newClinicName.trim();
        } else {
          if (!selectedClinicId) {
            setError('Veuillez sélectionner une clinique.');
            setLoading(false);
            return;
          }
          payload.clinicId = selectedClinicId;
        }
      } else if (role === 'assistant') {
        if (!selectedClinicId) {
          setError('Veuillez sélectionner votre clinique.');
          setLoading(false);
          return;
        }
        payload.clinicId = selectedClinicId;
      } else if (role === 'client' && selectedClinicId) {
        payload.clinicId = selectedClinicId;
      }

      await authApi.register(payload);
      router.replace('/(auth)/login');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>🐾 ASV</Text>
          <Text style={styles.subtitle}>Créer un compte</Text>
        </View>

        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Nom complet</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Jean Dupont" />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Text style={styles.label}>Rôle</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
                onPress={() => setRole(r.value)}
              >
                <Text style={[styles.roleBtnText, role === r.value && styles.roleBtnTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Vétérinaire : créer ou rejoindre une clinique */}
          {role === 'veterinaire' && (
            <View style={styles.clinicSection}>
              <Text style={styles.label}>Clinique</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[styles.roleBtn, vetOption === 'create' && styles.roleBtnActive]}
                  onPress={() => setVetOption('create')}
                >
                  <Text style={[styles.roleBtnText, vetOption === 'create' && styles.roleBtnTextActive]}>
                    Créer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleBtn, vetOption === 'join' && styles.roleBtnActive]}
                  onPress={() => setVetOption('join')}
                >
                  <Text style={[styles.roleBtnText, vetOption === 'join' && styles.roleBtnTextActive]}>
                    Rejoindre
                  </Text>
                </TouchableOpacity>
              </View>

              {vetOption === 'create' ? (
                <TextInput
                  style={styles.input}
                  value={newClinicName}
                  onChangeText={setNewClinicName}
                  placeholder="Nom de votre clinique"
                />
              ) : (
                <ClinicPicker clinics={clinics} value={selectedClinicId} onChange={setSelectedClinicId} />
              )}
            </View>
          )}

          {/* Assistant : doit rejoindre une clinique */}
          {role === 'assistant' && (
            <View style={styles.clinicSection}>
              <Text style={styles.label}>Votre clinique *</Text>
              <ClinicPicker clinics={clinics} value={selectedClinicId} onChange={setSelectedClinicId} />
            </View>
          )}

          {/* Client : clinique optionnelle */}
          {role === 'client' && clinics.length > 0 && (
            <View style={styles.clinicSection}>
              <Text style={styles.label}>Clinique (optionnel)</Text>
              <ClinicPicker clinics={clinics} value={selectedClinicId} onChange={setSelectedClinicId} />
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Créer mon compte</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" style={styles.link}>
              Se connecter
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ClinicPicker({
  clinics,
  value,
  onChange,
}: {
  clinics: Clinic[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (clinics.length === 0) {
    return <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 4 }}>Aucune clinique disponible.</Text>;
  }
  return (
    <ScrollView style={styles.pickerList} nestedScrollEnabled>
      {clinics.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={[styles.pickerItem, value === c.id && styles.pickerItemActive]}
          onPress={() => onChange(c.id)}
        >
          <Text style={[styles.pickerItemText, value === c.id && styles.pickerItemTextActive]}>
            {c.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 48 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: Colors.primary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  roleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  roleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  roleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleBtnText: { fontSize: 14, color: Colors.textSecondary },
  roleBtnTextActive: { color: '#fff', fontWeight: '600' },
  clinicSection: { marginTop: 4 },
  pickerList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginTop: 4,
  },
  pickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pickerItemActive: { backgroundColor: Colors.primaryLight },
  pickerItemText: { fontSize: 14, color: Colors.textPrimary },
  pickerItemTextActive: { color: Colors.primary, fontWeight: '600' },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  errorText: {
    color: Colors.danger,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 8,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  link: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
});
