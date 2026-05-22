import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing-page";
import { buildQueryString } from "@/lib/navigation-utils";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  if (params.p) {
    redirect(`/mi-prediccion${buildQueryString(params)}`);
  }

  return <LandingPage />;
}
