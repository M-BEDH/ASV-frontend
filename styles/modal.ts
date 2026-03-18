/**
 * Styles communs partagés entre les modales (FormModal, AnimalDetailModal).
 * Usage : spread dans StyleSheet.create() de chaque modale.
 *
 * const styles = StyleSheet.create({
 *   ...makeModalStyles(colors),
 *   // styles spécifiques à la modale...
 * });
 */
import { Platform } from 'react-native';

export function makeModalStyles(colors: any) {
  return {
    modal: {
      flex: 1,
      backgroundColor: colors.background,
      maxWidth: Platform.OS === 'web' ? 680 : undefined,
      alignSelf: Platform.OS === 'web' ? ('center' as const) : undefined,
      width: '100%' as const,
      marginTop: 60,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: 20,
      paddingTop: 24,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 18, fontWeight: '700' as const, color: colors.textPrimary },
    close: { fontSize: 22, color: colors.textMuted },
    body: { flex: 1, padding: 20 },
  };
}
