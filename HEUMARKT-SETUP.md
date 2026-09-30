# Heumarkt 3D / Google Maps implementation

## Admin calibration
Open `/admin/heumarkt`.

1. Control point 1 is prefilled with the equestrian statue in the 3D scene and its approximate real-world coordinate.
2. For control points 2 and 3, click a permanent real-world reference point in the 3D floor plane on the left, then the corresponding point on Google Maps on the right.
3. Once all three pairs are complete, the affine 3D↔map transform is calculated automatically.
4. The target is preset to `Heumarkt Herz` at `50.936955, 6.960379` with a 10 m radius.
5. In the triangle planner, choose A/B/C. The page shows the triangle centroid and its distance to the real target. `Punkt C automatisch vorschlagen` chooses the nearest suitable scene object to the mathematically ideal C position for the current A and B.
6. Save the calibration before playing.

## Player flow
After the `3d` feature is unlocked, `/3d` runs the three-point puzzle. Players find A, B and C in sequence. Correct selections are marked in the scene; after the third point the triangle and a heart at the centroid are rendered. `In die Gegenwart übertragen` opens the normal Google Maps view with the Heumarkt target.

## Google Maps API key
Keep your existing local `.env` file. It is deliberately not included in the distributable ZIP. The app reads:

`VITE_GOOGLE_MAPS_API_KEY=...`

## Persistence
Game progress is persisted in `hidden-path-progress` and resets with the existing Admin game reset. Heumarkt calibration is administrator configuration and is stored separately under `hidden-path-heumarkt-calibration-v1`; a game reset therefore does not erase the calibration.
