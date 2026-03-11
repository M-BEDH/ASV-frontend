/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

type ThemeColors = {
  primary: string;
  primaryLink: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  danger: string;
  warning: string;
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  roleVet: string;
  roleAssistant: string;
  roleClient: string;
};

export const Colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    primary: '#04067c',
    primaryLink: '#0400da',
    primaryLight: '#EFF6FF',
    primaryDark: '#1D4ED8',
    secondary: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    background: '#e9e7e7c5',
   // surface: '#f5eaabb6',  // a modifier 
    surface: '#c2e7f89f',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#575b63',
    textMuted: '#9CA3AF',
    roleVet: '#4a82fc',
    roleAssistant: '#9e6af8',
    roleClient: '#0ff8ae',
  },
  dark: {
    primary: '#68acfa',
    primaryLink: '#93C5FD',
    primaryLight: '#1E40AF',
    primaryDark: '#1E40AF',
    secondary: '#6EE7B7',
    danger: '#F87171',
    warning: '#FBBF24',
    background: '#111827',
    surface: '#1F2937',
    border: '#374151',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    roleVet: '#60A5FA',
    roleAssistant: '#A78BFA',
    roleClient: '#34D399',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});