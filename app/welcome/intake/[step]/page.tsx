import { notFound } from "next/navigation";
import { SplitCanvas } from "@/components/onboarding/split-canvas";
import { IntakeForm } from "@/components/onboarding/intake-form";
import { INTAKE_QUESTIONS } from "@/lib/onboarding";

export default async function IntakeStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const n = Number(step);
  const question = INTAKE_QUESTIONS.find((q) => q.step === n);
  if (!question) notFound();

  const backHref = n > 1 ? `/welcome/intake/${n - 1}` : "/login";

  return (
    <SplitCanvas
      backHref={backHref}
      leftTitle={
        <>
          A few questions
          <br />
          first.
        </>
      }
      leftBody="Four short ones. Your answers decide what the first week actually looks like — so there's no wrong answer, only a more useful one."
      quote={{
        text: "Nothing here is a test. I just need to know where you're starting from.",
        author: "Dr. Ananya Rao · Clinical Psychologist",
      }}
    >
      <IntakeForm question={question} total={INTAKE_QUESTIONS.length} />
    </SplitCanvas>
  );
}
