# COI · Probe ZUE-07 — v16 Lösung & Spielablauf

## Ziel
10–15 Minuten Spielzeit für Biologie-Bachelor / Laborerfahrene.

Die Fachlogik der v15 bleibt erhalten, aber Multiple Choice wurde fast vollständig entfernt.
Die Spieler müssen jetzt Daten **klassifizieren, Sequenzen selbst eingeben, Reads ausrichten,
einen Konsensus schreiben und diagnostische Basen selbst extrahieren**.

---

## Phase 1 — Qualitätskontrolle

Grenzwerte:
- mittlere Phred-Qualität: >= 25
- ambige Basen: <= 5 %

Korrekte Klassifikation:

- FWD-01 → KEEP
- REV-02 → KEEP
- FWD-03 → DISCARD
- FWD-04 → KEEP

Korrekte Begründungen für FWD-03:
- mittlere Phred-Qualität zu niedrig
- zu hoher Anteil ambiger Basen

Nicht korrekt:
- falsche Leserichtung
- Sequenz zu kurz

Die App prüft die gesamte Einreichung auf einmal.
Es gibt kein Feedback dazu, welcher einzelne Read falsch klassifiziert wurde.

---

## Phase 2 — Reverse Complement

Rohread:

`5′-TCCAAAAGCTGGAACTAATCCAGCTCCATAAC-3′`

Korrekte Eingabe:

`GTTATGGAGCTGGATTAGTTCCAGCTTTTGGA`

Leerzeichen sowie 5′/3′-Zeichen werden ignoriert.

Die App verrät bei Fehlern keine einzelne falsche Base.

---

## Phase 3 — Alignment + Konsensus

Forward:

`ATGGCTTTTGGATTTGGTTATGGAGCNGGATT`

Reverse Complement:

`GTTATGGAGCTGGATTAGTTCCAGCTTTTGGA`

Korrekte Verschiebung:

`Offset +16`

Vollständiger korrekter Konsensus:

`ATGGCTTTTGGATTTGGTTATGGAGCTGGATTAGTTCCAGCTTTTGGA`

Die ambige Forward-Position wird dadurch zu T aufgelöst.

Spielmechanik:
- Reverse-Read mit Pfeiltasten nach links/rechts verschieben
- keine Live-Markierung von Match/Mismatch
- vollständigen Konsensus selbst eintippen
- Offset + Konsensus werden gemeinsam geprüft

---

## Phase 4 — Taxonomische Zuordnung

Diagnostische Positionen:

`10 / 18 / 24 / 31 / 40 / 45`

Korrektes Probenprofil:

`G / T / A / T / G / T`

Die Spieler müssen jede Base selbst aus dem Konsensus auslesen und in einzelne Felder schreiben.

Korrekte Referenz:

`Morphospezies C`

Akzeptiert werden außerdem:
- `C`
- `ref-c`

Die Referenztabelle bleibt sichtbar, aber keine Zeile ist anklickbar.

---

## Abschluss

Laboretikett:

`ZUE-LP40`

Auflösung:

`ZÜLPICHER STRASSE 40`

Damit führt das Spiel zum Kiosk.

---

## Anti-Bruteforce

Jede Phase wird nur als komplette Einreichung geprüft.

Nach jeweils drei Fehlversuchen innerhalb derselben Phase:
- 12 Sekunden Cooldown
- keine weitere Prüfung während des Cooldowns
- keine Einzelposition oder Teilantwort wird verraten

Damit lässt sich das Puzzle nicht sinnvoll durch schnelles Durchklicken lösen.
