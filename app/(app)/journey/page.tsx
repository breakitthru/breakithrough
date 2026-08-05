import { requireOnboardedUser } from "@/lib/session";
import { getProgramState } from "@/lib/program";
import { getConfig, phaseForDayIn, getPhases } from "@/lib/config";
import { JourneyRoad } from "@/components/app/journey-road";

export default async function JourneyPage() {
  const user = await requireOnboardedUser();
  const config = await getConfig();
  const state = await getProgramState(user);
  const phases = await getPhases();

  const days = Array.from({ length: config.programDays }, (_, idx) => {
    const day = idx + 1;
    return { day, status: state.statusFor(day), phaseOrder: phaseForDayIn(phases, day).order };
  });

  return (
    <JourneyRoad
      days={days}
      phases={phases}
      resumeDay={state.resumeDay}
      currentPhaseOrder={phaseForDayIn(phases, state.resumeDay).order}
    />
  );
}
