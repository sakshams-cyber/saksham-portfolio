import type { Person, Section } from './types';

export const person: Person = {
  name: 'Saksham Srivastava',
  firstName: 'Saksham',
  kicker: 'One question · many forms',
  tagline:
    'Student researcher & builder. Computational therapeutics, on-device AI, and bird science — bound together by a habit of trying to prove myself wrong.',
  meta: ['Saint Francis High School', 'Sunnyvale, California', 'IEEE invited speaker'],
  school: 'Saint Francis High School',
  location: 'Sunnyvale, California',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sakshamsrivastava7', external: true },
    { label: 'Medium', href: 'https://medium.com/@saksham.shubh2010', external: true },
    { label: 'Email', href: 'mailto:saksham.shubh2010@gmail.com', external: false },
  ],
};

export const sections: Section[] = [
  {
    id: 'top',
    kind: 'hero',
    num: '',
    eyebrow: '',
    shape: 'name',
    accent: '#8bd4ff',
  },

  {
    id: 'thesis',
    kind: 'thesis',
    num: '00',
    eyebrow: 'The through-line',
    shape: 'sphere',
    accent: '#8bd4ff',
    statement: {
      before: 'Most people say they love science. I have a documented habit of trying to ',
      highlight: 'falsify my own results',
      after: ' — building the test my work could fail, running it, and publishing the failure.',
    },
    stats: [
      { value: '14,259', label: 'docking scores' },
      { value: '741', label: 'jobs I reran, not imputed' },
      { value: '3', label: 'projects I audited to failure' },
      { value: '4', label: 'fields, one question' },
    ],
  },

  {
    id: 'research',
    kind: 'cards',
    num: '01',
    eyebrow: 'Research & publications',
    navLabel: 'Research',
    heading: 'Pipelines that test their own answers.',
    lead: 'Computational drug and protein design, each ending in a documented negative result I chose to report rather than bury.',
    shape: 'helix',
    accent: '#35dca0',
    showFilter: true,
    projects: [
      {
        id: 'smn2-rescuediff',
        title: 'SMN2-RescueDiff',
        level: 'built',
        feature: true,
        role: 'Independent research · ~6 months',
        intro:
          'A six-module AI pipeline that generates candidate small molecules and tests whether they would act preferentially on the SMN2 exon-7 splicing target — a therapeutic route in spinal muscular atrophy.',
        bullets: [
          'Autoregressive Transformer generator (6 layers, 8 heads, 384-dim) producing SELFIES/SMILES; RDKit sanitization; ensemble docking (AutoDock Vina). Python · PyTorch.',
          'Docked 500 molecules against 5 modeled SMN2 RNA conformers (2,500 results); narrowed 500 → 150 → 40 on multi-criterion scoring, never a single favorable number.',
          'Built HuRDA — a Human Receptor Decoy Atlas of 100 RNA receptors — as a hard negative control, and folded everything into a Splicing Rescue Selectivity Index.',
          'Benchmarked against approved modifiers (risdiplam, branaplam). The scoring function failed to rank the known drugs on top — I reported that, then found a near-dead scoring term by regressing the composite against its own components.',
        ],
        note: 'Outputs: a manuscript prepared for IEEE Transactions on Computational Biology & Bioinformatics, a public code repository, and lab-outreach materials. Candidates are computational hypotheses; no prediction has been experimentally validated.',
      },
      {
        id: 'h5-horizon',
        title: 'H5 Horizon',
        level: 'built',
        role: 'Oxford-connected internship · co-authored',
        bullets: [
          'Epidemiological review of avian influenza H5N1 plus a diagnostic audit of a generative protein-design pipeline (ESM-2 encoder, SE(3)-equivariant diffusion, inverse folding).',
          'Found positive controls overlapping the target sequence (circularity / data leakage), length-inconsistent scores, and missing validation splits.',
          'Presented as a working artifact with an instructive negative result — not evidence of therapeutic candidates.',
        ],
        note: 'Co-authored with Prof. Avishek Das. Prepared for the IYRC Winter Conference & Journal; acceptance pending.',
      },
      {
        id: 'antibiotics-ai',
        title: 'Antibiotics Prediction AI',
        level: 'built',
        role: '9th grade',
        bullets: [
          'A Transformer that ranks antibiotics against a disease input; featured online.',
          'An early sign of the same instinct: build the model, then ask what it actually knows.',
        ],
      },
    ],
  },

  {
    id: 'testing',
    kind: 'habit',
    num: '02',
    eyebrow: 'The habit',
    shape: 'helix',
    accent: '#35dca0',
    pull: {
      before: 'I have every incentive for my models to work. ',
      highlight: "I go looking for the ways they don't",
      after: ' — and that has happened three separate times.',
    },
    steps: [
      {
        key: 'The leakage',
        text: 'In the H5N1 audit I found my own positive controls overlapped the target sequence — circularity I had every reason to overlook, and reported instead.',
      },
      {
        key: 'The dead term',
        text: 'In SMN2-RescueDiff I watched my scoring function fail to recognize approved drugs, then diagnosed the near-silent component causing it.',
      },
      {
        key: 'The 741',
        text: 'When 741 of 15,000 docking jobs came back empty, I refused to impute the missing values and reran them — at a point when school had restarted and nobody would have checked.',
      },
    ],
  },

  {
    id: 'building',
    kind: 'cards',
    num: '03',
    eyebrow: 'Engineering & builds',
    navLabel: 'Building',
    heading: 'I build the tool when I need it.',
    lead: 'Software and hardware, from award-winning science fairs to an app that grew out of caring for three doves.',
    shape: 'wave',
    accent: '#ffae45',
    projects: [
      {
        id: 'hark',
        title: 'Hark',
        level: 'built',
        role: 'Congressional App Challenge · CA-17',
        bullets: [
          'An installable browser app that listens to environmental audio and separates possible bird distress calls from ordinary song and noise.',
          'On-device analysis — a privacy decision made before anyone asked for it — then rescue guidance and documentation tools. ~950 lines.',
          'Built to answer whether the bird needs help, not only what it is.',
        ],
        note: 'Classifier is a prototype; not yet validated against labeled recordings. Competition result pending. It began with three newborn doves.',
      },
      {
        id: 'nasa-asteroid',
        title: 'NASA Asteroid Simulation + Robotic Spacecraft',
        level: 'confirmed',
        role: '2025',
        bullets: [
          'Orbital simulations from real NASA asteroid data, then a robot car that physically reproduced the simulated motion — Arduino, motor encoders, C++.',
          'The point was the bridge: a result has to touch the world, not just run on a screen.',
        ],
        note: '1st, Synopsys Science & Engineering Fair · advanced to the California State Fair · Thermo Fisher Junior Innovators Top 300.',
      },
      {
        id: 'diabetes',
        title: 'Automated Diabetes Solution',
        level: 'confirmed',
        role: '2024',
        bullets: [
          'An Arduino electrical-feedback simulation modeling glucose-related change through water conductivity.',
        ],
        note: '1st at school · 2nd at Synopsys · advanced to the California State Fair.',
      },
      {
        id: 'eighteen',
        title: 'Eighteen',
        level: 'built',
        role: 'AMC 10 study app · 2026',
        bullets: [
          'A ~1,300-line study app — tabbed curriculum, exam countdown, serif math typesetting — built for my own preparation.',
        ],
      },
      {
        id: 'shubhra',
        title: 'Shubhra — Art Commerce Site',
        level: 'built',
        role: 'Web engineering',
        bullets: [
          'A full multi-page art site: gallery, commissions, studio, checkout, ten optimized works, web-app manifest.',
          '~300KB of hand-written JavaScript across seven modules.',
        ],
      },
      {
        id: 'early-builds',
        title: 'Eighteen months of builds',
        level: 'built',
        role: 'Self-taught',
        bullets: [
          'Code.org App Lab, MIT App Inventor, Colab speech-to-text, classical ML in Python, Tkinter apps, Turtle graphics.',
          'LaTeX/Overleaf for manuscripts — a working skill, not a toy.',
        ],
      },
    ],
  },

  {
    id: 'voice',
    kind: 'cards',
    num: '04',
    eyebrow: 'Science communication & voice',
    navLabel: 'Voice',
    heading: 'The same science, three audiences.',
    lead: 'A rare pairing for a research-heavy student — I can explain the work to a conference, a camera, and a general reader.',
    shape: 'wave',
    accent: '#b89bff',
    projects: [
      {
        id: 'ieee-ceee',
        title: 'IEEE CEEE — Invited Speaker',
        level: 'confirmed',
        role: 'October 2026 · delivered',
        bullets: [
          'A talk on spinal muscular atrophy — its genetics, current treatments, and a closing preview of SMN2-RescueDiff.',
          'Kept the talk about SMA and used my research as a window into the field, rather than making it about my project.',
        ],
      },
      {
        id: 'breakthrough',
        title: 'Breakthrough Junior Challenge',
        level: 'built',
        role: 'Science video · 2026',
        bullets: [
          'A two-minute film on avian magnetoreception — cryptochrome, radical-pair chemistry, quantum spin — explained for a general audience.',
          'Manim animations, 4K source, motion graphics, synchronized narration.',
        ],
        note: 'Explaining quantum biology in 120 seconds was the point. Placement not yet announced.',
      },
      {
        id: 'writing',
        title: 'Written work',
        level: 'built',
        role: 'Essays & articles',
        bullets: [
          'Designed to Fail — a long-form essay on the SMN2 docking campaign, its benchmark failure, and the three lessons.',
          'Medium pieces on SMA and the SMN2 backup gene; research figures, heatmaps, Shapley plots, ablations.',
        ],
      },
    ],
  },

  {
    id: 'advocacy',
    kind: 'cards',
    num: '05',
    eyebrow: 'Advocacy, speech & competition',
    heading: 'I take the harder position, then build the evidence.',
    shape: 'sphere',
    accent: '#ff6f86',
    projects: [
      {
        id: 'dial-act',
        title: 'Original Advocacy — the DIAL Act',
        level: 'built',
        feature: true,
        role: 'NSDA · October 2026',
        intro:
          "A full competition manuscript on mental-health “ghost networks” — insurance directories listing providers who aren't actually reachable — and original legislation to fix it.",
        bullets: [
          'A four-part bill: disclosure, independent testing, a CMS audit role, and liability for inaccurate directories.',
          'Sourced statistics, a named case, a pre-empt section, delivery notes, cut-and-add instructions, and a works-cited list.',
          'Chose the topic because I identified weak statistical evidence in my previous speech — and rebuilt the evidentiary base rather than reworking delivery.',
        ],
        note: 'Competition outcome pending.',
      },
      {
        id: 'hcgcc',
        title: 'Harvard Crimson Global Case Competition',
        level: 'built',
        role: 'Team HEIMER · N.A. regional',
        bullets: [
          "A 14-slide Duolingo case with a five-part appendix: engagement isn't converting to revenue.",
          'Three recommendations, a phased roadmap with go/no-go gates, unit economics, and a risk playbook.',
        ],
        note: 'Projected ~$180M incremental FY2028 revenue — a business-case estimate, not realized revenue. Placement pending.',
      },
      {
        id: 'speech',
        title: 'Competitive Speech',
        level: 'confirmed',
        role: 'NSDA varsity · 2026',
        bullets: ['3rd place across multiple varsity rounds.'],
      },
      {
        id: 'conrad',
        title: 'Conrad Challenge',
        level: 'prepared',
        role: 'Aerospace & Aviation · 2026',
        bullets: [
          'Concept development favoring improvement of existing tech over the futuristic — icing detection, bird-safe aviation, thermal management.',
          'Each concept required an architecture, prototype, validation plan, budget and business model.',
        ],
        note: 'Concepts under consideration; entry not completed.',
      },
    ],
  },

  {
    id: 'leading',
    kind: 'cards',
    num: '06',
    eyebrow: 'Leadership & service',
    navLabel: 'Leading',
    shape: 'sphere',
    accent: '#35dca0',
    projects: [
      {
        id: 'usabo',
        title: 'USABO Club — Founder',
        level: 'confirmed',
        role: 'Saint Francis High School · 2026',
        bullets: [
          'Built a school community around advanced biology — weekly meetings, Olympiad prep, hands-on experiments.',
          "Explicit goal: make advanced biology approachable to students who'd never met it.",
        ],
      },
      {
        id: 'stem-origin',
        title: 'STEM Origin — Founder',
        level: 'built',
        role: 'Nonprofit · United States & Indonesia',
        bullets: ['A STEM-education nonprofit now operating across two countries.'],
      },
      {
        id: 'student-gov',
        title: 'Student Government',
        level: 'built',
        role: 'Freshman class council · 2025',
        bullets: [
          'An unconventional campaign — a meme-style video over a standard speech — on a platform of reliability: notes, reminders, follow-through.',
          'A campaign poster designed as a medical diagnosis, with DNA-helix artwork.',
        ],
      },
      {
        id: 'ta',
        title: 'Teaching Assistant',
        level: 'confirmed',
        role: 'Saint Francis High School',
        bullets: ['Teaching assistant for a faculty course.'],
      },
    ],
  },

  {
    id: 'birdthread',
    kind: 'thread',
    num: '07',
    eyebrow: 'The bird thread',
    shape: 'bird',
    accent: '#8bd4ff',
    pull: {
      before: 'It started with one question — ',
      highlight: 'not what the facts about birds are, but where the gaps still lie',
      after: ' — and that question crossed four fields before it was done.',
    },
    nodes: [
      {
        field: 'Ecology',
        title: 'Communication towers',
        text: 'Collision and light as physical hazards — and RF interference with magnetic orientation as a separate, weaker-evidenced mechanism.',
      },
      {
        field: 'Quantum biology',
        title: 'Magnetoreception',
        text: 'Cryptochrome and radical-pair chemistry — a magnetic compass from electron spin, explained in a two-minute film.',
      },
      {
        field: 'Software',
        title: 'Hark',
        text: 'On-device distress detection — the practical half of the same question, built after caring for three doves.',
      },
      {
        field: 'Aerospace',
        title: 'Bird-safe aviation',
        text: 'A Conrad Challenge concept — the question following me into an entirely new field.',
      },
    ],
  },

  {
    id: 'awards',
    kind: 'awards',
    num: '08',
    eyebrow: 'Recognition',
    navLabel: 'Awards',
    heading: 'The hard credentials.',
    shape: 'ring',
    accent: '#ffcf4d',
    awards: [
      {
        name: 'Outstanding STEM Achievement — Mayor of Sunnyvale (×2)',
        year: null,
        level: 'confirmed',
      },
      { name: 'Synopsys Science & Engineering Fair — 1st place', year: '2025', level: 'confirmed' },
      {
        name: 'California State Science & Engineering Fair — advanced',
        year: '2025',
        level: 'confirmed',
      },
      {
        name: 'Thermo Fisher Junior Innovators Challenge — Top 300',
        year: '2025',
        level: 'confirmed',
      },
      { name: 'Synopsys Science & Engineering Fair — 2nd place', year: '2024', level: 'confirmed' },
      { name: 'IEEE CEEE — Invited conference presenter', year: '2026', level: 'confirmed' },
      {
        name: 'NSDA Varsity Speech — 3rd place, multiple rounds',
        year: '2026',
        level: 'confirmed',
      },
      { name: 'Carnegie Hall — piano solo performance', year: '2023', level: 'confirmed' },
      {
        name: 'IBM Data Science / Data Engineering — certification',
        year: '2026',
        level: 'confirmed',
      },
    ],
    closing:
      'Two mayoral STEM awards — civic recognition from a city in the middle of Silicon Valley, twice — plus a Carnegie Hall solo at thirteen. The contrast is the point.',
  },

  {
    id: 'about',
    kind: 'contact',
    num: '09',
    eyebrow: 'About',
    navLabel: 'About',
    heading: 'One mind, four fields.',
    lead: "I'm a high-school researcher and builder in Sunnyvale, California. I care about computational therapeutics, birds, and work that survives the attempts I make to break it. Also: Carnegie Hall at thirteen, and snare drum as a guest with the Lancers band — because the contrast is part of the person.",
    shape: 'name',
    accent: '#9fd8ff',
  },
];

export const footer =
  "Designed & built as a living portfolio · WebGL particle engine · Every claim sized to what's true.";
