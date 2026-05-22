import { cookies } from "next/headers";

import { getParticipantById, type ParticipantRow } from "./db";

const COOKIE_PREFIX = "fwc26-corp-";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

function cookieName(clientSlug: string): string {
  return `${COOKIE_PREFIX}${clientSlug}`;
}

export async function setParticipantSession(
  clientSlug: string,
  participantId: string,
): Promise<void> {
  const jar = await cookies();
  jar.set(cookieName(clientSlug), participantId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/c/${clientSlug}`,
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearParticipantSession(clientSlug: string): Promise<void> {
  const jar = await cookies();
  jar.delete(cookieName(clientSlug));
}

export async function readParticipantIdFromCookie(
  clientSlug: string,
): Promise<string | null> {
  const jar = await cookies();
  return jar.get(cookieName(clientSlug))?.value ?? null;
}

export async function getCurrentParticipant(
  clientSlug: string,
): Promise<ParticipantRow | null> {
  const id = await readParticipantIdFromCookie(clientSlug);
  if (!id) return null;
  return getParticipantById(id);
}
