import type { StageId, TeamId } from "@/lib/world-cup-types";

export type PredictionMode = "1X2" | "score";

export type PredictionStage = "groups" | StageId;

export interface ClientBranding {
  primary: string;
  primaryDark: string;
  primaryHover: string;
  background: string;
  foreground: string;
  muted: string;
  line: string;
  contrastOnPrimary: string;
}

export interface CorporateClient {
  slug: string;
  displayName: string;
  shortName: string;
  tagline: string;
  branding: ClientBranding;
  highlightedTeamIds: TeamId[];
  predictionRules: Record<PredictionStage, PredictionMode>;
  accessCodeRequired: boolean;
  accessCode?: string;
  collectsArea: boolean;
  areaLabel?: string;
  adminPassword: string;
}

export type Prediction =
  | { kind: "1X2"; outcome: "home" | "draw" | "away" }
  | { kind: "score"; home: number; away: number };
