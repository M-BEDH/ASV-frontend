import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isMobile?: boolean;
};

export default function SearchBar({ value, onChangeText, placeholder = 'Rechercher...', isMobile = false }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors, isMobile);

  return (
    <View style={styles.searchRow}>
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

function makeStyles(colors: any, isMobile: boolean) {
  return StyleSheet.create({
    searchRow: {
      width: isMobile ? '100%' : '50%',
      marginHorizontal: isMobile ? undefined : 'auto',
      padding: 16,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.textPrimary,
    },
  });
}
