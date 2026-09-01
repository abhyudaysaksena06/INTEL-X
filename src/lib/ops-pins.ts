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
      "ROUND 1 — INTELLIGENCE INTAKE",
      "Teams investigate suspicious people, cargo movements, financial activity and digital traces across multiple international airports.",
      "They connect fragmented intelligence to identify which locations and operations are genuinely connected and which are false leads. The round establishes the first picture of the network.",
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
      "ROUND 2 — FIELD OPERATIONS",
      "Teams use their collected intelligence to investigate specific airport hubs and follow the operational trail.",
      "Through physical matching, filtering, reconstruction and verification challenges, they uncover how the network operates and where its next move may occur. Resources and evidence must be managed carefully.",
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
      "ROUND 3 — FINAL INTERCEPTION",
      "Teams enter the command phase with the intelligence gathered from the previous rounds.",
      "They interrogate witnesses, uncover historical evidence and analyze final forensic clues to identify the person behind the operation. The round ends with a high-stakes evidence-backed final decision.",
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
      "ROUND 1 — THE BRIEF",
      "1. Teams must consist of 4 members.",
      "2. The round will have 3 stations, with 2 teams competing at each station.",
      "3. Teams will receive a dossier containing clues and information.",
      "4. A questionnaire/task will be provided based on the dossier.",
      "5. Each game carries 20 points.",
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
      "ROUND 2 — THE HUNT",
      "1. Each team starts with 100 credits.",
      "2. Credits can be used to purchase dossiers and additional information.",
      "3. Teams can investigate multiple locations.",
      "4. Each location will have a different game/challenge.",
      "5. Teams will encounter multiple suspects.",
      "6. Different types of dossiers may be available, including Bluff, Good and Normal dossiers.",
      "7. Scores will be added to the live leaderboard.",
      "8. The top teams will qualify for Round 3.",
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
      "ROUND 3 — THE FINAL ESCAPE",
      "1. The round consists of two phases: Code Breaking and Interrogation.",
      "2. In Code Breaking, teams solve offline games and challenges to collect clues/code components and combine them to find the final code.",
      "3. Teams must enter the final code on the designated website, and points earned will be added.",
      "4. In Interrogation, teams will analyse information about a few suspected passengers, along with clues, to identify the correct suspect and escape route.",
      "5. Teams must complete the final questionnaire within the last 15 minutes; correct answers will earn the designated points.",
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
