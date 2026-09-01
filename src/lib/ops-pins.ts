export type OpsPin = {
  id: string;
  label: string;
  main: boolean;
  parent?: string;
  lon: number;
  lat: number;
  /** Flips the bow of the line feeding this pin (-1 curves it the other way). */
  bowDir?: number;
  /** Route to open instead of the boarding-pass dialog. */
  link?: string;
  code: string;
  route: string;
  gate: string;
  body: string[];
};

/**
 * 9 pins in two fans: ABOUT US over rounds 1-3, RULEBOOK over the three
 * rule pins, REGISTER on its own. Children share a row so the labels line
 * up, and the columns sit further apart than the widest label.
 */
export const OPS_PINS: OpsPin[] = [
  {
    id: "about",
    label: "ABOUT US",
    main: true,
    lon: -110.6,
    lat: 41.7,
    code: "TASK-2026",
    route: "HQ → WORLD",
    gate: "A01",
    body: [
      "INTEL X is a clandestine 72-hour operation for builders who move high-stakes digital cargo across borders.",
      "Three rounds. One syndicate. No questions asked.",
    ],
  },
  {
    id: "r1",
    label: "ROUND 1",
    main: false,
    parent: "about",
    bowDir: -1,
    lon: -94,
    lat: 65.6,
    code: "TASK-2026/R1",
    route: "MEX → SFO",
    gate: "B11",
    body: [
      "Round 1 — Recon. Assemble your crew and file the opening manifest.",
      "Duration: 24 hours. Payload: concept + prototype drop.",
    ],
  },
  {
    id: "r2",
    label: "ROUND 2",
    main: false,
    parent: "about",
    lon: -70.6,
    lat: -33.6,
    code: "TASK-2026/R2",
    route: "GRU → LIS",
    gate: "B12",
    body: [
      "Round 2 — Transit. Move the payload past the border controls.",
      "Duration: 24 hours. Checkpoint review at the halfway mark.",
    ],
  },
  {
    id: "r3",
    label: "ROUND 3",
    main: false,
    parent: "about",
    lon: -47.6,
    lat: -7.6,
    code: "TASK-2026/R3",
    route: "YQX → JFK",
    gate: "B13",
    body: [
      "Round 3 — Extraction. Final delivery to the syndicate council.",
      "Duration: 24 hours. Stakes: the full prize vault.",
    ],
  },
  {
    id: "rulebook",
    label: "RULEBOOK",
    main: true,
    lon: 43.8,
    lat: 28.9,
    code: "TASK-2026/CODE",
    route: "BER → ANY",
    gate: "C00",
    body: [
      "The Smuggler's Code. Read it once, follow it always.",
      "Payload limits, border controls, interception penalties — all clauses binding.",
    ],
  },
  {
    id: "rr1",
    label: "ROUND 1 RULES",
    main: false,
    parent: "rulebook",
    lon: 10.9,
    lat: 50,
    code: "CODE/01",
    route: "CLAUSE 01",
    gate: "C11",
    body: [
      "Payload limits: max 4 operatives per crew, one manifest per crew.",
      "All cargo must be original. Contraband from prior ops is seized.",
    ],
  },
  {
    id: "rr2",
    label: "ROUND 2 RULES",
    main: false,
    parent: "rulebook",
    lon: 22,
    lat: 10,
    code: "CODE/02",
    route: "CLAUSE 02",
    gate: "C12",
    body: [
      "Border controls: deadlines are hard. Late manifests are impounded.",
      "One checkpoint appeal permitted per crew, filed in writing.",
    ],
  },
  {
    id: "rr3",
    label: "ROUND 3 RULES",
    main: false,
    parent: "rulebook",
    bowDir: -1,
    lon: 76.3,
    lat: 28.7,
    code: "CODE/03",
    route: "CLAUSE 03",
    gate: "C13",
    body: [
      "Interception penalties: plagiarism, leaks, or tampering end the run.",
      "Council rulings are final and unappealable.",
    ],
  },
  {
    id: "register",
    label: "REGISTER",
    main: true,
    link: "/register",
    lon: 140,
    lat: -26,
    code: "TASK-2026/BP",
    route: "ANY → INTEL X",
    gate: "Z99",
    body: [
      "Acquire your boarding pass. Seats are limited and vetted.",
      "Registration closes when the last gate shuts.",
    ],
  },
];
