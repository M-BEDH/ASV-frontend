import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Props = {
  title: string;
  right?: React.ReactNode;
  badge?: { label: string; bgColor: string; color: string };
};

export default function AppHeader({ title, right, badge }: Props) {
  const { colors, theme, toggleTheme } = useTheme();
  const styles = makeStyles(colors);
  const isWeb = Platform.OS === 'web';

  const themeBtn = (
    <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
      <Text style={[styles.themeBtnText, { fontSize: isWeb ? 28 : 20 }]}>{theme === 'dark' ? '🔆' : <MaterialCommunityIcons name="weather-night" size={isWeb ? 28 : 23} color={colors.textSecondary}/>}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={isWeb ? styles.headerWeb : styles.headerMobile}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <MaterialCommunityIcons name="pulse" size={isWeb ? 50 : 35} color={colors.primary} />
          <Text style={[styles.brand, { fontSize: isWeb ? 38 : 22 }]}>ASV</Text>
        </View>
        <View style={[styles.actions, { alignSelf: 'flex-end' }]}>
          {themeBtn}
          {right}
        </View>
      </View>
      {(title || badge) ? (
        <View style={styles.titleRow}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {badge && (
            <View style={[styles.badge, { backgroundColor: badge.bgColor }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    headerMobile: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 6,
    },
    headerWeb: {
      backgroundColor: colors.surface,
      paddingHorizontal: 100,
      paddingTop: 10,
      paddingBottom: 16,
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
      gap: 6,
    },
    brand: {
      fontWeight: '800',
      color: colors.primary,
      fontFamily: 'serif',
    },
    titleRow: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 4,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      fontFamily: 'serif',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      bottom: -20,
    },
    themeBtn: {
      width: 36,
      height: 36,
      left: -10,
      justifyContent: 'center',
    },
    themeBtnText: { fontSize: 20 },
    badge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 3,
    },
    badgeText: { fontSize: 12, fontWeight: '600' },
  });
}
