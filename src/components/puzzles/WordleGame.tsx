import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Label } from "../game/primitives";

type Mark = "correct" | "present" | "absent";

function score(guess: string, word: string): Mark[] {
  const res: Mark[] = Array(word.length).fill("absent");
  const pool = word.split("");
  guess.split("").forEach((c, i) => {
    if (c === word[i]) {
      res[i] = "correct";
      pool[i] = "";
    }
  });
  guess.split("").forEach((c, i) => {
    if (res[i] === "correct") return;
    const idx = pool.findIndex((p) => p === c);
    if (idx > -1) {
      res[i] = "present";
      pool[idx] = "";
    }
  });
  return res;
}

const rows = [
  "QWERTZUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["ENTER", ..."YXCVBNM".split(""), "DEL"],
];

export function WordleGame({
  word,
  maxAttempts,
  clue,
  onSolved,
  solved,
}: {
  word: string;
  maxAttempts: number;
  clue: string;
  onSolved: () => void;
  solved: boolean;
}) {
  const target = word.toUpperCase();
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [invalid, setInvalid] = useState(false);
  const done = solved || guesses.includes(target) || guesses.length >= maxAttempts;

  const press = useCallback(
    (key: string) => {
      if (done) return;
      if (key === "DEL") return setCurrent((c) => c.slice(0, -1));
      if (key === "ENTER") {
        if (current.length !== target.length) {
          setInvalid(true);
          setTimeout(() => setInvalid(false), 500);
          return;
        }
        setGuesses((g) => [...g, current]);
        if (current === target) onSolved();
        setCurrent("");
        return;
      }
      if (/^[A-Z]$/.test(key)) setCurrent((c) => (c.length < target.length ? c + key : c));
    },
    [current, done, onSolved, target],
  );

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === "BACKSPACE") press("DEL");
      else if (k === "ENTER") press("ENTER");
      else if (/^[A-Z]$/.test(k)) press(k);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [press]);

  const used: Record<string, Mark> = {};
  guesses.forEach((g) => {
    score(g, target).forEach((m, i) => {
      const c = g[i];
      if (!c) return;
      if (m === "correct" || (m === "present" && used[c] !== "correct") || !used[c]) used[c] = m;
    });
  });

  const markClass = (m?: Mark) =>
    m === "correct"
      ? "border-success/60 bg-success/25 text-foreground"
      : m === "present"
        ? "border-gold/60 bg-gold/20 text-foreground"
        : m === "absent"
          ? "border-border bg-background/30 text-muted-foreground"
          : "border-border bg-background/50";

  return (
    <div className="space-y-5">
      <div className="field-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>
            Wortlänge {target.length} · Versuche {guesses.length}/{maxAttempts}
          </Label>
          <span className="text-xs text-muted-foreground">Erster Hinweis: {clue}</span>
        </div>

        <div className={invalid ? "shake mt-4 space-y-1.5" : "mt-4 space-y-1.5"}>
          {Array.from({ length: maxAttempts }).map((_, r) => {
            const guess = guesses[r];
            const isCurrent = r === guesses.length && !done;
            const marks = guess ? score(guess, target) : [];
            return (
              <div key={r} className="flex gap-1">
                {Array.from({ length: target.length }).map((__, c) => {
                  const letter = guess ? guess[c] : isCurrent ? (current[c] ?? "") : "";
                  return (
                    <motion.div
                      key={c}
                      initial={false}
                      animate={guess ? { rotateX: [0, 90, 0] } : {}}
                      transition={{ duration: 0.4, delay: c * 0.05 }}
                      className={`grid aspect-square min-w-0 flex-1 place-items-center rounded-[4px] border font-display text-[clamp(10px,2.6vw,18px)] font-bold uppercase ${markClass(
                        guess ? marks[c] : undefined,
                      )}`}
                    >
                      {letter}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map((k) => (
              <button
                key={k}
                onClick={() => press(k)}
                className={`min-h-[48px] flex-1 rounded-[4px] border px-1 font-display text-xs font-semibold uppercase ${
                  k.length > 1 ? "max-w-[68px] text-[10px]" : "max-w-[42px]"
                } ${markClass(used[k])}`}
              >
                {k === "DEL" ? "⌫" : k === "ENTER" ? "OK" : k}
              </button>
            ))}
          </div>
        ))}
      </div>

      {done && !guesses.includes(target) && !solved ? (
        <p className="text-center text-sm text-destructive">
          Alle Versuche sind verbraucht. Lade die Seite neu, um es erneut zu versuchen.
        </p>
      ) : null}
    </div>
  );
}
