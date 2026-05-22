import { notFound } from "next/navigation";

import { AdminLogin } from "@/components/corporate/admin-login";
import { AdminPanel } from "@/components/corporate/admin-panel";
import { getCorporateClient } from "@/lib/corporate/clients";
import { isAdminAuthenticated } from "@/lib/corporate/admin-session";
import { getOfficialResultsForClient } from "@/lib/corporate/db";
import { allMatches } from "@/lib/corporate/match-registry";

export const dynamic = "force-dynamic";

export default async function CorporateAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = getCorporateClient(slug);
  if (!client) {
    notFound();
  }

  const authenticated = await isAdminAuthenticated(client.slug);
  if (!authenticated) {
    return <AdminLogin client={client} />;
  }

  const officialResults = await getOfficialResultsForClient(client.slug);

  return (
    <AdminPanel
      client={client}
      matches={allMatches}
      officialResults={officialResults}
    />
  );
}
