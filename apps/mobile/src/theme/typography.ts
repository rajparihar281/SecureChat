export interface TypographyVariant {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  letterSpacing?: number;
}

export const typography = {
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  } as TypographyVariant,
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  } as TypographyVariant,
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  } as TypographyVariant,
  bodyLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  } as TypographyVariant,
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  } as TypographyVariant,
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  } as TypographyVariant,
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  } as TypographyVariant,
  code: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  } as TypographyVariant,
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.2,
  } as TypographyVariant,
};
