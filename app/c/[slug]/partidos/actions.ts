"use server";

import { redirect } from "next/navigation";

import { getCorporateClient } from "@/lib/corporate/clients";
import { findOrCreateParticipant } from "@/lib/corporate/db";
import {
  setParticipantSession,
  clearParticipantSession,
} from "@/lib/corporate/session";

export interface LoginActionState {
  error?: string;
}

export async function loginAction(
  prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const client = getCorporateClient(slug);
  if (!client) {
    return { error: "Cliente no encontrado." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const area = client.collectsArea
    ? String(formData.get("area") ?? "").trim()
    : "";
  const code = client.accessCodeRequired
    ? String(formData.get("code") ?? "").trim()
    : "";

  if (!name || name.length < 2) {
    return { error: "Ingresá tu nombre completo." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "El email no es válido." };
  }

  if (client.collectsArea && !area) {
    return { error: `Indicá tu ${client.areaLabel?.toLowerCase() ?? "área"}.` };
  }

  if (
    client.accessCodeRequired &&
    code.toUpperCase() !== (client.accessCode ?? "").toUpperCase()
  ) {
    return { error: "El código interno no es correcto." };
  }

  const participant = await findOrCreateParticipant({
    clientSlug: client.slug,
    name,
    email,
    area: area || null,
  });

  await setParticipantSession(client.slug, participant.id);
  redirect(`/c/${client.slug}/partidos`);
}

export async function logoutAction(slug: string): Promise<void> {
  await clearParticipantSession(slug);
  redirect(`/c/${slug}`);
}
