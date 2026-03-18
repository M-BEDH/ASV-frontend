import { Modal, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { makeModalStyles } from '../styles/modal';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  error?: string;
  children: React.ReactNode;
};

export default function FormModal({ visible, title, onClose, onSave, saving, error, children }: Props) {
  const { colors } = useTheme();
  const { isMobile } = useBreakpoint();
  const styles = makeStyles(colors);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {children}
          <TouchableOpacity
            style={[styles.saveBtn, !isMobile && { alignSelf: 'center', width: '25%' }, saving && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    ...makeModalStyles(colors),
    error: {
      color: colors.danger,
      backgroundColor: '#FEF2F2',
      borderRadius: 8,
      padding: 10,
      fontSize: 13,
      marginBottom: 8,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      padding: 14,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 40,
    },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  });
}
