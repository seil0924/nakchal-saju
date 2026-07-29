import { describe, it, expect } from 'vitest';
import { TYCOONS, tycoonSlug, tycoonBySlug, tyProfile } from './tycoon';

describe('tycoon helpers', () => {
  it('tycoonSlug strips spaces and dots', () => {
    expect(tycoonSlug('Elon Musk')).toBe('ElonMusk');
    expect(tycoonSlug('J. P. Morgan')).toBe('JPMorgan');
  });
  it('tycoonBySlug round-trips the first tycoon', () => {
    const t0 = TYCOONS[0];
    expect(tycoonBySlug(tycoonSlug(t0.name))?.name).toBe(t0.name);
    expect(tycoonBySlug('nonexistent-slug')).toBeUndefined();
  });
  it('tyProfile returns a profile or null', () => {
    const t0 = TYCOONS[0] as any;
    const p = tyProfile(t0.en);
    expect(p === null || typeof p === 'object').toBe(true);
    expect(tyProfile('__no_such_en__')).toBeNull();
  });
});
