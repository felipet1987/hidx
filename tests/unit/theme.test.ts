/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, resolveTheme, type Theme } from '../../src/lib/theme';

describe('resolveTheme', () => {
  it('returns stored value when stored is "light"', () => {
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('returns stored value when stored is "dark"', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('dark', true)).toBe('dark');
  });

  it('falls back to prefersDark when stored is null', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });

  it('falls back to prefersDark when stored is invalid', () => {
    expect(resolveTheme('invalid' as unknown as null, true)).toBe('dark');
    expect(resolveTheme('invalid' as unknown as null, false)).toBe('light');
  });
});

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  it('writes data-theme attribute on <html>', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('persists theme in localStorage', () => {
    applyTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('roundtrip: applyTheme then resolveTheme returns same value', () => {
    const themes: Theme[] = ['light', 'dark'];
    for (const t of themes) {
      applyTheme(t);
      const stored = localStorage.getItem('theme');
      expect(resolveTheme(stored, false)).toBe(t);
    }
  });
});
