import type { CorporateClient } from "./types";

const CLIENTS: Record<string, CorporateClient> = {
  cocacola: {
    slug: "cocacola",
    displayName: "Mundial Coca-Cola 2026",
    shortName: "Coca-Cola",
    tagline: "Activación interna · Predecí los partidos y competí con tu equipo",
    branding: {
      primary: "#F40009",
      primaryDark: "#A80007",
      primaryHover: "#D10008",
      background: "#FFF8F0",
      foreground: "#1A1A1A",
      muted: "#5A5A5A",
      line: "rgba(0, 0, 0, 0.1)",
      contrastOnPrimary: "#FFFFFF",
    },
    highlightedTeamIds: ["arg"],
    predictionRules: {
      groups: "1X2",
      roundOf32: "score",
      roundOf16: "score",
      quarterFinal: "score",
      semiFinal: "score",
      bronzeFinal: "score",
      final: "score",
    },
    accessCodeRequired: true,
    accessCode: "COCA2026",
    collectsArea: true,
    areaLabel: "Sector",
    adminPassword: "cocadmin2026",
  },
};

export function getCorporateClient(slug: string): CorporateClient | null {
  return CLIENTS[slug.toLowerCase()] ?? null;
}

export function listCorporateClients(): CorporateClient[] {
  return Object.values(CLIENTS);
}
