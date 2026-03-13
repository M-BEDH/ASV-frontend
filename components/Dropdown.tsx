import { useState } from 'react';
import { Platform, View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Item = { label: string; value: string };

type Props = {
  items: Item[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function Dropdown({ items, value, onChange, placeholder = 'Sélectionner...' }: Props) {
  const { colors, theme } = useTheme();
  const mobileBg = theme === 'light' ? '#ffffff' : colors.surface;
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  const selected = items.find((i) => i.value === value);

  // Web : select natif HTML
  if (Platform.OS === 'web') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 15,
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          color: value ? colors.textPrimary : colors.textMuted,
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    );
  }

  // Mobile : menu déroulant custom
  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[styles.trigger, { borderColor: colors.border, backgroundColor: mobileBg }]}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 15, color: selected ? colors.textPrimary : colors.textMuted, flex: 1 }}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { backgroundColor: mobileBg, borderColor: colors.border }]}>
            <ScrollView bounces={false} style={{ maxHeight: 300 }}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.item,
                    { borderBottomColor: colors.border },
                    item.value === value && { backgroundColor: colors.primaryLight ?? '#EFF6FF' },
                  ]}
                  onPress={() => { onChange(item.value); setOpen(false); }}
                >
                  <Text style={{ fontSize: 15, color: item.value === value ? colors.primary : colors.textPrimary }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  menu: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
