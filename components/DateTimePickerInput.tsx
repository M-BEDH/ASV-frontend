import { useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';

type Props = {
  value: string; // DD-MM-YYYY HH:MM  (ou DD-MM-YYYY si dateOnly)
  onChange: (value: string) => void;
  dateOnly?: boolean;
};

function toDate(display: string): Date {
  const [datePart, timePart] = display.split(' ');
  const [d, m, y] = (datePart || '').split('-');
  const [h, min] = (timePart || '00:00').split(':');
  const date = new Date(+y, +m - 1, +d, +h, +min);
  return isNaN(date.getTime()) ? new Date() : date;
}

function toDisplay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Web : datetime-local → DD-MM-YYYY HH:MM
function fromDatetimeLocal(s: string): string {
  if (!s) return '';
  const [datePart, timePart] = s.split('T');
  const [y, m, d] = datePart.split('-');
  return `${d}-${m}-${y} ${timePart?.slice(0, 5) ?? '00:00'}`;
}

function toDatetimeLocal(display: string): string {
  const [datePart, timePart] = display.split(' ');
  const [d, m, y] = (datePart || '').split('-');
  if (!y) return '';
  return `${y}-${m}-${d}T${timePart ?? '00:00'}`;
}

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

  const currentDate = toDate(value);

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
                onChange(toDisplay(next));
                setMode('time');
              }
            } else {
              const next = new Date(currentDate);
              next.setHours(selected.getHours(), selected.getMinutes());
              onChange(toDisplay(next));
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
