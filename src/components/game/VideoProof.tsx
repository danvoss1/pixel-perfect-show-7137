import { useEffect, useRef, useState } from "react";
import { Video, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoProof({ onConfirm }: { onConfirm: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const camera = useRef<HTMLInputElement>(null);
  const library = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <div className="space-y-3">
    <p className="text-xs text-muted-foreground">Lade nur Aufnahmen hoch, mit deren Weitergabe alle sichtbaren Personen einverstanden sind. Diese Vorschau bleibt auf deinem Gerät; es wird nichts hochgeladen.</p>
    <input ref={camera} type="file" accept="video/*" capture="environment" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" aria-label="Video aufnehmen" />
    <input ref={library} type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" aria-label="Video aus Mediathek auswählen" />
    {preview ? <video controls src={preview} className="aspect-video w-full rounded-md bg-background" aria-label="Videovorschau" /> : null}
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => camera.current?.click()} className="min-h-[44px] gap-2"><Video className="size-4" /> Video aufnehmen</Button>
      <Button variant="outline" onClick={() => library.current?.click()} className="min-h-[44px]">Aus Mediathek auswählen</Button>
      {file && <><Button variant="outline" onClick={() => setFile(null)} className="min-h-[44px] gap-2"><RotateCcw className="size-4" /> Erneut aufnehmen</Button><Button onClick={onConfirm} className="min-h-[44px] gap-2"><Check className="size-4" /> Video verwenden</Button></>}
    </div>
  </div>;
}