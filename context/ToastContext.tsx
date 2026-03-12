import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from './ThemeContext';

type ToastType = 'success' | 'error';

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, t: ToastType = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(msg);
    setType(t);
    const native = Platform.OS !== 'web';
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: native }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: native }).start();
    }, 3000);
  }, []);

  const bg = type === 'success' ? colors.secondary : colors.danger;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View style={[styles.toast, { backgroundColor: bg, opacity }]} pointerEvents="none">
        <Text style={styles.toastText}>{message}</Text>
      </Animated.View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    maxWidth: 320,
    zIndex: 9999,
  },
  toastText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});
