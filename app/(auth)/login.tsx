import { useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isWeb = Platform.OS === 'web';

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Identifiants invalides.');
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
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="paw" size={isWeb ? 40 : 30} color={colors.primary} />
            <MaterialCommunityIcons name="pulse" size={isWeb ? 50 : 40} color={colors.danger} />
            <MaterialCommunityIcons name="paw" size={isWeb ? 40 : 30} color={colors.paw} />
          </View>
          <Text style={styles.subtitle}>Connexion</Text>
        </View>

        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <Link href="/(auth)/register" style={styles.link}>
              S'inscrire
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
    title: { fontSize: 36, fontWeight: 'bold', color: colors.primary, fontFamily: 'Merriweather' },
    iconContainer: { flexDirection: 'row', marginTop: 8 },
    subtitle: { width: '100%', textAlign: 'center', fontSize: 14, color: colors.textSecondary, marginTop: 24 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 500,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    cardTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
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
    button: {
      margin: 'auto',
      backgroundColor: colors.primary,
      borderRadius: 10,
      padding: 14,
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
    link: { color: colors.primaryLink, fontWeight: '600', fontSize: 14 },
  });
}
