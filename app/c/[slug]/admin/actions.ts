"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCorporateClient } from "@/lib/corporate/clients";
import {
  setAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
} from "@/lib/corporate/admin-session";
import {
  saveOfficialResult,
  deleteOfficialResult,
} from "@/lib/corporate/db";
import { getMatchById } from "@/lib/corporate/match-registry";

export interface AdminLoginState {
  error?: string;
}

export async function adminLoginAction(
  prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  const client = getCorporateClient(slug);
  if (!client) {
    return { error: "Cliente no encontrado." };
  }

  if (password !== client.adminPassword) {
    return { error: "Contraseña incorrecta." };
  }

  await setAdminSession(client.slug);
  redirect(`/c/${client.slug}/admin`);
}

export async function adminLogoutAction(slug: string): Promise<void> {
  await clearAdminSession(slug);
  redirect(`/c/${slug}/admin`);
}

export interface SaveResultState {
  matchId?: string;
  message?: string;
  error?: string;
}

export async function saveResultAction(
  prevState: SaveResultState,
  formData: FormData,
): Promise<SaveResultState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const matchId = String(formData.get("matchId") ?? "").trim();
  const homeStr = String(formData.get("home") ?? "");
  const awayStr = String(formData.get("away") ?? "");

  const client = getCorporateClient(slug);
  if (!client) {
    return { error: "Cliente no encontrado." };
  }

  if (!(await isAdminAuthenticated(client.slug))) {
    return { error: "No autorizado." };
  }

  const match = getMatchById(matchId);
  if (!match) {
    return { error: "Partido no encontrado." };
  }

  const home = Number.parseInt(homeStr, 10);
  const away = Number.parseInt(awayStr, 10);

  if (
    !Number.isFinite(home) ||
    !Number.isFinite(away) ||
    home < 0 ||
    away < 0 ||
    home > 20 ||
    away > 20
  ) {
    return { matchId, error: "Resultado inválido." };
  }

  await saveOfficialResult({
    clientSlug: client.slug,
    matchId,
    home,
    away,
  });

  revalidatePath(`/c/${client.slug}/admin`);
  revalidatePath(`/c/${client.slug}/ranking`);
  return { matchId, message: "Guardado · puntos recalculados" };
}

export async function clearResultAction(
  prevState: SaveResultState,
  formData: FormData,
): Promise<SaveResultState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const matchId = String(formData.get("matchId") ?? "").trim();

  const client = getCorporateClient(slug);
  if (!client) {
    return { error: "Cliente no encontrado." };
  }

  if (!(await isAdminAuthenticated(client.slug))) {
    return { error: "No autorizado." };
  }

  await deleteOfficialResult({
    clientSlug: client.slug,
    matchId,
  });

  revalidatePath(`/c/${client.slug}/admin`);
  revalidatePath(`/c/${client.slug}/ranking`);
  return { matchId, message: "Resultado borrado" };
}
