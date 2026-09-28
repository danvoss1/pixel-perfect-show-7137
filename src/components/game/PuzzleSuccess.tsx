import { AnimatePresence, motion } from "motion/react";

export function PuzzleSuccess({
  show,
  title,
  message,
  onContinue,
  continueLabel = "Weiter",
}: {
  show: boolean;
  title: string;
  message?: string;
  onContinue?: () => void;
  continueLabel?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-background/90 px-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="field-panel w-full max-w-md p-8 text-center"
            style={{ boxShadow: "var(--glow-primary)" }}
          >
            <span className="label-mono text-success">Verified</span>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-gold">{title}</h2>
            {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
            {onContinue ? (
              <button
                onClick={onContinue}
                className="mt-7 min-h-[48px] w-full rounded-md bg-primary px-6 font-display text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                {continueLabel}
              </button>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
