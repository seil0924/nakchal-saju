import { describe, it, expect } from 'vitest';
import { GLOSSARY, type Term } from './glossary';

describe('GLOSSARY 용어사전', () => {
  it('is a non-empty array of well-formed terms', () => {
    expect(Array.isArray(GLOSSARY)).toBe(true);
    expect(GLOSSARY.length).toBeGreaterThan(10);
    for (const t of GLOSSARY as Term[]) {
      expect(t.slug).toBeTruthy();
      expect(t.term).toBeTruthy();
      expect(t.def.length).toBeGreaterThan(10);
      expect(['입찰·조달', '명리·사주']).toContain(t.cat);
    }
  });
  it('has unique slugs', () => {
    const slugs = GLOSSARY.map(t => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
