import Link from "next/link";
import { X } from "@phosphor-icons/react/dist/ssr";
import { BreathePacer } from "@/components/breathe/pacer";

// Standalone (works without login, part of the SOS safety flow).
export default function BreathePage() {
  return (
    <div className="min-h-dvh bg-[var(--color-canvas)]">
      <div className="mx-auto max-w-[840px] px-6 py-6">
        <div className="flex justify-end">
          <Link
            href="/sos"
            aria-label="Close"
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            <X size={24} />
          </Link>
        </div>
        <BreathePacer />
      </div>
    </div>
  );
}
