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
import { useTheme } from '../../context/ThemeContext';
import Dropdown from '../../components/Dropdown';
import type { Clinic, UserRole } from '../../types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'veterinaire', label: 'Vétérinaire' },
  { value: 'assistant', label: 'Assistant(e)' },
  { value: 'client', label: 'Client' },
];

export default function RegisterScreen() {
  const { colors } = useTheme();
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

  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Suivi Vétérinaire</Text>
          <Text style={styles.title}>🐾</Text>
          <Text style={styles.subtitle}>Créer un compte</Text>
        </View>

        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Nom complet</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom Prénom" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
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
                  placeholderTextColor={colors.textMuted}
                />
              ) : (
                <Dropdown
                  items={clinics.map((c) => ({ label: c.name, value: c.id }))}
                  value={selectedClinicId}
                  onChange={setSelectedClinicId}
                  placeholder="Choisir une clinique"
                />
              )}
            </View>
          )}

          {/* Assistant : doit rejoindre une clinique */}
          {role === 'assistant' && (
            <View style={styles.clinicSection}>
              <Text style={styles.label}>Votre clinique *</Text>
              <Dropdown
                items={clinics.map((c) => ({ label: c.name, value: c.id }))}
                value={selectedClinicId}
                onChange={setSelectedClinicId}
                placeholder="Choisir une clinique"
              />
            </View>
          )}

          {/* Client : clinique optionnelle */}
          {role === 'client' && clinics.length > 0 && (
            <View style={styles.clinicSection}>
              <Text style={styles.label}>Clinique (optionnel)</Text>
              <Dropdown
                items={clinics.map((c) => ({ label: c.name, value: c.id }))}
                value={selectedClinicId}
                onChange={setSelectedClinicId}
                placeholder="Choisir une clinique"
              />
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


function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 48 },
    header: { alignItems: 'center', marginBottom: 24, width: '100%', maxWidth: 500 },
    title: { fontSize: 36, fontWeight: 'bold', color: colors.primary,  fontFamily: 'Merriweather'},
    subtitle: { width: '100%', textAlign: 'center', fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 500,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    label: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 6, marginTop: 12 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: colors.textSecondary,
      backgroundColor: colors.background,
    },
    roleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    roleBtn: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    roleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    roleBtnText: { fontSize: 14, color: colors.textSecondary },
    roleBtnTextActive: { color: '#fff', fontWeight: '600' },
    clinicSection: { marginTop: 4 },
    button: {
      margin: 'auto',
      backgroundColor: colors.primary,
      borderRadius: 10,
      padding: 12,
      alignItems: 'center',
      marginTop: 24,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: '400', fontSize: 16 },
    errorText: {
      color: colors.danger,
      backgroundColor: '#FEF2F2',
      borderRadius: 8,
      padding: 10,
      fontSize: 13,
      marginBottom: 8,
    },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { color: colors.textSecondary, fontSize: 14 },
    link: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  });
}
