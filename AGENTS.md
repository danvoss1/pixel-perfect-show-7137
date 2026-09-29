<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- Game content (adventure, stages, puzzles, locations, items, envelopes) lives in
  `src/game/data.ts` as mock data behind typed models in `src/game/types.ts`, so a
  real API can replace the module without touching UI code.
- Player progress lives in a single Zustand store (`src/game/store.ts`) persisted to
  localStorage; components never keep progress in local state.
- Puzzle UIs are standalone components in `src/components/puzzles/` with a
  `(config, solved, onSolved)` contract, so new puzzle types plug into
  `src/routes/puzzle.$id.tsx` by adding a branch and a type.
- The 3D room is mounted only through `src/components/game/InteractiveRoom.tsx`;
  replace that component to drop in the real Three.js scene.
- Player screens wrap in `GameShell` (bottom nav on mobile, sidebar on desktop);
  admin screens wrap in `AdminShell`.
- Animation uses `motion/react` (Motion, the Framer Motion successor).
- Visible puzzle type names use `src/game/labels.ts` while internal type IDs remain stable, so German UI copy never changes persisted game identifiers.
- Illustrated game-map pin coordinates are image pixels in `src/game/worldmap.ts`, independent of real latitude/longitude, so hotspots stay aligned with the supplied artwork while real navigation retains geographic coordinates.
