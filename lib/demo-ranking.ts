import type { RankingRow } from "@/lib/group-types";
import { scoreFixture } from "@/lib/scoring";
import {
  createInitialFixtureState,
  deriveMatches,
  normalizeFixtureState,
} from "@/lib/world-cup-fixture";
import type { FixtureState, GroupId, MatchId } from "@/lib/world-cup-types";

export interface DemoLeaderboardRow extends RankingRow {
  department: string;
  isCurrentUser?: boolean;
  note?: string;
}

interface DemoParticipant {
  id: string;
  displayName: string;
  department: string;
  fixtureState: FixtureState;
}

type GroupOrderMap = Partial<Record<GroupId, [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3]>>;
type KnockoutPick = [MatchId, "A" | "B"];

const OFFICIAL_THIRD_GROUPS: GroupId[] = ["A", "C", "D", "E", "G", "I", "J", "L"];

const OFFICIAL_GROUP_ORDERS: GroupOrderMap = {
  A: [1, 0, 2, 3],
  B: [0, 2, 1, 3],
  C: [2, 0, 1, 3],
  D: [0, 1, 3, 2],
  E: [1, 0, 2, 3],
  F: [0, 2, 1, 3],
  G: [0, 1, 2, 3],
  H: [1, 0, 2, 3],
  I: [0, 1, 2, 3],
  J: [2, 0, 1, 3],
  K: [1, 0, 2, 3],
  L: [0, 2, 1, 3],
};

const OFFICIAL_KNOCKOUT_PICKS: KnockoutPick[] = [
  ["M73", "A"],
  ["M74", "B"],
  ["M75", "A"],
  ["M76", "B"],
  ["M77", "A"],
  ["M78", "A"],
  ["M79", "B"],
  ["M80", "A"],
  ["M81", "B"],
  ["M82", "A"],
  ["M83", "A"],
  ["M84", "B"],
  ["M85", "A"],
  ["M86", "B"],
  ["M87", "A"],
  ["M88", "B"],
  ["M89", "A"],
  ["M90", "B"],
  ["M91", "A"],
  ["M92", "A"],
  ["M93", "B"],
  ["M94", "A"],
  ["M95", "B"],
  ["M96", "A"],
  ["M97", "A"],
  ["M98", "B"],
  ["M99", "A"],
  ["M100", "B"],
];

function reorderGroups(
  state: FixtureState,
  overrides: GroupOrderMap,
) {
  const nextOrders = { ...state.groupOrders };

  for (const [groupId, order] of Object.entries(overrides) as Array<[GroupId, [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3]]>) {
    const baseOrder = state.groupOrders[groupId];
    nextOrders[groupId] = order.map((index) => baseOrder[index]);
  }

  return normalizeFixtureState({
    ...state,
    groupOrders: nextOrders,
  });
}

function selectThirdGroups(state: FixtureState, groups: GroupId[]) {
  return normalizeFixtureState({
    ...state,
    qualifiedThirdPlaces: groups.map((groupId) => state.groupOrders[groupId][2]),
  });
}

function applyKnockoutPicks(
  state: FixtureState,
  picks: KnockoutPick[],
) {
  let nextState = state;

  for (const [matchId, side] of picks) {
    const match = deriveMatches(nextState).matchesById[matchId];
    const winnerId = side === "A" ? match.sideA?.id : match.sideB?.id;

    if (!winnerId) {
      continue;
    }

    nextState = normalizeFixtureState({
      ...nextState,
      knockoutWinners: {
        ...nextState.knockoutWinners,
        [matchId]: winnerId,
      },
    });
  }

  return nextState;
}

function createFixtureState(
  groupOrders: GroupOrderMap,
  thirdGroups: GroupId[],
  knockoutPicks: KnockoutPick[],
) {
  let state = createInitialFixtureState();
  state = reorderGroups(state, groupOrders);
  state = selectThirdGroups(state, thirdGroups);
  state = applyKnockoutPicks(state, knockoutPicks);
  return state;
}

export const demoOfficialFixtureState = createFixtureState(
  OFFICIAL_GROUP_ORDERS,
  OFFICIAL_THIRD_GROUPS,
  OFFICIAL_KNOCKOUT_PICKS,
);

const demoParticipants: DemoParticipant[] = [
  {
    id: "sofia-alvarez",
    displayName: "Sofia Alvarez",
    department: "Marketing",
    fixtureState: createFixtureState(
      {
        ...OFFICIAL_GROUP_ORDERS,
        B: [0, 1, 2, 3],
        H: [1, 0, 3, 2],
      },
      OFFICIAL_THIRD_GROUPS,
      OFFICIAL_KNOCKOUT_PICKS.slice(0, 26),
    ),
  },
  {
    id: "tomas-ruiz",
    displayName: "Tomas Ruiz",
    department: "Ventas",
    fixtureState: createFixtureState(
      {
        ...OFFICIAL_GROUP_ORDERS,
        C: [0, 2, 1, 3],
        F: [0, 1, 2, 3],
        J: [1, 0, 2, 3],
      },
      ["A", "B", "D", "E", "G", "I", "K", "L"],
      [
        ...OFFICIAL_KNOCKOUT_PICKS.slice(0, 8),
        ["M81", "A"],
        ["M82", "B"],
        ...OFFICIAL_KNOCKOUT_PICKS.slice(10, 22),
      ],
    ),
  },
  {
    id: "camila-costa",
    displayName: "Camila Costa",
    department: "People",
    fixtureState: createFixtureState(
      {
        ...OFFICIAL_GROUP_ORDERS,
        A: [0, 1, 2, 3],
        D: [1, 0, 2, 3],
        K: [0, 1, 2, 3],
      },
      ["A", "C", "D", "F", "G", "I", "J", "L"],
      OFFICIAL_KNOCKOUT_PICKS.slice(0, 24),
    ),
  },
  {
    id: "juan-martin",
    displayName: "Juan Martin",
    department: "Finanzas",
    fixtureState: createFixtureState(
      {
        ...OFFICIAL_GROUP_ORDERS,
        E: [0, 1, 2, 3],
        G: [1, 0, 2, 3],
        L: [0, 1, 2, 3],
      },
      ["A", "C", "D", "E", "H", "I", "J", "L"],
      [
        ...OFFICIAL_KNOCKOUT_PICKS.slice(0, 5),
        ["M78", "B"],
        ...OFFICIAL_KNOCKOUT_PICKS.slice(6, 18),
        ["M91", "B"],
        ...OFFICIAL_KNOCKOUT_PICKS.slice(19, 25),
      ],
    ),
  },
  {
    id: "valentina-nunez",
    displayName: "Valentina Nunez",
    department: "Operaciones",
    fixtureState: createFixtureState(
      {
        ...OFFICIAL_GROUP_ORDERS,
        B: [2, 0, 1, 3],
        F: [0, 1, 2, 3],
        I: [1, 0, 2, 3],
      },
      ["A", "C", "D", "F", "G", "H", "J", "L"],
      OFFICIAL_KNOCKOUT_PICKS.slice(0, 20),
    ),
  },
  {
    id: "bruno-sosa",
    displayName: "Bruno Sosa",
    department: "Producto",
    fixtureState: createFixtureState(
      {
        ...OFFICIAL_GROUP_ORDERS,
        C: [2, 1, 0, 3],
        H: [0, 1, 2, 3],
        J: [2, 1, 0, 3],
      },
      ["A", "C", "D", "E", "G", "I", "K", "L"],
      [
        ...OFFICIAL_KNOCKOUT_PICKS.slice(0, 3),
        ["M76", "A"],
        ...OFFICIAL_KNOCKOUT_PICKS.slice(4, 16),
        ["M89", "B"],
        ...OFFICIAL_KNOCKOUT_PICKS.slice(17, 24),
      ],
    ),
  },
];

function toLeaderboardRow(
  participant: DemoParticipant,
): DemoLeaderboardRow {
  const score = scoreFixture(participant.fixtureState, demoOfficialFixtureState);

  return {
    entryId: participant.id,
    displayName: participant.displayName,
    updatedAt: "2026-06-30T18:00:00.000Z",
    department: participant.department,
    ...score,
  };
}

function sortRows(
  rows: DemoLeaderboardRow[],
) {
  return [...rows].sort((left, right) => {
    if (right.total !== left.total) {
      return right.total - left.total;
    }

    if (right.scoredUnits !== left.scoredUnits) {
      return right.scoredUnits - left.scoredUnits;
    }

    return left.displayName.localeCompare(right.displayName, "es");
  });
}

export function getDemoLeaderboardBase() {
  return sortRows(demoParticipants.map(toLeaderboardRow));
}

export function scoreCurrentDemoPrediction(
  fixtureState: FixtureState,
): DemoLeaderboardRow {
  const score = scoreFixture(fixtureState, demoOfficialFixtureState);

  return {
    entryId: "current-user",
    displayName: "Tu prediccion",
    updatedAt: new Date().toISOString(),
    department: "Demo personal",
    isCurrentUser: true,
    note: "Comparada contra resultados de ejemplo ya cargados en el admin.",
    ...score,
  };
}

export function buildDemoLeaderboard(
  currentPrediction?: FixtureState | null,
) {
  const rows = getDemoLeaderboardBase();

  if (!currentPrediction) {
    return rows;
  }

  return sortRows([...rows, scoreCurrentDemoPrediction(currentPrediction)]);
}

export function getDemoLeaderboardPreview(limit = 5) {
  return getDemoLeaderboardBase().slice(0, limit);
}

export function getDemoScoringLegend() {
  return {
    scoredUnits: Object.keys(demoOfficialFixtureState.knockoutWinners).length + 48,
    totalUnits: 80,
  };
}
