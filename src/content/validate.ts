import { LEVELS, SHAPE_KEYS, type Person, type Section } from './types';

/** Banned inflation words (§20.3). Matched as whole words, case-insensitively. */
export const BANNED_WORDS = [
  'revolutionary',
  'groundbreaking',
  'world-class',
  'cutting-edge',
  'passionate',
  'visionary',
  'disruptive',
  'game-changing',
  'guru',
  'ninja',
  'rockstar',
  'unparalleled',
  'best-in-class',
  'synergy',
];

// Hyphenated words need explicit boundaries: `\b` alone would let "world-class" match inside
// "world-classes". Lookarounds on letters/digits/hyphen keep matches to whole words.
const bannedRe = new RegExp(`(?<![\\w-])(${BANNED_WORDS.join('|')})(?![\\w-])`, 'i');
// All-caps markers are case-sensitive so "AutoDock" (Au-toDo-ck) never trips the check.
const markerCaseRe = /\b(TODO|TBD)\b/;
const markerLooseRe = /(note to self|placeholder|fill in|recover later)/i;
// "leverage" is banned only as a verb for people; flag any use so a human decides.
const leverageRe = /\bleverag(e|es|ed|ing)\b/i;

/** Returns the first problem found in a piece of copy, or null. */
export function copyProblem(text: string): string | null {
  const b = bannedRe.exec(text);
  if (b) return `banned word "${b[1]}"`;
  const m = markerCaseRe.exec(text) ?? markerLooseRe.exec(text);
  if (m) return `placeholder marker "${m[1]}"`;
  const l = leverageRe.exec(text);
  if (l) return `banned word "${l[0]}"`;
  return null;
}

/** Walk every string in a value (deep), calling fn with a path for error messages. */
function eachString(value: unknown, path: string, fn: (s: string, path: string) => void) {
  if (typeof value === 'string') fn(value, path);
  else if (Array.isArray(value)) value.forEach((v, i) => eachString(v, `${path}[${i}]`, fn));
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) eachString(v, `${path}.${k}`, fn);
}

/** Throws with every problem listed if the content breaks the schema rules in §7.3. */
export function validateContent(sections: Section[], person?: Person): void {
  const errors: string[] = [];
  const ids = new Set<string>();
  const claim = (id: string, where: string) => {
    if (ids.has(id)) errors.push(`duplicate id "${id}" (${where})`);
    ids.add(id);
  };

  for (const s of sections) {
    const where = `section ${s.id}`;
    claim(s.id, where);
    if (!/^#[0-9a-fA-F]{6}$/.test(s.accent))
      errors.push(`${where}: accent "${s.accent}" is not #rrggbb`);
    if (!SHAPE_KEYS.includes(s.shape)) errors.push(`${where}: unknown shape "${s.shape}"`);

    if (s.kind === 'cards' && !s.projects?.length)
      errors.push(`${where}: cards section has no projects`);
    if (s.kind === 'thread' && s.nodes?.length !== 4)
      errors.push(`${where}: thread needs exactly 4 nodes`);
    if (s.kind === 'habit' && s.steps?.length !== 3)
      errors.push(`${where}: habit needs exactly 3 steps`);

    for (const p of s.projects ?? []) {
      claim(p.id, `${where} project`);
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id))
        errors.push(`project ${p.id}: id is not kebab-case`);
      if (p.bullets.length < 1 || p.bullets.length > 5)
        errors.push(`project ${p.id}: needs 1–5 bullets, has ${p.bullets.length}`);
      if (!LEVELS.includes(p.level)) errors.push(`project ${p.id}: invalid level "${p.level}"`);
    }
    for (const a of s.awards ?? []) {
      if (!LEVELS.includes(a.level)) errors.push(`award "${a.name}": invalid level "${a.level}"`);
    }
  }

  const check = (s: string, path: string) => {
    // num/eyebrow on the hero are intentionally empty; everything else must have content.
    const optionalEmpty = /^sections\[0\]\.(num|eyebrow)$/.test(path);
    if (!optionalEmpty && s.trim() === '') errors.push(`${path}: empty string`);
    const problem = copyProblem(s);
    if (problem) errors.push(`${path}: ${problem}`);
  };
  eachString(sections, 'sections', check);
  if (person) eachString(person, 'person', check);

  if (errors.length) throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
}
