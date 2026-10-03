import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyAdminPassword } from "@/game/adminAuth";

export const Route = createFileRoute("/admin")({
  component: AdminGate,
});

function AdminGate() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [denied, setDenied] = useState(false);


  if (authorized) {
    return <Outlet />;
  }

  const submit = () => {
    if (!verifyAdminPassword(password)) {
      setDenied(true);
      window.setTimeout(() => setDenied(false), 900);
      return;
    }

    setAuthorized(true);
    setDenied(false);
  };

  return (
    <div className="topo grain min-h-screen bg-background px-4 py-12">
      <div className="mx-auto mt-[10vh] w-full max-w-md field-panel p-6">
        <div className="grid size-12 place-items-center rounded-md border border-gold/40 bg-gold/10">
          <ShieldCheck className="size-6 text-gold" />
        </div>
        <p className="label-mono mt-5 text-gold">Spielleitung</p>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase">
          Adminzugang
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Dieser Bereich ist für die Spielleitung reserviert. Das Passwort wird
          bei jedem neuen Öffnen der Spielleitung erneut verlangt.
        </p>

        <label className="mt-6 block">
          <span className="label-mono">Passwort</span>
          <div className="relative mt-2">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
              autoFocus
              autoComplete="current-password"
              className={`h-12 w-full rounded-md border bg-surface pl-10 pr-3 outline-none focus:border-primary ${
                denied ? "border-destructive" : "border-border"
              }`}
            />
          </div>
        </label>

        {denied ? (
          <p className="mt-3 text-sm text-destructive">
            Passwort nicht erkannt.
          </p>
        ) : null}

        <Button
          className="mt-5 min-h-[48px] w-full"
          disabled={!password.trim()}
          onClick={submit}
        >
          Verwaltung öffnen
        </Button>
      </div>
    </div>
  );
}
