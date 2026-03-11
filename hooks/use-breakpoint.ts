import { useWindowDimensions } from 'react-native';

export function useBreakpoint() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const listPadding = isDesktop ? 80 : isTablet ? 40 : 16;

  return { isDesktop, isTablet, isMobile: !isDesktop && !isTablet, listPadding };
}
