import { darkPalette, lightPalette } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

describe('Design System & Theme Tokens', () => {
  it('provides comprehensive dark palette with correct contrast', () => {
    expect(darkPalette.background).toBe('#0A0F1D');
    expect(darkPalette.primary).toBe('#6366F1');
    expect(darkPalette.success).toBe('#10B981');
    expect(darkPalette.error).toBe('#EF4444');
    expect(darkPalette.textPrimary).toBe('#F8FAFC');
  });

  it('provides light palette matching token structure', () => {
    expect(lightPalette.background).toBe('#F8FAFC');
    expect(lightPalette.primary).toBe('#6366F1');
    expect(lightPalette.textPrimary).toBe('#0F172A');
  });

  it('provides responsive typography scale', () => {
    expect(typography.h1.fontSize).toBe(28);
    expect(typography.h2.fontSize).toBe(22);
    expect(typography.bodyLarge.fontSize).toBe(16);
    expect(typography.caption.fontSize).toBe(11);
  });

  it('provides spacing and border radius tokens', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.md).toBe(12);
    expect(spacing.lg).toBe(16);
    expect(borderRadius.md).toBe(12);
    expect(borderRadius.full).toBe(9999);
  });
});
