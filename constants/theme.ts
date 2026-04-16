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
  roleResponsable: string;
  roleBenevole: string;
  success: string;
};

export const Colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    primary: '#04067c',
    primaryLink: '#0400da',
    primaryLight: '#EFF6FF',
    primaryDark: '#1D4ED8',
    secondary: '#088318',
    danger: '#EF4444',
    warning: '#F59E0B',
    background: '#e9e7e7c5',  
    /* surface: '#e2840823', */
    surface: '#0880e223',
    border: '#0880e288',
    textPrimary: '#111827',
    textSecondary: '#575b63',
    textMuted: '#9CA3AF',
    roleVet: '#fc4a4a',
    roleAssistant: '#9e6af8',
    roleClient: '#10681b',
    roleResponsable: '#b94705',
    roleBenevole: '#22c55e',
    success: '#12aa0d',
  },
  dark: {
    primary: '#68acfa',
    primaryLink: '#93C5FD',
    primaryLight: '#1E40AF',
    primaryDark: '#1E40AF',
    secondary: '#10681b',
    danger: '#F87171',
    warning: '#FBBF24',
    background: '#111827',
    surface: '#1F2937',
    border: '#5c6b85',
    // border: '#81aff8c0',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    roleVet: '#ff5656',
    roleAssistant: '#A78BFA',
    roleClient: '#048f5c',
    roleResponsable: '#b8561d',
    roleBenevole: '#42cc75',
    success: '#76f186',
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