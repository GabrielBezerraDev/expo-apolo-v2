import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const isTablet = width >= 768;

export const fontScale = isTablet ? 1.22 : 1;

const fontSize = (size: number) => Math.round(size * fontScale);

export const typography = {
  headingLarge: {
    fontSize: fontSize(28),
    fontWeight: '700' as const,
    lineHeight: fontSize(34),
  },
  headingMedium: {
    fontSize: fontSize(22),
    fontWeight: '700' as const,
    lineHeight: fontSize(28),
  },
  headingSmall: {
    fontSize: fontSize(18),
    fontWeight: '600' as const,
    lineHeight: fontSize(24),
  },
  bodyLarge: {
    fontSize: fontSize(16),
    fontWeight: '400' as const,
    lineHeight: fontSize(24),
  },
  bodyMedium: {
    fontSize: fontSize(14),
    fontWeight: '400' as const,
    lineHeight: fontSize(20),
  },
  bodySmall: {
    fontSize: fontSize(12),
    fontWeight: '400' as const,
    lineHeight: fontSize(16),
  },
  label: {
    fontSize: fontSize(12),
    fontWeight: '500' as const,
    lineHeight: fontSize(16),
  },
  button: {
    fontSize: fontSize(14),
    fontWeight: '700' as const,
    lineHeight: fontSize(18),
    textTransform: 'uppercase' as const,
  },
};