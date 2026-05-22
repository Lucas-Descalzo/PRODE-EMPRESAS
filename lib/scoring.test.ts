import { describe, expect, it } from "vitest";

import { knockoutMatchOrder } from "@/data/world-cup-2026";
import {
  createInitialFixtureState,
  deriveMatches,
  getThirdPlaceCandidates,
  normalizeFixtureState,
} from "@/lib/world-cup-fixture";
import { scoreFixture } from "@/lib/scoring";
import type { FixtureState } from "@/lib/world-cup-types";

function createReadyBaseState() {
  const initial = createInitialFixtureState();

  return normalizeFixtureState({
    ...initial,
    qualifiedThirdPlaces: getThirdPlaceCandidates(initial.groupOrders)
      .map((team) => team.id)
      .slice(0, 8),
  });
}

function completeWithFirstAvailableWinner(source: FixtureState) {
  const winners: FixtureState["knockoutWinners"] = {};

  for (const matchId of knockoutMatchOrder) {
    const match = deriveMatches({ ...source, knockoutWinners: winners }).matchesById[matchId];
    const winnerId = match.sideA?.id ?? match.sideB?.id;

    if (winnerId) {
      winners[matchId] = winnerId;
    }
  }

  return normalizeFixtureState({
    ...source,
    knockoutWinners: winners,
  });
}

describe("fixture scoring", () => {
  it("scores the simple pre-tournament phase with exact positions and best third picks", () => {
    const baseState = createReadyBaseState();
    const score = scoreFixture(baseState, baseState);

    expect(score.groupExactPositionPoints).toBe(96);
    expect(score.groupTopTwoPoints).toBe(0);
    expect(score.bestThirdPoints).toBe(16);
    expect(score.roundOf32Points).toBe(0);
    expect(score.total).toBe(112);
    expect(score.scoredUnits).toBe(56);
    expect(score.pendingUnits).toBe(32);
  });

  it("scores each knockout match directly instead of using survival sets", () => {
    const baseState = createReadyBaseState();
    const firstMatch = deriveMatches(baseState).matchesById.M73;
    const officialState = normalizeFixtureState({
      ...baseState,
      knockoutWinners: { M73: firstMatch.sideA!.id },
    });

    const score = scoreFixture(officialState, officialState);

    expect(score.roundOf32Points).toBe(2);
    expect(score.total).toBe(114);
    expect(score.scoredUnits).toBe(57);
    expect(score.pendingUnits).toBe(31);
  });

  it("reaches the expected simple-mode maximum when the full bracket matches", () => {
    const completedState = completeWithFirstAvailableWinner(createReadyBaseState());
    const score = scoreFixture(completedState, completedState);

    expect(score.roundOf32Points).toBe(32);
    expect(score.roundOf16Points).toBe(32);
    expect(score.quarterFinalPoints).toBe(24);
    expect(score.semiFinalPoints).toBe(16);
    expect(score.thirdPlaceMatchPoints).toBe(8);
    expect(score.finalPoints).toBe(10);
    expect(score.total).toBe(234);
    expect(score.pendingUnits).toBe(0);
  });
});
