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
import { authApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import FieldLabel from '../../components/FieldLabel';
import PasswordInput from '../../components/PasswordInput';

type PendingAccount = { name: string; role: string };

export default function RegisterScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingAccount, setPendingAccount] = useState<PendingAccount | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Debounce sur l'email — vérifie l'existence d'un pré-compte
  useEffect(() => {
    setPendingAccount(null);
    if (!/\S+@\S+\.\S+/.test(email)) return;

    setCheckingEmail(true);
    const timer = setTimeout(async () => {
      try {
        const result = await authApi.checkPending(email);
        setPendingAccount(result.pending
          ? { name: result.name!, role: result.role! }
          : null
        );
      } catch {
        setPendingAccount(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);

    return () => { clearTimeout(timer); setCheckingEmail(false); };
  }, [email]);

  const handleRegister = async () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    if (!pendingAccount) {
      setError('Aucun compte trouvé pour cet email. Contactez votre administrateur.');
      return;
    }
    if (!password) { setError('Le mot de passe est obligatoire.'); return; }
    if (!passwordRegex.test(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authApi.register({ email, password });
      setSuccess(true);
      setTimeout(() => router.replace('/(auth)/login'), 3000);
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'activation.");
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Suivi Vétérinaire</Text>
          <Image source={require('../../assets/asv_icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>Créer un compte</Text>
        </View>

        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {success && (
            <View style={{ alignItems: 'center', padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.success, marginBottom: 8 }}>
                Compte créé avec succès !
              </Text>
              <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                Redirection vers la connexion…
              </Text>
            </View>
          )}

          {/* ── Email ── */}
          <FieldLabel required>Email</FieldLabel>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email (requis)"
          />
          {checkingEmail && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 4 }} />}

          {pendingAccount && (
            <View style={styles.pendingBox}>
              <Text style={styles.pendingTitle}>Compte trouvé</Text>
              <Text style={styles.pendingInfo}>Nom : {pendingAccount.name}</Text>
              <Text style={[styles.pendingInfo, { marginTop: 8 }]}>
                Définissez votre mot de passe pour activer votre compte.
              </Text>
            </View>
          )}

          {email && !checkingEmail && !pendingAccount && /\S+@\S+\.\S+/.test(email) && (
            <Text style={styles.notFoundHint}>
              Aucun compte trouvé pour cet email. Contactez votre administrateur.
            </Text>
          )}

          {/* ── Mot de passe — visible uniquement si pré-compte trouvé ── */}
          {pendingAccount && (
            <>
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
                  <Text style={styles.buttonText}>Activer mon compte</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" style={styles.link}>Se connecter</Link>
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
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: colors.textSecondary,
      backgroundColor: colors.background,
    },
    pendingBox: {
      // backgroundColor: colors.Primary,
      borderRadius: 10,
      padding: 14,
      marginTop: 12,
      marginBottom: 4,
    },
    pendingTitle: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 8 },
    pendingInfo: { fontSize: 13, color: colors.textPrimary },
    notFoundHint: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', marginTop: 6 },
    button: {
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
