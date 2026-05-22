import { neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;
let schemaReadyPromise: Promise<void> | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

export async function ensureDatabaseSchema() {
  if (!isDatabaseConfigured()) {
    return;
  }

  if (!schemaReadyPromise) {
    const sql = getSql();

    schemaReadyPromise = (async () => {
      await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

      await sql`
        CREATE TABLE IF NOT EXISTS groups (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          slug TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          deadline_at_utc TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        ALTER TABLE groups
        ADD COLUMN IF NOT EXISTS scoring_enabled BOOLEAN NOT NULL DEFAULT false
      `;

      await sql`
        ALTER TABLE groups
        ADD COLUMN IF NOT EXISTS is_public_pool BOOLEAN NOT NULL DEFAULT false
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS entries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          full_name_normalized TEXT NOT NULL,
          edit_key_hash TEXT NOT NULL,
          edit_key_salt TEXT NOT NULL,
          fixture_state_json JSONB NOT NULL,
          submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          failed_resume_attempts INTEGER NOT NULL DEFAULT 0,
          resume_locked_until_utc TIMESTAMPTZ,
          CONSTRAINT unique_entry_name_per_group UNIQUE (group_id, full_name_normalized)
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS entries_group_name_idx
        ON entries (group_id, full_name_normalized)
      `;

      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS groups_single_public_pool_idx
        ON groups (is_public_pool)
        WHERE is_public_pool = true
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value_json JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS corporate_participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_slug TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          area TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT corporate_participants_unique_email UNIQUE (client_slug, email)
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS corporate_participants_client_idx
        ON corporate_participants (client_slug)
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS corporate_predictions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          participant_id UUID NOT NULL REFERENCES corporate_participants(id) ON DELETE CASCADE,
          match_id TEXT NOT NULL,
          prediction JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT corporate_predictions_unique UNIQUE (participant_id, match_id)
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS corporate_predictions_participant_idx
        ON corporate_predictions (participant_id)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS corporate_predictions_match_idx
        ON corporate_predictions (match_id)
      `;

      await sql`
        ALTER TABLE corporate_predictions
        ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS corporate_official_results (
          client_slug TEXT NOT NULL,
          match_id TEXT NOT NULL,
          home_score INTEGER NOT NULL,
          away_score INTEGER NOT NULL,
          saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (client_slug, match_id)
        )
      `;
    })();
  }

  await schemaReadyPromise;
}

export function parseJsonColumn<T>(value: unknown): T {
  if (typeof value === "string") {
    return JSON.parse(value) as T;
  }

  return value as T;
}

export function asIsoString(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}
