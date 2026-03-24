import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  children: string;
  required?: boolean;
};

export default function FieldLabel({ children, required = false }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{children}</Text>
      {required && <Text style={styles.required}>requis</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 6, marginTop: 14 },
  label: { fontSize: 14, fontWeight: '500' as const },
  required: { fontSize: 11, color: '#EF4444', fontWeight: '500' as const, marginLeft: 6 },
});
