import { requireOnboardedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isAiConfigured } from "@/lib/ai";
import { DaylightChat } from "@/components/app/daylight-chat";

export default async function DaylightPage() {
  const user = await requireOnboardedUser();
  const rows = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: { role: true, content: true },
  });

  return (
    <DaylightChat
      history={rows.map((r) => ({ role: r.role, content: r.content }))}
      configured={await isAiConfigured()}
    />
  );
}
