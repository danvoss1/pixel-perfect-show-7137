# Kunstgeschichte · finale Version v18

## Physischer Sixpack

Auf dem Karton stehen bei den sechs Kunstwerken **keine Buchstaben**.

Jedes Werk erhält nur eine kleine, unauffällige Archivzahl:

- Botticelli · Die Geburt der Venus → 23
- Leonardo da Vinci · Mona Lisa → 1
- Diego Velázquez · Las Meninas → 7
- Johannes Vermeer · Mädchen mit dem Perlenohrring → 14
- Vincent van Gogh · Sternennacht → 5
- Pablo Picasso · Guernica → 18

Auf **Guernica**, dem letzten Werk der korrekten Chronologie, steht zusätzlich klein unten rechts:

`55`

Die 55 ist unabhängig von der Archivzahl 18 und sollte optisch wie ein kleiner Inventar-/Depotmarker wirken.

---

## Phase 1 — Katalogisierung

Die Spieler sehen physisch nur die Werke.

In der App ordnen sie jedem Werk zu:
- Künstler
- Entstehungsjahr

Korrekte Zuordnung:

1. Die Geburt der Venus — Sandro Botticelli — ca. 1485
2. Mona Lisa — Leonardo da Vinci — ca. 1503
3. Las Meninas — Diego Velázquez — 1656
4. Mädchen mit dem Perlenohrring — Johannes Vermeer — ca. 1665
5. Sternennacht — Vincent van Gogh — 1889
6. Guernica — Pablo Picasso — 1937

Es gibt nur eine Gesamtprüfung. Einzelne Fehler werden nicht markiert.

---

## Phase 2 — Chronologie

Die sechs korrekt identifizierten Werke müssen vom ältesten zum jüngsten sortiert werden.

Korrekte Reihenfolge:

Botticelli → Leonardo → Velázquez → Vermeer → Van Gogh → Picasso

Erst nach erfolgreicher Chronologie werden die Archivzahlen relevant.

---

## Phase 3A — Archivzahlen übertragen

Die App zeigt die sechs Zahlen **nicht automatisch** an.

Die Spieler müssen zum physischen Sixpack zurückgehen und die kleinen Archivzahlen der Kunstwerke in ihrer zuvor rekonstruierten chronologischen Reihenfolge selbst eingeben.

Korrekte Eingabe:

`23 · 1 · 7 · 14 · 5 · 18`

Die sechs Eingaben werden erst gemeinsam geprüft. Es wird bei einer falschen Sequenz nicht verraten, welche einzelne Zahl falsch ist.

---

## Phase 3B — Übersetzung

Erst nach korrekt übertragenen Archivzahlen zeigt die App die bestätigte Sequenz an.

Hinweis:

`Nicht Morse Code oder Blindenschrift. Übersetzt werden muss es trotzdem.`

Letzter Hinweis:

`Das einfachste Alphabet beginnt bei A = 1.`

Alphabetische Umsetzung:

- 23 = W
- 1 = A
- 7 = G
- 14 = N
- 5 = E
- 18 = R

Lösung:

`WAGNER`

Die App verlangt die Eingabe des Wortes und zeigt die Buchstaben vorher nicht an.

---

## Finaler Marker

Nach richtiger Eingabe von `WAGNER` verlangt die App:

`Auf dem letzten Werk der korrekten Chronologie befindet sich unten rechts eine zusätzliche kleine Zahl.`

Auf Guernica steht:

`55`

Nach Eingabe von `55`:

`RICHARD-WAGNER-STRASSE 55`

Erst jetzt gilt die Stage als vollständig gelöst und die nächste Etappe wird freigeschaltet.

---

## Anti-Bruteforce

- Keine Einzelbewertung in Phase 1
- Keine Anzeige falscher Positionen in Phase 2
- Freitexteingabe für WAGNER
- separate Eingabe der 55
- nach jeweils drei Fehlversuchen pro Phase 12 Sekunden Cooldown
