import { ensureDatabaseSchema, getSql, parseJsonColumn } from "@/lib/db";
import { computeScore } from "./scoring";
import type { Prediction } from "./types";

export interface ParticipantRow {
  id: string;
  client_slug: string;
  name: string;
  email: string;
  area: string | null;
  created_at: string;
}

export interface PredictionRow {
  id: string;
  participant_id: string;
  match_id: string;
  prediction: Prediction;
  updated_at: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findOrCreateParticipant(input: {
  clientSlug: string;
  name: string;
  email: string;
  area?: string | null;
}): Promise<ParticipantRow> {
  await ensureDatabaseSchema();
  const sql = getSql();
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const area = input.area?.trim() || null;

  const existingRows = (await sql`
    SELECT id, client_slug, name, email, area, created_at
    FROM corporate_participants
    WHERE client_slug = ${input.clientSlug}
      AND email = ${email}
    LIMIT 1
  `) as ParticipantRow[];

  if (existingRows.length > 0) {
    const existing = existingRows[0];
    if (existing.name !== name || existing.area !== area) {
      const updatedRows = (await sql`
        UPDATE corporate_participants
        SET name = ${name}, area = ${area}
        WHERE id = ${existing.id}
        RETURNING id, client_slug, name, email, area, created_at
      `) as ParticipantRow[];
      return updatedRows[0];
    }
    return existing;
  }

  const insertedRows = (await sql`
    INSERT INTO corporate_participants (client_slug, name, email, area)
    VALUES (${input.clientSlug}, ${name}, ${email}, ${area})
    RETURNING id, client_slug, name, email, area, created_at
  `) as ParticipantRow[];

  return insertedRows[0];
}

export async function getParticipantById(
  id: string,
): Promise<ParticipantRow | null> {
  await ensureDatabaseSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, client_slug, name, email, area, created_at
    FROM corporate_participants
    WHERE id = ${id}
    LIMIT 1
  `) as ParticipantRow[];
  return rows[0] ?? null;
}

export async function getPredictionsForParticipant(
  participantId: string,
): Promise<Record<string, Prediction>> {
  await ensureDatabaseSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT match_id, prediction
    FROM corporate_predictions
    WHERE participant_id = ${participantId}
  `) as Array<{ match_id: string; prediction: unknown }>;

  return Object.fromEntries(
    rows.map((row) => [row.match_id, parseJsonColumn<Prediction>(row.prediction)]),
  );
}

export async function upsertPrediction(input: {
  participantId: string;
  matchId: string;
  prediction: Prediction;
}): Promise<void> {
  await ensureDatabaseSchema();
  const sql = getSql();
  const predictionJson = JSON.stringify(input.prediction);
  await sql`
    INSERT INTO corporate_predictions (participant_id, match_id, prediction)
    VALUES (${input.participantId}, ${input.matchId}, ${predictionJson}::jsonb)
    ON CONFLICT (participant_id, match_id)
    DO UPDATE SET
      prediction = EXCLUDED.prediction,
      updated_at = NOW()
  `;
}

export async function listParticipantsForClient(
  clientSlug: string,
): Promise<ParticipantRow[]> {
  await ensureDatabaseSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, client_slug, name, email, area, created_at
    FROM corporate_participants
    WHERE client_slug = ${clientSlug}
    ORDER BY created_at ASC
  `) as ParticipantRow[];
  return rows;
}

export interface OfficialResultRow {
  client_slug: string;
  match_id: string;
  home_score: number;
  away_score: number;
  saved_at: string;
}

export async function getOfficialResultsForClient(
  clientSlug: string,
): Promise<Record<string, OfficialResultRow>> {
  await ensureDatabaseSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT client_slug, match_id, home_score, away_score, saved_at
    FROM corporate_official_results
    WHERE client_slug = ${clientSlug}
  `) as OfficialResultRow[];
  return Object.fromEntries(rows.map((row) => [row.match_id, row]));
}

export async function saveOfficialResult(input: {
  clientSlug: string;
  matchId: string;
  home: number;
  away: number;
}): Promise<void> {
  await ensureDatabaseSchema();
  const sql = getSql();

  await sql`
    INSERT INTO corporate_official_results (client_slug, match_id, home_score, away_score)
    VALUES (${input.clientSlug}, ${input.matchId}, ${input.home}, ${input.away})
    ON CONFLICT (client_slug, match_id)
    DO UPDATE SET
      home_score = EXCLUDED.home_score,
      away_score = EXCLUDED.away_score,
      saved_at = NOW()
  `;

  const predictionRows = (await sql`
    SELECT cp.id, cp.prediction
    FROM corporate_predictions cp
    JOIN corporate_participants p ON p.id = cp.participant_id
    WHERE p.client_slug = ${input.clientSlug}
      AND cp.match_id = ${input.matchId}
  `) as Array<{ id: string; prediction: unknown }>;

  for (const row of predictionRows) {
    const prediction = parseJsonColumn<Prediction>(row.prediction);
    const points = computeScore(prediction, {
      home: input.home,
      away: input.away,
    });
    await sql`
      UPDATE corporate_predictions
      SET points = ${points}
      WHERE id = ${row.id}
    `;
  }
}

export async function deleteOfficialResult(input: {
  clientSlug: string;
  matchId: string;
}): Promise<void> {
  await ensureDatabaseSchema();
  const sql = getSql();
  await sql`
    DELETE FROM corporate_official_results
    WHERE client_slug = ${input.clientSlug}
      AND match_id = ${input.matchId}
  `;
  await sql`
    UPDATE corporate_predictions cp
    SET points = 0
    FROM corporate_participants p
    WHERE cp.participant_id = p.id
      AND p.client_slug = ${input.clientSlug}
      AND cp.match_id = ${input.matchId}
  `;
}

export interface LeaderboardRow {
  id: string;
  name: string;
  area: string | null;
  total_points: number;
  predictions_count: number;
  created_at: string;
}

export async function getLeaderboardForClient(
  clientSlug: string,
): Promise<LeaderboardRow[]> {
  await ensureDatabaseSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT
      p.id,
      p.name,
      p.area,
      COALESCE(SUM(pred.points), 0)::int AS total_points,
      COUNT(pred.id)::int AS predictions_count,
      p.created_at
    FROM corporate_participants p
    LEFT JOIN corporate_predictions pred ON pred.participant_id = p.id
    WHERE p.client_slug = ${clientSlug}
    GROUP BY p.id, p.name, p.area, p.created_at
    ORDER BY total_points DESC, p.created_at ASC
  `) as LeaderboardRow[];
  return rows;
}
