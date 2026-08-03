import { SplitCanvas } from "@/components/onboarding/split-canvas";
import { WhyForm } from "@/components/onboarding/why-form";

// "Why I started" (D13) — read back to the user inside the SOS flow.
export default function WhyPage() {
  return (
    <SplitCanvas
      backHref="/welcome/trusted-contact"
      leftTitle={
        <>
          Why did you
          <br />
          start?
        </>
      }
      leftBody="On a hard night, we'll show these words back to you — in your own voice, from today."
      quote={{
        text: "The version of you writing this is the one worth listening to at 2am.",
        author: "Dr. Ananya Rao · Clinical Psychologist",
      }}
    >
      <WhyForm />
    </SplitCanvas>
  );
}
