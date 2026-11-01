export type Level = 'confirmed' | 'built' | 'prepared';

export type ShapeKey = 'bird' | 'helix' | 'wave' | 'name' | 'sphere' | 'ring';

export type SectionKind = 'hero' | 'thesis' | 'cards' | 'habit' | 'thread' | 'awards' | 'contact';

export interface Project {
  id: string; // kebab-case, unique
  title: string;
  role: string; // short context line, rendered uppercase
  level: Level;
  intro?: string; // optional paragraph above bullets
  bullets: string[]; // 1–5 items, each one sentence-ish
  note?: string; // honest qualifier / outcome line
  feature?: boolean; // spans full row
}

export interface Stat {
  value: string;
  label: string;
}

export interface Step {
  key: string;
  text: string;
}

export interface ThreadNode {
  field: string;
  title: string;
  text: string;
}

export interface Award {
  name: string;
  year: string | null;
  level: Level;
}

export interface LinkItem {
  label: string;
  href: string;
  external: boolean;
}

export interface Highlighted {
  before: string;
  highlight: string;
  after: string;
}

export interface Section {
  id: string; // DOM id and nav anchor
  kind: SectionKind;
  num: string; // "00".."09" for the eyebrow; hero has ''
  eyebrow: string;
  heading?: string;
  lead?: string;
  shape: ShapeKey; // particle shape while this section is active
  accent: `#${string}`; // section accent color
  navLabel?: string; // if present, appears in the nav
  // kind-specific payloads:
  projects?: Project[];
  stats?: Stat[];
  statement?: Highlighted;
  pull?: Highlighted;
  steps?: Step[];
  nodes?: ThreadNode[];
  awards?: Award[];
  closing?: string;
  links?: LinkItem[];
  showFilter?: boolean;
}

export interface Person {
  name: string;
  firstName: string;
  tagline: string; // hero sub
  kicker: string; // hero kicker
  meta: string[]; // hero meta row
  school: string;
  location: string;
  links: LinkItem[];
}

export const LEVELS: readonly Level[] = ['confirmed', 'built', 'prepared'];
export const SHAPE_KEYS: readonly ShapeKey[] = ['bird', 'helix', 'wave', 'name', 'sphere', 'ring'];
