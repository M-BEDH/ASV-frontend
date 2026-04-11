import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Props = {
  title: string;
  right?: React.ReactNode;
  badge?: { label: string; bgColor: string; color: string };
  clinicName?: string;
  clinicNameRight?: React.ReactNode;
};

export default function AppHeader({ title, right, badge, clinicName, clinicNameRight }: Props) {
  const { colors, theme, toggleTheme } = useTheme();
  const styles = makeStyles(colors);
  const isWeb = Platform.OS === 'web';

  const themeBtn = (
    <TouchableOpacity
      onPress={toggleTheme}
      style={styles.themeBtn}
      accessibilityRole="button"
      accessibilityLabel={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      <Text style={[styles.themeBtnText, { fontSize: isWeb ? 28 : 20 }]}>{theme === 'dark' ? '🔆' : <MaterialCommunityIcons name="weather-night" size={isWeb ? 28 : 23} color={colors.textSecondary}/>}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={isWeb ? styles.headerWeb : styles.headerMobile}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
            <Image
                      source={require('../assets/asv_icon.png')}
                      style={styles.logo}
                      resizeMode="contain"
                      accessibilityLabel="Logo Suivi Vétérinaire"
                      accessibilityRole="image"
                    />
          <Text style={[styles.brand, { fontSize: isWeb ? 38 : 16 }]}>Suivi Vétérinaire</Text>
        </View>
        <View style={styles.actions}>
          {right}
        </View>
      </View>
      {(title || badge) ? (
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            {title ? <Text style={[styles.title, isWeb && { fontSize: 20 }]}>{title}</Text> : null}
            <View style={styles.badgeRow}>
              {badge && (
                <View style={[styles.badge, { backgroundColor: badge.bgColor }]}>
                  <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              )}
              {clinicName && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.clinicName}>{clinicName}</Text>
                  {clinicNameRight}
                </View>
              )}
            </View>
          </View>
          {themeBtn}
        </View>
      ) : null}
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    headerMobile: {
      backgroundColor: colors.surface,
      paddingHorizontal: 15,
      paddingTop: 56,
      paddingBottom: 12,
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 4,
    },
    headerWeb: {
      backgroundColor: colors.surface,
      paddingHorizontal: 100,
      paddingTop: 10,
      paddingBottom: 16,
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 6,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    brand: {
      fontWeight: '600',
      color: colors.primary,
      // fontFamily: 'serif',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleBlock: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      flexShrink: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      // bottom: -35,
      // left: -20,
    },
    themeBtn: {
      width: 36,
      height: 36,
    },
    themeBtnText: { fontSize: 20 },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    badge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 3,
      marginTop: 10,
    },
    badgeText: { fontSize: 11, fontWeight: '600' },
    clinicName: { fontSize: 13, fontWeight: '400', color: '#888', marginTop: 10 },
    logo: { width: 50, height: 50, marginTop: 5, marginLeft: -8 },
  });
  
}
