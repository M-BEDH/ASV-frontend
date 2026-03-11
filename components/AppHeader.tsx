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

  const themeBtn = (
    <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
      <Text style={styles.themeBtnText}>{theme === 'dark' ? '🔆' : '🔅'}</Text>
    </TouchableOpacity>
  );

  if (Platform.OS !== 'web') {
    return ( // return for mobile, with title and badge on a separate row below the brand and actions, to save horizontal space
      <View style={styles.headerMobile}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <MaterialCommunityIcons name="pulse" size={30} color={colors.primaryLink} />
            <Text style={styles.brand}>ASV</Text>
          </View>
          <View style={styles.actions}>
            {themeBtn}
            {right}
          </View>
        </View>
        {(title || badge) ? (
          <View style={styles.titleRowMobile}>
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
  return (  // return for web, with title and badge on the same row as the brand and actions, since we have more horizontal space
    <View style={styles.headerWeb}>
      <View style={styles.brandRow}>
        <MaterialCommunityIcons name="pulse" size={40} color={colors.primaryLink} />
        <Text style={styles.brand}>ASV</Text>
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {badge && (
          <View style={[styles.badge, { backgroundColor: badge.bgColor }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        {themeBtn}
        {right}
      </View>
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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 100,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
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
      fontSize: 18,
      fontWeight: '800',
      color: colors.primary,
      fontFamily: 'serif',
    },
    titleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    titleRowMobile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
    },
    themeBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeBtnText: { fontSize: 20 },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: { fontSize: 12, fontWeight: '600' },
  });
}
