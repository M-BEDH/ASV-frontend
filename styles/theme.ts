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
    primary: '#04067c', // rgb(4, 6, 124)
    primaryLink: '#0400da', // rgb(4, 0, 218)
    primaryLight: '#EFF6FF', // rgb(239, 246, 255)
    primaryDark: '#1D4ED8', // rgb(29, 78, 216)
    secondary: '#088318', // rgb(8, 131, 24)
    danger: '#EF4444', // rgb(239, 68, 68)
    warning: '#F59E0B', // rgb(245, 158, 11)
    background: '#e9e7e7c5', // rgba(233, 231, 231, 0.77)
    surface: '#0880e223', // rgba(8, 128, 226, 0.14)
    border: '#0880e288', // rgba(8, 128, 226, 0.53)
    textPrimary: '#111827', // rgb(17, 24, 39)
    textSecondary: '#575b63', // rgb(87, 91, 99)
    textMuted: '#9CA3AF', // rgb(156, 163, 175)
    roleVet: '#fc4a4a', // rgb(252, 74, 74)
    roleAssistant: '#9e6af8', // rgb(158, 106, 248)
    roleClient: '#10681b', // rgb(16, 104, 27)
    roleResponsable: '#b94705', // rgb(185, 71, 5)
    roleBenevole: '#1c799e', // rgb(28, 121, 158)
    success: '#12aa0d', // rgb(18, 170, 13)
  },
  dark: {
    primary: '#68acfa', // rgb(104, 172, 250)
    primaryLink: '#93C5FD', // rgb(147, 197, 253)
    primaryLight: '#1E40AF', // rgb(30, 64, 175)
    primaryDark: '#1E40AF', // rgb(30, 64, 175)
    secondary: '#10681b', // rgb(16, 104, 27)
    danger: '#F87171', // rgb(248, 113, 113)
    warning: '#FBBF24', // rgb(251, 191, 36)
    background: '#111827', // rgb(17, 24, 39)
    surface: '#1F2937', // rgb(31, 41, 55)
    border: '#5c6b85', // rgb(92, 107, 133)
    textPrimary: '#F9FAFB', // rgb(249, 250, 251)
    textSecondary: '#D1D5DB', // rgb(209, 213, 219)
    textMuted: '#9CA3AF', // rgb(156, 163, 175)
    roleVet: '#ff5656', // rgb(255, 86, 86)
    roleAssistant: '#A78BFA', // rgb(167, 139, 250)
    roleClient: '#048f5c', // rgb(4, 143, 92)
    roleResponsable: '#b8561d', // rgb(184, 86, 29)
    roleBenevole: '#1c799e', // rgb(28, 121, 158)
    success: '#76f186', // rgb(118, 241, 134)
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