import { useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { dateToDisplay, displayToDate, fromDatetimeLocal, toDatetimeLocal } from '../utils/dateUtils';

type Props = {
  value: string; // DD-MM-YYYY HH:MM  (ou DD-MM-YYYY si dateOnly)
  onChange: (value: string) => void;
  dateOnly?: boolean;
};

export default function DateTimePickerInput({ value, onChange, dateOnly = false }: Props) {
  const { colors, theme } = useTheme();
  const colorScheme = theme === 'dark' ? 'dark' : 'light';
  const [mode, setMode] = useState<'date' | 'time' | null>(null);

  if (Platform.OS === 'web') {
    if (dateOnly) {
      const webValue = value ? (() => { const [d, m, y] = value.split('-'); return `${y}-${m}-${d}`; })() : '';
      return (
        <input
          type="date"
          value={webValue}
          onChange={(e) => {
            if (!e.target.value) return;
            const [y, m, d] = e.target.value.split('-');
            onChange(`${d}-${m}-${y}`);
          }}
          style={{
            width: '100%', padding: '10px 12px', fontSize: 15, borderRadius: 10,
            border: `1px solid ${colors.border}`, backgroundColor: colors.surface,
            color: value ? colors.textPrimary : colors.textMuted, outline: 'none', boxSizing: 'border-box',
            colorScheme,
          }}
        />
      );
    }
    return (
      <input
        type="datetime-local"
        value={toDatetimeLocal(value)}
        onChange={(e) => onChange(fromDatetimeLocal(e.target.value))}
        style={{
          width: '100%', padding: '10px 12px', fontSize: 15, borderRadius: 10,
          border: `1px solid ${colors.border}`, backgroundColor: colors.surface,
          color: value ? colors.textPrimary : colors.textMuted, outline: 'none', boxSizing: 'border-box',
          colorScheme,
        }}
      />
    );
  }

  const currentDate = displayToDate(value);

  return (
    <>
      <TouchableOpacity
        onPress={() => setMode('date')}
        style={[styles.trigger, { borderColor: colors.border, backgroundColor: colors.surface }]}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 15, color: value ? colors.textPrimary : colors.textMuted, flex: 1 }}>
          {value || (dateOnly ? 'Choisir une date' : 'Choisir une date et heure')}
        </Text>
        <Text style={{ fontSize: 16 }}>📅</Text>
      </TouchableOpacity>

      {mode !== null && (
        <RNDateTimePicker
          value={currentDate}
          mode={mode}
          display="default"
          onChange={(event, selected) => {
            if (event.type === 'dismissed') { setMode(null); return; }
            if (!selected) { setMode(null); return; }
            if (mode === 'date') {
              const next = new Date(selected);
              if (dateOnly) {
                const pad = (n: number) => String(n).padStart(2, '0');
                onChange(`${pad(next.getDate())}-${pad(next.getMonth() + 1)}-${next.getFullYear()}`);
                setMode(null);
              } else {
                next.setHours(currentDate.getHours(), currentDate.getMinutes());
                onChange(dateToDisplay(next));
                setMode('time');
              }
            } else {
              const next = new Date(currentDate);
              next.setHours(selected.getHours(), selected.getMinutes());
              onChange(dateToDisplay(next));
              setMode(null);
            }
          }}
        />
      )}
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
});
