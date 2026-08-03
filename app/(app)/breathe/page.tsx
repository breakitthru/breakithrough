import Link from "next/link";
import { X } from "@phosphor-icons/react/dist/ssr";
import { BreathePacer } from "@/components/breathe/pacer";

export default function BreathePage() {
  return (
    <div>
      <div className="flex justify-end">
        <Link
          href="/today"
          aria-label="Close"
          className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          <X size={24} />
        </Link>
      </div>
      <BreathePacer />
    </div>
  );
}
