import { knockoutMatchOrder } from "@/data/world-cup-2026";
import { deriveMatches, normalizeFixtureState } from "@/lib/world-cup-fixture";
import type { FixtureState, MatchId, TeamId } from "@/lib/world-cup-types";

const ROUND_OF_32_MATCHES = knockoutMatchOrder.slice(0, 16);
const ROUND_OF_16_MATCHES = knockoutMatchOrder.slice(16, 24);
const QUARTER_FINAL_MATCHES = knockoutMatchOrder.slice(24, 28);
const SEMI_FINAL_MATCHES = knockoutMatchOrder.slice(28, 30);
const THIRD_PLACE_MATCH = "M103" as const;
const FINAL_MATCH = "M104" as const;

const GROUP_EXACT_POSITION_POINTS = 2;
const GROUP_TOP_TWO_POINTS = 1;
const BEST_THIRD_POINTS = 2;
const GROUP_AND_THIRD_TOTAL_UNITS = 56;

const SIMPLE_STAGE_POINTS: Record<MatchId, number> = Object.fromEntries(
  knockoutMatchOrder.map((matchId) => {
    if (ROUND_OF_32_MATCHES.includes(matchId)) {
      return [matchId, 2];
    }

    if (ROUND_OF_16_MATCHES.includes(matchId)) {
      return [matchId, 4];
    }

    if (QUARTER_FINAL_MATCHES.includes(matchId)) {
      return [matchId, 6];
    }

    if (SEMI_FINAL_MATCHES.includes(matchId) || matchId === THIRD_PLACE_MATCH) {
      return [matchId, 8];
    }

    return [matchId, 10];
  }),
) as Record<MatchId, number>;

export interface FixtureScoreBreakdown {
  groupExactPositionPoints: number;
  groupTopTwoPoints: number;
  bestThirdPoints: number;
  roundOf32Points: number;
  roundOf16Points: number;
  quarterFinalPoints: number;
  semiFinalPoints: number;
  thirdPlaceMatchPoints: number;
  finalPoints: number;
  total: number;
  scoredUnits: number;
  pendingUnits: number;
}

function countSetHits(predicted: TeamId[], official: TeamId[]) {
  const officialSet = new Set(official);
  return predicted.filter((teamId) => officialSet.has(teamId)).length;
}

function hasOfficialGroupPhase(state: FixtureState) {
  return (
    state.qualifiedThirdPlaces.length === 8 &&
    Object.keys(state.thirdPlaceAssignments).length === 8
  );
}

function scoreGroupPhase(predictionState: FixtureState, officialState: FixtureState) {
  if (!hasOfficialGroupPhase(officialState)) {
    return {
      groupExactPositionPoints: 0,
      groupTopTwoPoints: 0,
      bestThirdPoints: 0,
      scoredUnits: 0,
    };
  }

  let groupExactPositionPoints = 0;
  let groupTopTwoPoints = 0;

  for (const groupId of Object.keys(predictionState.groupOrders) as Array<
    keyof FixtureState["groupOrders"]
  >) {
    const predictionOrder = predictionState.groupOrders[groupId];
    const officialOrder = officialState.groupOrders[groupId];
    const officialTopTwo = new Set(officialOrder.slice(0, 2));

    predictionOrder.forEach((teamId, index) => {
      if (teamId === officialOrder[index]) {
        groupExactPositionPoints += GROUP_EXACT_POSITION_POINTS;
        return;
      }

      if (index < 2 && officialTopTwo.has(teamId)) {
        groupTopTwoPoints += GROUP_TOP_TWO_POINTS;
      }
    });
  }

  const bestThirdPoints =
    countSetHits(predictionState.qualifiedThirdPlaces, officialState.qualifiedThirdPlaces) *
    BEST_THIRD_POINTS;

  return {
    groupExactPositionPoints,
    groupTopTwoPoints,
    bestThirdPoints,
    scoredUnits: GROUP_AND_THIRD_TOTAL_UNITS,
  };
}

function scoreKnockoutMatches(
  predictionMatches: ReturnType<typeof deriveMatches>["matchesById"],
  officialMatches: ReturnType<typeof deriveMatches>["matchesById"],
  matchIds: MatchId[],
) {
  return matchIds.reduce((total, matchId) => {
    const officialWinner = officialMatches[matchId]?.winnerId;

    if (!officialWinner) {
      return total;
    }

    return predictionMatches[matchId]?.winnerId === officialWinner
      ? total + SIMPLE_STAGE_POINTS[matchId]
      : total;
  }, 0);
}

function countScoredUnits(officialState: FixtureState) {
  const groupUnits = hasOfficialGroupPhase(officialState) ? GROUP_AND_THIRD_TOTAL_UNITS : 0;
  const knockoutUnits = knockoutMatchOrder.filter(
    (matchId) => Boolean(deriveMatches(officialState).matchesById[matchId]?.winnerId),
  ).length;

  return groupUnits + knockoutUnits;
}

export function scoreFixture(
  predictionSource: Partial<FixtureState> | FixtureState,
  officialSource: Partial<FixtureState> | FixtureState,
): FixtureScoreBreakdown {
  const predictionState = normalizeFixtureState(predictionSource);
  const officialState = normalizeFixtureState(officialSource);
  const predictionMatches = deriveMatches(predictionState).matchesById;
  const officialMatches = deriveMatches(officialState).matchesById;
  const groupPoints = scoreGroupPhase(predictionState, officialState);

  const roundOf32Points = scoreKnockoutMatches(
    predictionMatches,
    officialMatches,
    ROUND_OF_32_MATCHES,
  );
  const roundOf16Points = scoreKnockoutMatches(
    predictionMatches,
    officialMatches,
    ROUND_OF_16_MATCHES,
  );
  const quarterFinalPoints = scoreKnockoutMatches(
    predictionMatches,
    officialMatches,
    QUARTER_FINAL_MATCHES,
  );
  const semiFinalPoints = scoreKnockoutMatches(
    predictionMatches,
    officialMatches,
    SEMI_FINAL_MATCHES,
  );
  const thirdPlaceMatchPoints = scoreKnockoutMatches(
    predictionMatches,
    officialMatches,
    [THIRD_PLACE_MATCH],
  );
  const finalPoints = scoreKnockoutMatches(predictionMatches, officialMatches, [FINAL_MATCH]);

  const total =
    groupPoints.groupExactPositionPoints +
    groupPoints.groupTopTwoPoints +
    groupPoints.bestThirdPoints +
    roundOf32Points +
    roundOf16Points +
    quarterFinalPoints +
    semiFinalPoints +
    thirdPlaceMatchPoints +
    finalPoints;

  const scoredUnits = countScoredUnits(officialState);

  return {
    groupExactPositionPoints: groupPoints.groupExactPositionPoints,
    groupTopTwoPoints: groupPoints.groupTopTwoPoints,
    bestThirdPoints: groupPoints.bestThirdPoints,
    roundOf32Points,
    roundOf16Points,
    quarterFinalPoints,
    semiFinalPoints,
    thirdPlaceMatchPoints,
    finalPoints,
    total,
    scoredUnits,
    pendingUnits: Math.max(0, GROUP_AND_THIRD_TOTAL_UNITS + 32 - scoredUnits),
  };
}
