import { notFound } from "next/navigation";

import { LoginForm } from "@/components/corporate/login-form";
import { GroupMatchGrid } from "@/components/corporate/group-match-grid";
import { KnockoutMatchSection } from "@/components/corporate/knockout-match-section";
import { getCorporateClient } from "@/lib/corporate/clients";
import { getPredictionsForParticipant } from "@/lib/corporate/db";
import { allMatches } from "@/lib/corporate/match-registry";
import { getCurrentParticipant } from "@/lib/corporate/session";

export const dynamic = "force-dynamic";

export default async function PartidosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = getCorporateClient(slug);
  if (!client) {
    notFound();
  }

  const participant = await getCurrentParticipant(client.slug);
  if (!participant) {
    return <LoginForm client={client} />;
  }

  const predictions = await getPredictionsForParticipant(participant.id);

  return (
    <>
      <GroupMatchGrid
        client={client}
        matches={allMatches}
        initialPredictions={predictions}
      />
      <KnockoutMatchSection
        client={client}
        matches={allMatches}
        initialPredictions={predictions}
      />
    </>
  );
}
