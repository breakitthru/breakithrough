"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadSimple, Trash } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { setBrandLogo } from "@/lib/admin-settings-actions";

const MAX_BYTES = 500 * 1024; // 500 KB — keeps us under the server action body limit

export function LogoManager({ logoUrl, logoSize }: { logoUrl: string; logoSize: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [url, setUrl] = useState(logoUrl);
  const [size, setSize] = useState(logoSize);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = url !== logoUrl || size !== logoSize;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setSaved(false);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is over 500 KB. Please choose a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setUrl(reader.result as string);
    reader.onerror = () => setError("Couldn't read that file. Try another.");
    reader.readAsDataURL(file);
  };

  const save = () =>
    start(async () => {
      setError(null);
      setSaved(false);
      const res = await setBrandLogo(url || null, size);
      if (!res.ok) { setError(res.error); return; }
      setSaved(true);
      router.refresh();
    });

  const remove = () =>
    start(async () => {
      setError(null);
      setSaved(false);
      const res = await setBrandLogo(null, size);
      if (!res.ok) { setError(res.error); return; }
      setUrl("");
      setSaved(true);
      router.refresh();
    });

  const box = (
    <div className="flex h-12 w-24 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-white/25 text-sm text-white/50">
      Logo
    </div>
  );

  return (
    <Card className="max-w-xl p-6">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      {/* Preview on the dark shell where the logo actually appears */}
      <p className="eyebrow mb-1.5">Preview</p>
      <div className="flex items-center gap-4 rounded-[var(--radius-md)] bg-[var(--color-brand-ink)] p-5">
        <BrandLogo logoUrl={url} logoSize={size} fallback={box} alt="Logo preview" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" variant="primary" onClick={() => inputRef.current?.click()} disabled={pending}>
          <UploadSimple size={16} /> {url ? "Replace image" : "Upload an image"}
        </Button>
        {url && (
          <Button size="sm" variant="outline" onClick={remove} disabled={pending}>
            <Trash size={16} /> Remove
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
        PNG, JPG, WEBP, GIF or SVG, up to 500 KB. A transparent PNG or SVG looks best on the dark sidebar.
      </p>

      {/* Size */}
      <label className="mt-6 block">
        <span className="eyebrow mb-1.5 block">Logo height · {size}px</span>
        <input
          type="range"
          min={16}
          max={120}
          value={size}
          onChange={(e) => { setSize(Number(e.target.value)); setSaved(false); }}
          className="w-full accent-[var(--color-accent)]"
        />
      </label>

      {error && <p className="mt-3 text-sm text-[var(--color-crisis)]">{error}</p>}
      <div className="mt-5 flex items-center gap-3">
        <Button size="sm" variant="primary" onClick={save} disabled={pending || !dirty}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {saved && !pending && <span className="text-sm text-[var(--color-success)]">Saved.</span>}
      </div>
    </Card>
  );
}
