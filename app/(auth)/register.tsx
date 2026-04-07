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
  Image,
} from 'react-native';

import { Link, router } from 'expo-router';
import { authApi, clinicsApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import Dropdown from '../../components/Dropdown';
import FieldLabel from '../../components/FieldLabel';
import PasswordInput from '../../components/PasswordInput';
import type { Clinic, UserRole, EtablissementType } from '../../types';
import { userRoles, etablissementTypes } from '../../constants/enums';


export default function RegisterScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicType, setNewClinicType] = useState<EtablissementType>('clinique');
  const [vetOption, setVetOption] = useState<'create' | 'join'>('create');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [foundClinics, setFoundClinics] = useState<{ id: string; name: string; type: string }[] | null>(null);

  useEffect(() => {
    clinicsApi.list().then(setClinics).catch(() => { });
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Nom, email et mot de passe sont obligatoires.');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload: any = { name, email, password, role };

      if (role === 'veterinaire' || role === 'responsable') {
        if (vetOption === 'create') {
          if (!newClinicName.trim()) {
            setError("Veuillez saisir un nom d'établissement.");
            setLoading(false);
            return;
          }
          payload.clinicName = newClinicName.trim();
          payload.clinicType = newClinicType;
        } else {
          if (!selectedClinicId) {
            setError('Veuillez sélectionner un établissement.');
            setLoading(false);
            return;
          }
          payload.clinicId = selectedClinicId;
        }
      } else if (role === 'assistant' || role === 'benevole') {
        if (!selectedClinicId) {
          setError('Veuillez sélectionner votre établissement.');
          setLoading(false);
          return;
        }
        payload.clinicId = selectedClinicId;
      } else if (role === 'client') {
        if (foundClinics === null) {
          let result;
          try {
            result = await clinicsApi.byEmail(email);
          } catch (e: any) {
            setError(e.message || "Impossible de vérifier votre email.");
            setLoading(false);
            return;
          }
          if (!result.found || result.clinics.length === 0) {
            setError("Aucun établissement trouvé pour cet email. Contactez votre clinique d'abord.");
            setLoading(false);
            return;
          }
          if (result.clinics.length === 1) {
            payload.clinicId = result.clinics[0].id;
          } else {
            setFoundClinics(result.clinics);
            setLoading(false);
            return;
          }
        } else {
          if (!selectedClinicId) {
            setError("Veuillez sélectionner votre établissement.");
            setLoading(false);
            return;
          }
          payload.clinicId = selectedClinicId;
        }
      }

      await authApi.register(payload);
      setSuccess(true);
      setTimeout(() => router.replace('/(auth)/login'), 3000);
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'inscription.");
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
          <Image
            source={require('../../assets/asv_icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Créer un compte</Text>
        </View>

        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {success && (
            <View style={{ alignItems: 'center', padding: 16 }}>
             <Text style={{ fontSize: 16, fontWeight: '600', color: colors.success, marginBottom: 8 }}>
                Compte créé avec succès !
              </Text>
              <Text style={{ color: colors.textMuted, textAlign: 'center', width: '100%' }}>
                Redirection vers la connexion…
              </Text>
            </View>
          )}

          <FieldLabel required>Nom complet</FieldLabel>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom Prénom" placeholderTextColor={colors.textMuted} accessibilityLabel="Nom complet (requis)" />

          <FieldLabel required>Email</FieldLabel>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(v) => { setEmail(v); setFoundClinics(null); setSelectedClinicId(''); }}
            placeholder="votre@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email (requis)"
          />

          <FieldLabel required>Rôle</FieldLabel>
          <Dropdown
            items={userRoles}
            value={role}
            onChange={(v) => setRole(v as UserRole)}
            placeholder="Choisir un rôle"
          />

          {/* Vétérinaire : créer ou rejoindre un établissement */}
          {(role === 'veterinaire' || role === 'responsable') && (
            <View style={styles.clinicSection}>
              <FieldLabel required>Établissement</FieldLabel>
              <Dropdown
                items={[{ value: 'create', label: 'Créer un nouvel établissement' }, { value: 'join', label: 'Rejoindre un établissement existant' }]}
                value={vetOption}
                onChange={(v) => setVetOption(v as 'create' | 'join')}
                placeholder="Créer ou rejoindre ?"
              />

              {vetOption === 'create' ? (
                <>
                  <FieldLabel required>Type d'établissement</FieldLabel>
                  <Dropdown
                    items={etablissementTypes}
                    value={newClinicType}
                    onChange={(v) => setNewClinicType(v as EtablissementType)}
                    placeholder="Choisir un type"
                  />
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    value={newClinicName}
                    onChangeText={setNewClinicName}
                    placeholder="Nom de votre établissement"
                    placeholderTextColor={colors.textMuted}
                  />
                </>
              ) : (
                <Dropdown
                  items={clinics.map((c) => ({ label: `${c.name} (${c.type})`, value: c.id }))}
                  value={selectedClinicId}
                  onChange={setSelectedClinicId}
                  placeholder="Choisir un établissement"
                />
              )}
            </View>
          )}

          {/* Assistant / Bénévole : doit rejoindre un établissement */}
          {(role === 'assistant' || role === 'benevole') && (
            <View style={styles.clinicSection}>
              <FieldLabel required>Votre établissement</FieldLabel>
              <Dropdown
                items={clinics.map((c) => ({ label: `${c.name} (${c.type})`, value: c.id }))}
                value={selectedClinicId}
                onChange={setSelectedClinicId}
                placeholder="Choisir un établissement"
              />
            </View>
          )}

          {/* Client : établissement trouvé par email */}
          {role === 'client' && foundClinics !== null && (
            <View style={styles.clinicSection}>
              <FieldLabel required>Votre établissement</FieldLabel>
              <Dropdown
                items={foundClinics.map((c) => ({ label: `${c.name} (${c.type})`, value: c.id }))}
                value={selectedClinicId}
                onChange={setSelectedClinicId}
                placeholder="Choisir un établissement"
              />
            </View>
          )}

          <FieldLabel required>Mot de passe</FieldLabel>
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            accessibilityLabel="Mot de passe (requis)"
          />

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
    title: { fontSize: 36, fontWeight: 'bold', color: colors.primary },
    logo: { width: 100, height: 100, marginTop: 12 },
    subtitle: { width: '100%', textAlign: 'center', fontSize: 14, color: colors.textSecondary, marginTop: 10 },
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
