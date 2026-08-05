import { requireOnboardedUser } from "@/lib/session";
import { getProgramState } from "@/lib/program";
import { getConfig, phaseForDay, PHASES } from "@/lib/config";
import { JourneyRoad } from "@/components/app/journey-road";

export default async function JourneyPage() {
  const user = await requireOnboardedUser();
  const config = await getConfig();
  const state = await getProgramState(user);

  const days = Array.from({ length: config.programDays }, (_, idx) => {
    const day = idx + 1;
    return { day, status: state.statusFor(day), phaseOrder: phaseForDay(day).order };
  });
  const phases = PHASES.map((p) => ({
    order: p.order,
    name: p.name,
    dayStart: p.dayStart,
    dayEnd: p.dayEnd,
  }));

  return (
    <JourneyRoad
      days={days}
      phases={phases}
      resumeDay={state.resumeDay}
      currentPhaseOrder={phaseForDay(state.resumeDay).order}
    />
  );
}
