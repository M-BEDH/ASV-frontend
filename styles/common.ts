/**
 * Styles communs partagés entre les écrans liste (animaux, propriétaires, consultations).
 * Usage : spread dans StyleSheet.create() de chaque écran.
 *
 * const styles = StyleSheet.create({
 *   ...makeCommonStyles(colors, isMobile),
 *   // styles spécifiques à l'écran...
 * });
 */
export function makeCommonStyles(colors: any, isMobile = false) {
  return {
    container: { flex: 1, backgroundColor: colors.background },
    addBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    addBtnText: { color: '#fff', fontWeight: '400' as const, fontSize: isMobile ? 13 : 16 },
list: { flex: 1, padding: 16 },
    empty: { paddingTop: 60 },
    emptyText: { color: colors.textMuted, fontSize: 15, textAlign: 'center' as const },
    card: {
      backgroundColor: colors.surface, borderRadius: 12, padding: 16,
      marginBottom: 12, flexDirection: 'row' as const, justifyContent: 'space-between' as const,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2,
    },
    cardTitle: { fontSize: 15, fontWeight: '700' as const, color: colors.textPrimary },
    cardActions: { gap: 8, justifyContent: 'center' as const, flexDirection: 'row' as const, alignItems: 'center' as const },
    editBtn: { padding: 4 },
    editBtnText: { fontSize: isMobile ? 14 : 18 },
    deleteBtn: { padding: 4 },
    deleteBtnText: { fontSize: isMobile ? 14 : 18 },
    label: { fontSize: 14, fontWeight: '500' as const, color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
    input: {
      borderWidth: 1, borderColor: colors.border, borderRadius: 10,
      padding: 12, fontSize: 15, color: colors.textPrimary, backgroundColor: colors.surface,
    },
  };
}
