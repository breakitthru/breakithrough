import { SplitCanvas } from "@/components/onboarding/split-canvas";
import { ConsentToggles } from "@/components/onboarding/consent-toggles";

export default function ConsentPage() {
  return (
    <SplitCanvas
      backHref="/welcome/program"
      leftTitle={
        <>
          Three things are
          <br />
          always true.
        </>
      }
      leftBody="These aren't settings. Nothing you choose can change them."
      bullets={[
        "Everything you write is encrypted",
        "Your data is never sold or shared",
        "No one sees your space but you",
      ]}
      quote={{
        text: "People write things here they've never said out loud. That only works if it stays theirs.",
        author: "Dr. Ananya Rao · Clinical Psychologist",
      }}
    >
      <ConsentToggles />
    </SplitCanvas>
  );
}
