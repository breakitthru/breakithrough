import { SplitCanvas } from "@/components/onboarding/split-canvas";
import { TrustedForm } from "@/components/onboarding/trusted-form";

// Trusted contact (D12) — one name + number, used as a tel: button inside SOS.
export default function TrustedContactPage() {
  return (
    <SplitCanvas
      backHref="/welcome/consent"
      leftTitle={
        <>
          One person,
          <br />
          one tap away.
        </>
      }
      leftBody="If a hard moment comes, we'll put them one button away inside SOS — no searching, no thinking."
      quote={{
        text: "The people who get through the worst nights usually reached for someone. This makes that easy.",
        author: "Dr. Ananya Rao · Clinical Psychologist",
      }}
    >
      <TrustedForm />
    </SplitCanvas>
  );
}
