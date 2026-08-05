// Intake questionnaire content (D05–D08). Answers are stored, not scored in v1.
// The admin panel will eventually own these questions + their plan mapping.

export type IntakeOption = { value: string; label: string; icon: string };
export type IntakeQuestion = {
  step: number;
  title: string;
  subtitle: string;
  footnote: string;
  options: IntakeOption[];
};

/**
 * Intake questions from SiteConfig ("intakeQuestions"), falling back to the
 * constant below. The onboarding flow reads this so the admin can edit them.
 */
export async function getIntakeQuestions(): Promise<IntakeQuestion[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.siteConfig.findUnique({ where: { key: "intakeQuestions" } });
    if (row?.value && Array.isArray(row.value)) {
      return row.value as unknown as IntakeQuestion[];
    }
  } catch {
    // fall through to the constant
  }
  return INTAKE_QUESTIONS;
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    step: 1,
    title: "What brings you here?",
    subtitle: "Take your time. There's no wrong answer.",
    footnote: "This shapes your 60-day plan — gently.",
    options: [
      { value: "breakup", label: "A breakup or divorce", icon: "HeartBreak" },
      { value: "loss", label: "Losing someone I love", icon: "Butterfly" },
      { value: "past", label: "Something heavy from my past", icon: "CloudRain" },
      { value: "unsure", label: "I'd rather not label it yet", icon: "Sparkle" },
    ],
  },
  {
    step: 2,
    title: "How long has it been?",
    subtitle: "However long it's been, you're here now.",
    footnote: "There's no schedule you're behind on.",
    options: [
      { value: "days", label: "Just days", icon: "Sun" },
      { value: "weeks", label: "A few weeks", icon: "MoonStars" },
      { value: "months", label: "A few months", icon: "Leaf" },
      { value: "longer", label: "Longer than that", icon: "Tree" },
    ],
  },
  {
    step: 3,
    title: "How are the days feeling?",
    subtitle: "Just a rough sense is enough.",
    footnote: "We'll meet you where you are.",
    options: [
      { value: "heavy", label: "Heavy, most of the time", icon: "CloudRain" },
      { value: "waves", label: "It comes in waves", icon: "Waveform" },
      { value: "numb", label: "Mostly numb", icon: "Moon" },
      { value: "lighter", label: "Starting to lift", icon: "SunHorizon" },
    ],
  },
  {
    step: 4,
    title: "What would feel like moving forward?",
    subtitle: "Pick whatever pulls at you most.",
    footnote: "You can want more than one — choose a start.",
    options: [
      { value: "sleep", label: "Sleeping through the night", icon: "Moon" },
      { value: "routine", label: "A steady daily routine", icon: "Path" },
      { value: "self", label: "Feeling like myself again", icon: "Smiley" },
      { value: "peace", label: "Some quiet in my head", icon: "Waveform" },
    ],
  },
];
