import { requirePermission } from "@/lib/admin";
import { getIntakeQuestions } from "@/lib/onboarding";
import { PageHeader } from "@/components/admin/ui";
import { ProgramTabs } from "@/components/admin/program/program-tabs";
import { IntakeEditor } from "@/components/admin/program/intake-editor";

export default async function IntakePage() {
  await requirePermission("program.edit");
  const questions = await getIntakeQuestions();

  return (
    <>
      <PageHeader eyebrow="Program" title="Intake" subtitle="The questions members answer before day one. Saved changes take effect for new sign-ups." />
      <ProgramTabs />
      <IntakeEditor initial={JSON.stringify(questions, null, 2)} />
    </>
  );
}
