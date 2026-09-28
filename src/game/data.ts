import type {
  Adventure,
  Envelope,
  GameLocation,
  InventoryItem,
  Puzzle,
} from "./types";

export const adventure: Adventure = {
  id: "hidden-path",
  title: "The Hidden Path",
  subtitle: "An urban expedition through Cologne.",
  description:
    "Eight stages through the city's overlooked corners. Envelopes are hidden at real locations; the rest happens here.",
  city: "Cologne",
  stages: [
    {
      id: "s1",
      number: 1,
      title: "The Message",
      kind: "Introduction",
      intro:
        "It arrived without a sender. A single sheet, a coordinate, and the instruction to start where the water bends.",
      objective: "Read the opening message and confirm you are ready to walk.",
      puzzleId: "p-code-1",
      rewardItemId: "i1",
      reward: "Folded letter",
    },
    {
      id: "s2",
      number: 2,
      title: "First Trace",
      kind: "Map location",
      intro:
        "The first marker sits where the old harbour cranes still watch the river. Something was chalked onto the stone.",
      objective: "Reach the Rheinauhafen crane houses and confirm the marker.",
      locationId: "l1",
      rewardItemId: "i2",
      reward: "Chalk symbol rubbing",
    },
    {
      id: "s3",
      number: 3,
      title: "The Envelope",
      kind: "Physical envelope",
      intro:
        "Beneath the third bench, taped where nobody looks, an envelope has been waiting for you since this morning.",
      objective: "Find Envelope #03 and enter the code printed inside.",
      locationId: "l2",
      envelopeId: "e3",
      rewardItemId: "i3",
      reward: "Torn photograph",
    },
    {
      id: "s4",
      number: 4,
      title: "Decipher",
      kind: "Word cipher",
      intro:
        "The journal pages are water damaged. Only one word survived, and it was written twelve letters long.",
      objective: "Decipher the word from the journal.",
      requiredItem: "Torn photograph",
      puzzleId: "p-wordle",
      rewardItemId: "i4",
      reward: "Code fragment A",
    },
    {
      id: "s5",
      number: 5,
      title: "The Photograph",
      kind: "Image restoration",
      intro:
        "The photograph was cut into pieces before it was hidden. Whoever did it wanted this place forgotten.",
      objective: "Restore the photograph and read what is written beneath it.",
      puzzleId: "p-sliding",
      rewardItemId: "i5",
      reward: "Map section",
    },
    {
      id: "s6",
      number: 6,
      title: "The Path",
      kind: "Navigation",
      intro:
        "No street names from here. Only bearings and paces, the way the old surveyors marked their routes.",
      objective: "Plot the route from Checkpoint A and confirm it.",
      puzzleId: "p-route",
      rewardItemId: "i6",
      reward: "Brass key",
    },
    {
      id: "s7",
      number: 7,
      title: "The Room",
      kind: "3D room",
      intro:
        "The door was unlocked. Inside, everything has been left exactly as it was — except for one thing.",
      objective: "Search the room and find what does not belong.",
      requiredItem: "Brass key",
      puzzleId: "p-room",
      rewardItemId: "i7",
      reward: "USB stick",
    },
    {
      id: "s8",
      number: 8,
      title: "The Escape",
      kind: "Final challenge",
      intro:
        "The last stretch runs above the rooftops. Keep moving, keep the line clear, and do not look down.",
      objective: "Reach 20 points on the final run to close the expedition.",
      puzzleId: "p-flappy",
      rewardItemId: "i8",
      reward: "Expedition seal",
    },
  ],
};

export const locations: GameLocation[] = [
  {
    id: "l1",
    name: "Rheinauhafen Crane Houses",
    lat: 50.9282,
    lng: 6.9631,
    radius: 60,
    distance: "1.2 km",
    x: 28,
    y: 62,
    clue: "Where three giants lean over the water, count the windows on the second.",
    requireGps: true,
  },
  {
    id: "l2",
    name: "Old Railway Bridge",
    lat: 50.9412,
    lng: 6.9694,
    radius: 50,
    distance: "840 m",
    x: 52,
    y: 38,
    clue: "Where iron crosses water, search beneath what no longer moves.",
    requireCode: true,
  },
  {
    id: "l3",
    name: "Stadtwald North Gate",
    lat: 50.9271,
    lng: 6.9012,
    radius: 80,
    distance: "3.4 km",
    x: 18,
    y: 22,
    clue: "The trail leaves the streets behind at the gate with no lamp.",
  },
  {
    id: "l4",
    name: "Checkpoint A — Water Tower",
    lat: 50.9345,
    lng: 6.9585,
    radius: 40,
    distance: "2.1 km",
    x: 70,
    y: 68,
    clue: "Start counting your paces from the tower's shadow at noon.",
  },
  {
    id: "l5",
    name: "Unmarked Door",
    lat: 50.9388,
    lng: 6.9448,
    radius: 30,
    distance: "Unknown",
    x: 84,
    y: 30,
    clue: "No number, no bell. Only a brass plate worn smooth.",
    requireQr: true,
  },
];

export const puzzles: Puzzle[] = [
  {
    id: "p-code-1",
    type: "code",
    title: "The Sealed Instruction",
    tagline: "Four digits were printed on the corner of the letter.",
    stageId: "s1",
    hints: [
      { id: "h1", label: "Hint 1", text: "The digits are in the opening letter, bottom right." },
      { id: "h2", label: "Hint 2", text: "Two of them repeat the year the harbour closed." },
      { id: "h3", label: "Final hint", text: "It begins with 4 and ends with 9." },
    ],
    config: { code: "4729", length: 4, kind: "pin" },
  },
  {
    id: "p-wordle",
    type: "wordle",
    title: "Decipher The Word",
    tagline: "The journal contained only one word.",
    stageId: "s4",
    hints: [
      { id: "h1", label: "Hint 1", text: "A place where paths disappear." },
      { id: "h2", label: "Hint 2", text: "It is a compound word, twelve letters long." },
      { id: "h3", label: "Final hint", text: "It ends in -HOUSE." },
    ],
    config: { word: "WATCHTHOUSE".padEnd(11, ""), maxAttempts: 8, clue: "A place where paths disappear." },
  },
  {
    id: "p-sliding",
    type: "sliding",
    title: "Restore The Image",
    tagline: "Someone cut this photograph apart on purpose.",
    stageId: "s5",
    hints: [
      { id: "h1", label: "Hint 1", text: "Solve the top row first, then work downwards." },
      { id: "h2", label: "Hint 2", text: "The final two tiles always rotate through the corner." },
      { id: "h3", label: "Final hint", text: "Use Preview — it costs nothing but time." },
    ],
    config: { grid: 3, image: "", reveal: "Beneath the bridge, third pillar from the bank." },
  },
  {
    id: "p-route",
    type: "route",
    title: "Plot The Route",
    tagline: "Bearings and paces, nothing else.",
    stageId: "s6",
    hints: [
      { id: "h1", label: "Hint 1", text: "The first leg runs away from the river." },
      { id: "h2", label: "Hint 2", text: "There are four legs in total." },
      { id: "h3", label: "Final hint", text: "The last leg is the shortest, heading west." },
    ],
    config: {
      start: "Checkpoint A — Water Tower",
      steps: [
        { direction: "NORTH", distance: 240 },
        { direction: "EAST", distance: 180 },
        { direction: "SOUTH", distance: 90 },
        { direction: "WEST", distance: 60 },
      ],
    },
  },
  {
    id: "p-symbols",
    type: "symbols",
    title: "The Marked Stones",
    tagline: "Three symbols, cut shallow into the wall.",
    stageId: "s6",
    hints: [
      { id: "h1", label: "Hint 1", text: "The table is complete — nothing is missing." },
      { id: "h2", label: "Hint 2", text: "The message is a single word." },
      { id: "h3", label: "Final hint", text: "It is something you walk through." },
    ],
    config: {
      table: { "△": "G", "○": "A", "◇": "T", "□": "E" },
      encoded: "□ △ △ ◇ ○",
      answer: "GATE",
    },
  },
  {
    id: "p-room",
    type: "room",
    title: "Search The Room",
    tagline: "Something here does not belong.",
    stageId: "s7",
    hints: [
      { id: "h1", label: "Hint 1", text: "Start with the desk drawer on the left." },
      { id: "h2", label: "Hint 2", text: "The clock is showing the wrong hour on purpose." },
      { id: "h3", label: "Final hint", text: "Look behind the framed map." },
    ],
    config: {},
  },
  {
    id: "p-flappy",
    type: "flappy",
    title: "Above The Rooftops",
    tagline: "Keep the line clear until the far side.",
    stageId: "s8",
    hints: [
      { id: "h1", label: "Hint 1", text: "Short taps. Long taps send you into the ceiling." },
      { id: "h2", label: "Hint 2", text: "Aim for the lower third of each gap." },
      { id: "h3", label: "Final hint", text: "Pause between gaps rather than correcting mid-flight." },
    ],
    config: { targetScore: 20, gravity: 0.45, speed: 2.4, gap: 150, icon: "compass" },
  },
];

export const envelopes: Envelope[] = [
  {
    id: "e3",
    number: 3,
    code: "NORDSTERN",
    expectedLocation: "Old Railway Bridge",
    contents:
      "A folded contact sheet with one frame circled, and a line in pencil: 'The photograph was cut for a reason.'",
  },
  {
    id: "e5",
    number: 5,
    code: "HOLZWEG",
    expectedLocation: "Unknown",
    contents: "A brass key, wrapped in wax paper, and a hand-drawn floor plan of a single room.",
  },
];

export const items: InventoryItem[] = [
  {
    id: "i1",
    number: 1,
    name: "Folded Letter",
    kind: "Document",
    foundAtStage: 1,
    description: "The message that started everything.",
    detail:
      "Typed on a machine with a damaged 'e'. Bottom right corner carries four faint digits, pressed rather than printed.",
  },
  {
    id: "i2",
    number: 2,
    name: "Chalk Rubbing",
    kind: "Symbol",
    foundAtStage: 2,
    description: "Taken from the harbour stone.",
    detail: "Three overlapping triangles, the middle one struck through. The same mark appears on the map section.",
  },
  {
    id: "i3",
    number: 3,
    name: "Torn Photograph",
    kind: "Evidence",
    foundAtStage: 3,
    description: "Half a building, half a person.",
    detail: "Taken in winter. The window frames match the crane houses, but the sky is wrong for the season.",
  },
  {
    id: "i4",
    number: 4,
    name: "Code Fragment A",
    kind: "Code fragment",
    foundAtStage: 4,
    description: "Part of a longer sequence.",
    detail: "Reads '47 — ' with the rest torn away. Pairs with a second fragment found later.",
  },
  {
    id: "i5",
    number: 5,
    name: "Map Section",
    kind: "Map",
    foundAtStage: 5,
    description: "One quadrant of a larger survey sheet.",
    detail: "Contour lines and a pencilled cross east of the water tower. No legend, no scale.",
  },
  {
    id: "i6",
    number: 6,
    name: "Brass Key",
    kind: "Key",
    foundAtStage: 6,
    description: "Worn smooth at the grip.",
    detail: "Stamped '07' on one face. Opens a door with no number.",
  },
  {
    id: "i7",
    number: 7,
    name: "USB Stick",
    kind: "Strange object",
    foundAtStage: 7,
    description: "Found taped behind a framed map.",
    detail: "A single file, timestamped two days before the letter arrived. It has not been opened yet.",
  },
  {
    id: "i8",
    number: 8,
    name: "Expedition Seal",
    kind: "Reward",
    foundAtStage: 8,
    description: "Proof the path was walked.",
    detail: "Wax, deep green, pressed with a compass rose. Issued once per completed expedition.",
  },
];

export const loadingLines = [
  "CHECKING COORDINATES...",
  "DECODING...",
  "SEARCHING ARCHIVES...",
  "VERIFYING LOCATION...",
  "PREPARING EXPEDITION...",
];

export const stageById = (id: string) => adventure.stages.find((s) => s.id === id);
export const puzzleById = (id: string) => puzzles.find((p) => p.id === id);
export const locationById = (id?: string) =>
  id ? locations.find((l) => l.id === id) : undefined;
export const itemById = (id: string) => items.find((i) => i.id === id);
export const envelopeById = (id?: string) =>
  id ? envelopes.find((e) => e.id === id) : undefined;
