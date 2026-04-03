import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
};

export default function PasswordInput({ value, onChangeText, placeholder = '••••••••', accessibilityLabel = 'Mot de passe' }: Props) {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.background }]}>
      <TextInput
        style={[styles.input, { color: colors.textSecondary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={accessibilityLabel}
      />
      <TouchableOpacity onPress={() => setShow(!show)} style={styles.eye} accessibilityLabel={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
        <MaterialCommunityIcons name={show ? 'eye-off' : 'eye'} size={22} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  eye: {
    paddingHorizontal: 12,
  },
});
