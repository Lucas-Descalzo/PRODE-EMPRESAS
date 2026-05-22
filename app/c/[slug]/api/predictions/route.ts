import { NextResponse } from "next/server";

import { getCorporateClient } from "@/lib/corporate/clients";
import { upsertPrediction } from "@/lib/corporate/db";
import { readParticipantIdFromCookie } from "@/lib/corporate/session";
import type { Prediction } from "@/lib/corporate/types";
import { getMatchById } from "@/lib/corporate/match-registry";

function isValidPrediction(value: unknown): value is Prediction {
  if (!value || typeof value !== "object") return false;
  const v = value as { kind?: unknown; outcome?: unknown; home?: unknown; away?: unknown };

  if (v.kind === "1X2") {
    return v.outcome === "home" || v.outcome === "draw" || v.outcome === "away";
  }
  if (v.kind === "score") {
    return (
      typeof v.home === "number" &&
      typeof v.away === "number" &&
      Number.isInteger(v.home) &&
      Number.isInteger(v.away) &&
      v.home >= 0 &&
      v.away >= 0 &&
      v.home <= 20 &&
      v.away <= 20
    );
  }
  return false;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const client = getCorporateClient(slug);
  if (!client) {
    return NextResponse.json({ error: "client_not_found" }, { status: 404 });
  }

  const participantId = await readParticipantIdFromCookie(slug);
  if (!participantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const body = payload as { matchId?: unknown; prediction?: unknown };

  if (typeof body.matchId !== "string") {
    return NextResponse.json({ error: "invalid_match_id" }, { status: 400 });
  }

  const match = getMatchById(body.matchId);
  if (!match) {
    return NextResponse.json({ error: "match_not_found" }, { status: 404 });
  }

  if (match.lockedAt && new Date() >= match.lockedAt) {
    return NextResponse.json({ error: "match_locked" }, { status: 409 });
  }

  if (!isValidPrediction(body.prediction)) {
    return NextResponse.json({ error: "invalid_prediction" }, { status: 400 });
  }

  await upsertPrediction({
    participantId,
    matchId: body.matchId,
    prediction: body.prediction,
  });

  return NextResponse.json({ ok: true });
}
