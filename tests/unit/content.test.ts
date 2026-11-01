import { describe, expect, it } from 'vitest';
import { person, sections } from '../../src/content/portfolio';
import { LEVELS } from '../../src/content/types';
import { copyProblem, validateContent } from '../../src/content/validate';

const byId = (id: string) => sections.find((s) => s.id === id)!;

describe('content', () => {
  it('passes validateContent', () => {
    expect(() => validateContent(sections, person)).not.toThrow();
  });

  it('has the expected counts', () => {
    expect(sections).toHaveLength(11);
    expect(sections[0].kind).toBe('hero');
    expect(byId('research').projects).toHaveLength(3);
    expect(byId('building').projects).toHaveLength(6);
    expect(byId('voice').projects).toHaveLength(3);
    expect(byId('advocacy').projects).toHaveLength(4);
    expect(byId('leading').projects).toHaveLength(4);
    expect(byId('awards').awards).toHaveLength(9);
    expect(byId('birdthread').nodes).toHaveLength(4);
    expect(byId('testing').steps).toHaveLength(3);
    expect(byId('thesis').stats).toHaveLength(4);
  });

  it('gives every project and award a valid level', () => {
    for (const s of sections) {
      for (const p of s.projects ?? []) expect(LEVELS).toContain(p.level);
      for (const a of s.awards ?? []) expect(LEVELS).toContain(a.level);
    }
  });

  it('has exactly the published links', () => {
    expect(person.links.map((l) => l.href)).toEqual([
      'https://www.linkedin.com/in/sakshamsrivastava7',
      'https://medium.com/@saksham.shubh2010',
      'mailto:saksham.shubh2010@gmail.com',
    ]);
  });

  it('keeps the stat values exactly as written', () => {
    expect(byId('thesis').stats!.map((s) => s.value)).toEqual(['14,259', '741', '3', '4']);
  });
});

describe('copy checks', () => {
  it('does not flag AutoDock Vina (contains "toDo" mid-word)', () => {
    expect(copyProblem('ensemble docking (AutoDock Vina)')).toBeNull();
  });

  it('flags banned words as whole words only, any case', () => {
    expect(copyProblem('A Revolutionary pipeline')).toMatch(/banned/);
    expect(copyProblem('world-class results')).toMatch(/banned/);
    expect(copyProblem('passionately')).toBeNull();
  });

  it('flags placeholder markers', () => {
    expect(copyProblem('TODO: add count')).toMatch(/placeholder/);
    expect(copyProblem('dates TBD')).toMatch(/placeholder/);
    expect(copyProblem('Note to self: check')).toMatch(/placeholder/);
    expect(copyProblem('fill in later')).toMatch(/placeholder/);
    expect(copyProblem('recover later')).toMatch(/placeholder/);
    expect(copyProblem('a todo list')).toBeNull(); // lowercase is a word, not a marker
  });

  it('rejects broken content', () => {
    const bad = structuredClone(sections);
    bad[2].projects![0].bullets = [];
    bad[3].accent = '#123' as `#${string}`;
    expect(() => validateContent(bad)).toThrow(/1–5 bullets[\s\S]*accent/);
  });

  it('rejects duplicate ids', () => {
    const bad = structuredClone(sections);
    bad[3].projects = [{ ...bad[2].projects![0] }];
    bad[3].kind = 'cards';
    expect(() => validateContent(bad)).toThrow(/duplicate id "smn2-rescuediff"/);
  });
});
