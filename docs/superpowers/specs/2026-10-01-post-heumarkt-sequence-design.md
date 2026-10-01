# Post-Heumarkt Game Sequence — Design Spec

## Overview

Extends The Hidden Path with the complete game sequence following the Heumarkt 3D triangle puzzle. Players progress from the solved triangle through a physical heart find, a location riddle pointing to AI Fitness (Weißhausstraße 20–22), a bottle puzzle yielding the code TOTINO, and arrival at the Totino pizzeria.

All story text, hints, item descriptions, and puzzle configs live in `src/game/data.ts`. Components handle only rendering and logic.

---

## 1. Architecture

### Flow mapping

| Step | Where it lives | Store gate |
|------|---------------|------------|
| 1. Triangle solved | `/3d` sidebar (existing) | `heumarktTriangleSolved` |
| 2. GPS at heart tree | `/3d` sidebar phase 2 | `heumarktHeartGpsConfirmed` |
| 3. Heart physically opened | `/3d` sidebar phase 3 | `heumarktHeartOpened` |
| 4. Story fragment 04 | `/3d` sidebar phase 3 (auto) | `unlockedStoryFragments` includes `story-heumarkt-04` |
| 5. Next clue + location riddle | `/3d` sidebar phase 4 | `heumarktLocationSolved` |
| 6. Navigate to AI Fitness | `/map` + stage system | new stage `s-ai-fitness` becomes active |
| 7. GPS confirm at AI Fitness | `/map` GPS flow | `visitedLocations` includes `l-ai-fitness` |
| 8. Bottle found | stage page confirmation | `inventory` includes `meridiano-riserva-xii` |
| 9. Bottle puzzle | `/puzzle/p-bottle-sorting` | `completedPuzzles` includes `p-bottle-sorting` |
| 10. Stage complete → Totino | stage system | `completedStages` includes `s-ai-fitness` |

### Key principle

The `/3d` page handles the narrative arc (steps 1–5) as a linear phased sidebar. Once the location riddle is solved, control transfers to the standard stage/puzzle system for AI Fitness. This avoids creating a parallel flow system while keeping the "continuous adventure" feel.

---

## 2. Store extensions (`src/game/store.ts`)

### New state fields

```typescript
heumarktHeartGpsConfirmed: boolean;   // GPS confirmed at heart tree
heumarktHeartOpened: boolean;          // physical heart opened (manual confirm)
heumarktLocationSolved: boolean;       // AI Fitness identified via riddle
aiFitnessBottleFound: boolean;         // bottle physically found at AI Fitness
```

### New actions

```typescript
confirmHeumarktHeartGps: () => void;
confirmHeumarktHeartOpened: () => void;
solveHeumarktLocation: () => void;
confirmAiFitnessBottle: () => void;
```

Each action:
- Guards against duplicate calls (idempotent)
- Sets the boolean to `true`
- Adds a journal entry
- `confirmHeumarktHeartOpened` also calls `unlockStoryFragment("story-heumarkt-04")` internally

### Side effects on `solveHeumarktLocation`

When the location riddle is solved:
1. Sets `heumarktLocationSolved: true`
2. Adds journal entry "ZIEL IDENTIFIZIERT · WEISSHAUSSTRASSE 20–22"
3. If `s8` (the last original stage) is already completed: advances `currentStageId` to `s-ai-fitness`. Otherwise the location solve is recorded, and the stage transition happens automatically when the player eventually completes s8 (the `completeStage` action for s8 will advance to s-ai-fitness as the next stage in the array).
4. Adds location `l-ai-fitness` to discoverable state

### Side effects on `confirmAiFitnessBottle`

1. Sets `aiFitnessBottleFound: true`
2. Calls `addItem("meridiano-riserva-xii", "Meridiano · Riserva XII")` internally
3. Adds journal entry "OBJEKT 05 GEBORGEN"

### Migration

Bump persist version to `4`. Migration adds all new boolean fields as `false`.

---

## 3. Type extensions (`src/game/types.ts`)

### PuzzleType

Add `"sorting"` to the union:

```typescript
export type PuzzleType =
  | "wordle" | "sliding" | "flappy" | "code" | "route"
  | "symbols" | "room" | "evidence" | "mastermind" | "simon"
  | "morse" | "minesweeper" | "circuit" | "geometry"
  | "sorting";
```

### SortingConfig

```typescript
export interface SortingConfig {
  items: { label: string; order: number }[];
  tagline: string;
  solution: string;
}
```

Add `SortingConfig` to the `Puzzle.config` union.

### InventoryItem extensions

Add optional fields:

```typescript
export interface InventoryItem {
  // ... existing fields ...
  tags?: string[];
  used?: boolean;
  damaged?: boolean;
  destroyed?: boolean;
  hiddenDetailUnlocked?: boolean;
}
```

These fields exist in the type for future use. Only `tags` and `used` are actively used in this feature. The UI does not display `used`/`damaged`/`destroyed`/`hiddenDetailUnlocked` yet — they're structural preparation.

### CodeConfig extension

Add support for multiple accepted answers:

```typescript
export interface CodeConfig {
  code: string;        // single answer OR pipe-separated: "AI FITNESS|FITNESS|ALL INCLUSIVE FITNESS"
  // ... rest unchanged
}
```

No type change needed — `code` is already `string`. The change is in `CodeInput.tsx` behavior.

---

## 4. Data definitions (`src/game/data.ts`)

### Story fragment

```typescript
{
  id: "story-heumarkt-04",
  title: "Notiz 04",
  text: "Ich kenne jetzt ihren Namen.\nLAS PAJITAS DEL PIJAMA\nXII war kein Zufall.\nDer Dodekaeder war ihre Signatur.\nAber ich weiß noch immer nicht, was sie mit dem Meridian meinen.\n— M.",
  author: "M.",
  archiveCode: "XII",
  stageId: "heumarkt",
}
```

### New item: heart-key

```typescript
{
  id: "heart-key",
  number: 9,
  name: "Herzschlüssel",
  kind: "Schlüssel",
  category: "Schlüssel",
  foundAtStage: 3,
  description: "Ein kleiner Schlüssel in Herzform.",
  detail: "Wurde am Pantaleonswall in einer Chipstüte gefunden. Passt offenbar zu einem bestimmten Schloss.",
  physical: true,
  consumable: false,
  tags: ["physical", "heart", "reusable"],
}
```

Note: The heart-key was physically found at Pantaleonswall earlier in the real-world game. It needs to be in the app inventory before the Heumarkt heart phase. Two options: (a) grant it automatically when stage s3 or s6 completes (the stage that visits the Pantaleonswall area), or (b) add it as a starting inventory item. The simplest approach: grant it as a reward when completing stage s6 ("Der Pfad") alongside the existing `i6` brass key — both keys are found in the same expedition phase. This can be adjusted later via the `rewardItemId` field or by adding a second reward to s6.

### New item: meridiano-riserva-xii

```typescript
{
  id: "meridiano-riserva-xii",
  number: 10,
  name: "Meridiano · Riserva XII",
  kind: "Flasche",
  category: "Quest-Gegenstand",
  foundAtStage: 9,       // AI Fitness stage number
  description: "Eine italienisch wirkende Flasche mit einem ungewöhnlichen Sonderetikett.",
  detail: "Das Label trägt die Bezeichnung „Meridiano · Riserva XII". Mehrere Begriffe auf der Rückseite scheinen absichtlich angeordnet worden zu sein.",
  physical: true,
  consumable: false,
  tags: ["physical", "meridian", "xii", "reusable"],
  requiredLater: true,
}
```

### New location

```typescript
{
  id: "l-ai-fitness",
  name: "Weißhausstraße 20–22",
  lat: 50.9198,     // approximate — admin can adjust
  lng: 6.9283,      // approximate — admin can adjust
  radius: 30,
  distance: "~3 km",
  x: 25,            // world map pixel position — adjust to artwork
  y: 70,
  clue: "Körper werden dort geprüft, wo Wiederholungen gezählt werden.",
  description: "Ein Ort, an dem Belastung zum Programm gehört.",
  stageId: "s-ai-fitness",
  kind: "checkpoint",
  requireGps: true,
}
```

### New stages

**Stage: AI Fitness** (inserted after current s8 or at appropriate position)

```typescript
{
  id: "s-ai-fitness",
  number: 9,
  title: "Die Belastung",
  kind: "Feld & Rätsel",
  intro: "Die nächste Spur wurde lokalisiert. An der Weißhausstraße wartet ein Objekt.",
  objective: "Findet den hinterlegten Gegenstand und entschlüsselt seine Botschaft.",
  locationId: "l-ai-fitness",
  puzzleId: "p-bottle-sorting",
  rewardItemId: "meridiano-riserva-xii",
  reward: "Code: TOTINO",
}
```

**Stage: Totino** (next after AI Fitness)

```typescript
{
  id: "s-totino",
  number: 10,
  title: "Totino",
  kind: "Versorgungsstation",
  intro: "Die nächste Spur führt nicht zu einem weiteren Archiv. Sie führt zu einer Pause.",
  objective: "Erreicht die Pizzeria.",
  reward: "Pause",
}
```

### New puzzle: location riddle (on `/3d` page, not in puzzle route)

This is NOT registered as a standard puzzle in the puzzles array because it lives inline on the `/3d` page. Its config is stored in data.ts as a standalone export:

```typescript
export const heumarktLocationRiddle = {
  acceptedAnswers: [
    "AI FITNESS",
    "ALL INCLUSIVE FITNESS",
    "ALL INCLUSIVE FITNESS KÖLN",
    "ALL INCLUSIVE FITNESS KÖLN SÜLZ",
    "FITNESS",
  ],
  hints: [
    {
      id: "h1",
      label: "Hinweis 1",
      text: "„Belastung" und „Wiederholungen" sind wörtlicher gemeint, als es zunächst scheint.",
    },
    {
      id: "h2",
      label: "Hinweis 2",
      text: "WEISS ist kein Zustand. Es ist der Beginn eines Straßennamens.",
    },
    {
      id: "h3",
      label: "Hinweis 3",
      text: "Gesucht wird ein Fitnessstudio in der Weißhausstraße mit der Hausnummer 20–22.",
    },
  ],
  protocolCard: {
    title: "VERSUCH 05 — BELASTUNG",
    fields: [
      { label: "SUBJECT", value: "05" },
      { label: "CATEGORY", value: "LOAD" },
      { label: "REPETITIONS", value: "XII" },
      { label: "LOCATION", value: "WEISS" },
      { label: "UNIT", value: "20–22" },
    ],
  },
};
```

### New puzzle: bottle sorting

```typescript
{
  id: "p-bottle-sorting",
  type: "sorting",
  title: "Meridiano · Riserva XII",
  tagline: "L'ordine cambia tutto.",
  stageId: "s-ai-fitness",
  hints: [
    { id: "h1", label: "Hinweis 1", text: "Die Wörter selbst müssen nicht übersetzt werden." },
    { id: "h2", label: "Hinweis 2", text: "Die kleinen Zahlen geben eine Reihenfolge vor." },
    { id: "h3", label: "Hinweis 3", text: "Sortiert nach ① bis ⑥ und lest anschließend die Anfangsbuchstaben." },
  ],
  config: {
    items: [
      { label: "Nocciola", order: 5 },
      { label: "Timo", order: 3 },
      { label: "Origano", order: 6 },
      { label: "Tartufo", order: 1 },
      { label: "Iris", order: 4 },
      { label: "Oliva", order: 2 },
    ],
    tagline: "L'ordine cambia tutto.",
    solution: "TOTINO",
  },
}
```

---

## 5. `/3d` page phased flow (`src/routes/3d.tsx`)

The existing solved-state sidebar is replaced with a phased progression. Each phase is a `motion.div` with enter/exit animations. Only the current phase and completed phases are visible.

### Phase 1: Triangle solved (existing, modified)

Shows "Rekonstruktion vollständig" heading. Shows the "In die Gegenwart übertragen" button to toggle Google Maps. When Google Maps is shown, adds a GPS confirm button below it.

### Phase 2: GPS confirmed → physical find

Heading: **PHYSISCHER FUND ERFORDERLICH**

Text: "Der berechnete Punkt ist erreicht. Sucht an dieser Stelle nach dem Zeichen, das euch bereits früher begegnet ist."

Subtext: "Ein Gegenstand aus eurem bisherigen Inventar könnte hier erneut relevant werden."

Small ghost button: **INVENTAR ÖFFNEN** → links to `/inventory`

Large primary button: **DAS HERZ WURDE GEÖFFNET** → triggers phase 3

### Phase 3: Heart opened → story fragment

Animated reveal of the story fragment as a "found document":
- Parchment-style card with `bg-paper/10` and `border-gold/30`
- Heading: **ARCHIVFRAGMENT GEBORGEN**
- Label: `label-mono` "NOTIZ 04"
- Body in `font-hand` (handwriting style), rendered as the story text
- Author line: "— M."

This fragment is auto-saved to journal via `unlockStoryFragment("story-heumarkt-04")`.

After a short delay or scroll, phase 4 appears below.

### Phase 4: Next clue + location riddle

**Protocol card** — visually distinct from M.'s handwriting. Styled as a clinical test protocol:
- Monospace/label font
- Dark border, charcoal background
- Title: **NÄCHSTE SPUR**
- Subtitle in `label-mono`: "VERSUCH 05 — BELASTUNG"
- Fields rendered as key-value rows: SUBJECT, CATEGORY, REPETITIONS, LOCATION, UNIT

Below the card: **ORT BESTIMMEN** heading with a text input field.
- Placeholder: "Name eingeben …"
- Case-insensitive comparison against `heumarktLocationRiddle.acceptedAnswers`
- On correct: text input turns green, shows "ZIEL IDENTIFIZIERT · WEISSHAUSSTRASSE 20–22"
- Button: **NAVIGATION ÖFFNEN** → calls `solveHeumarktLocation()` and links to `/map`

**Hints** for the location riddle use the existing `HintPanel` component with a synthetic puzzle ID `"heumarkt-location"` for the hint key prefix.

### Phase 5: Location solved (compact summary)

After `heumarktLocationSolved` is true, phases 2–4 collapse into a compact summary:
- "Herz geöffnet ✓"
- "Notiz 04 geborgen ✓"  
- "Ziel identifiziert: Weißhausstraße 20–22 ✓"
- **WEITER ZUR EXPEDITION** button → `/adventure`

---

## 6. `CodeInput` multi-answer support

Change the comparison in `CodeInput.tsx`:

```typescript
// Before:
value.trim().toUpperCase() === expected.toUpperCase()

// After:
expected.split("|").some(answer => value.trim().toUpperCase() === answer.trim().toUpperCase())
```

This is backward-compatible — single-answer codes have no `|` and behave identically.

Note: The location riddle on `/3d` does NOT use `CodeInput` from the puzzle system. It uses its own inline text input with the same multi-answer logic, reading from `heumarktLocationRiddle.acceptedAnswers`. The `CodeInput` change is a general improvement for future use.

---

## 7. Sorting puzzle component (`src/components/puzzles/SortingPuzzle.tsx`)

### Props

```typescript
{
  config: SortingConfig;
  solved: boolean;
  onSolved: () => void;
}
```

### Behavior

1. Display items as draggable cards in their initial (shuffled) order
2. Each card shows: `label` and a circled number (①②③ etc.) matching `order`
3. Drag-and-drop reordering (desktop: native drag, mobile: touch with vertical sorting)
4. Alternative: tap a card to select it, then tap another position to swap (mobile fallback)
5. A "Prüfen" button checks order
6. On correct order: animated letter-by-letter reveal of `solution`
   - First letters appear one by one: T → TO → TOT → TOTI → TOTIN → TOTINO
   - Then: **CODE IDENTIFIZIERT** heading with the full solution
   - Calls `onSolved()`
7. On incorrect order: cards briefly flash red, reset to current positions

### Implementation approach

Use a simple array state with index-based reordering. For touch:
- `onPointerDown` starts drag tracking
- `onPointerMove` translates the card and determines insertion point
- `onPointerUp` finalizes position

Or use a tested library like `@dnd-kit/core` if already in deps. Check first.

### Styling

- Cards: `bg-background/60 border-border` with `font-display` for labels
- Numbers: circled unicode numerals (①②③④⑤⑥) in `text-muted-foreground`
- Selected card: `border-primary ring-2 ring-primary/30`
- Correct state: cards in `border-success bg-success/10`
- Letter reveal: `font-display text-4xl text-primary` with staggered `motion` animation

---

## 8. AI Fitness stage flow

Once the location riddle is solved and `s-ai-fitness` becomes the active stage:

### Stage page (`/stage/s-ai-fitness`)

Standard stage page shows:
- Title: "Die Belastung"
- Intro text
- Location link to `/map` for navigation
- GPS confirmation at the location

### After GPS confirm at AI Fitness

The stage page shows a new section (same pattern as existing stage completion):

Heading: **OBJEKT 05**
Text: "An diesem Ort wurde etwas für euch hinterlegt. Untersucht nicht nur den Inhalt. Untersucht die Verpackung."

Button: **OBJEKT GEFUNDEN** → calls `confirmAiFitnessBottle()` → adds item to inventory, then navigates to `/puzzle/p-bottle-sorting`

### After bottle puzzle solved

Standard puzzle success flow: `solvePuzzle("p-bottle-sorting", "Meridiano · Riserva XII")` → shows success modal with:

Heading: **VERSORGUNGSSTATION IDENTIFIZIERT**
Subtitle: **TOTINO**
Text: "Die nächste Spur führt nicht zu einem weiteren Archiv. Sie führt zu einer Pause."

Continue → `completeStage("s-ai-fitness")` → advances to `s-totino`

---

## 9. Puzzle route dispatch

Add to `puzzle.$id.tsx`:

```typescript
if (puzzle.type === "sorting") {
  return <SortingPuzzle config={puzzle.config as SortingConfig} solved={solved} onSolved={onSolved} />;
}
```

Add to `labels.ts`:

```typescript
sorting: "Sortierrätsel",
```

---

## 10. Inventory display

The existing inventory route and item detail route handle the new items without changes — they already read from `data.ts` and filter by owned IDs. The `tags`, `used`, and other new fields are stored in the data but not rendered in the current UI.

The `heart-key` item should show `physical: true` which triggers the "keep the real-world object" hint in the item detail view.

---

## 11. Admin compatibility

- **Stage management**: New stages appear in admin stage list automatically (they're in `adventure.stages`)
- **Puzzle management**: New puzzle appears in admin puzzles
- **Item management**: New items appear in admin items
- **Reset**: Full reset clears all new boolean fields (migration handles defaults)
- **Manual advance**: `advanceStage()` works for the new stages
- **Reset puzzle**: `resetPuzzle("p-bottle-sorting")` works
- **New admin resets needed**: Add buttons to reset `heumarktHeartGpsConfirmed`, `heumarktHeartOpened`, `heumarktLocationSolved`, `aiFitnessBottleFound` in the admin settings or admin index page

---

## 12. Animation and transitions

All phase transitions on `/3d` use `motion/react`:
- `initial={{ opacity: 0, y: 20 }}`
- `animate={{ opacity: 1, y: 0 }}`
- Staggered timing via `transition={{ delay: 0.2 }}`

The story fragment reveal uses a fade-in with slight scale:
- `initial={{ opacity: 0, scale: 0.96 }}`
- `animate={{ opacity: 1, scale: 1 }}`

The protocol card (Versuch 05) uses a different animation to distinguish it from handwriting:
- Slide in from left: `initial={{ opacity: 0, x: -16 }}`

The letter reveal in the sorting puzzle uses staggered children:
- Each letter fades in with 200ms delay between them

---

## 13. Files to create

| File | Purpose |
|------|---------|
| `src/components/puzzles/SortingPuzzle.tsx` | Drag-and-drop sorting puzzle component |

## 14. Files to modify

| File | Changes |
|------|---------|
| `src/game/types.ts` | Add `"sorting"` to PuzzleType, add SortingConfig, extend InventoryItem with tags/used/damaged/destroyed/hiddenDetailUnlocked |
| `src/game/labels.ts` | Add `sorting: "Sortierrätsel"` |
| `src/game/data.ts` | Add story fragment, 2 items, 1 location, 2 stages, 1 puzzle, location riddle config export |
| `src/game/store.ts` | Add 4 boolean fields, 4 actions, bump migration to v4 |
| `src/routes/3d.tsx` | Replace solved sidebar with phased flow (5 phases) |
| `src/routes/puzzle.$id.tsx` | Add sorting type dispatch |
| `src/routes/stage.$id.tsx` | Add bottle-found confirmation UI for AI Fitness stage |
| `src/components/puzzles/CodeInput.tsx` | Support pipe-separated multi-answer matching |
| `src/routes/admin.index.tsx` | Add reset buttons for new boolean fields |

---

## 15. Progression enforcement

The linear progression is enforced by store gates:
1. `/3d` page checks `heumarktTriangleSolved` → shows nothing until true
2. GPS phase requires `heumarktTriangleSolved && !heumarktHeartGpsConfirmed`
3. Physical find requires `heumarktHeartGpsConfirmed && !heumarktHeartOpened`
4. Location riddle requires `heumarktHeartOpened && !heumarktLocationSolved`
5. AI Fitness stage requires `heumarktLocationSolved` (stage becomes `currentStageId`)
6. Bottle find requires `visitedLocations.includes("l-ai-fitness")`
7. Bottle puzzle requires `aiFitnessBottleFound`
8. Completion uses standard `completeStage` flow

Admin bypasses: `advanceStage()` skips to any stage. Individual boolean resets available in admin.
