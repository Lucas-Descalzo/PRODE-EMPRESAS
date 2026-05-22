"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  buildDemoLeaderboard,
  getDemoScoringLegend,
  type DemoLeaderboardRow,
} from "@/lib/demo-ranking";
import { decodeFixtureState, FIXTURE_STORAGE_KEY } from "@/lib/world-cup-state";

import styles from "./demo-ranking.module.css";

function getBreakdownItems(row: DemoLeaderboardRow) {
  return [
    {
      label: "Clasificacion de grupos",
      value: row.groupClassificationPoints,
      help: "Equipos que metiste en 16avos.",
    },
    {
      label: "Puestos exactos",
      value: row.groupExactPositionPoints,
      help: "Primeros, segundos y terceros en su lugar correcto.",
    },
    {
      label: "16avos",
      value: row.roundOf32Points,
      help: "Equipos que seguis teniendo vivos al pasar la fase de grupos.",
    },
    {
      label: "Octavos",
      value: row.roundOf16Points,
      help: "Supervivencia acertada en octavos.",
    },
    {
      label: "Cuartos y semis",
      value: row.quarterFinalPoints + row.semiFinalPoints,
      help: "Puntos por seguir avanzando en el cuadro.",
    },
    {
      label: "Final y bonus",
      value: row.finalistPoints + row.exactFinalBonus + row.championBonus + row.thirdPlaceBonus,
      help: "Finalistas, campeon y tercer puesto.",
    },
  ];
}

export function DemoRankingPage() {
  const [rows, setRows] = useState<DemoLeaderboardRow[]>(() => buildDemoLeaderboard());
  const [hasCurrentPrediction, setHasCurrentPrediction] = useState(false);
  const scoringLegend = useMemo(() => getDemoScoringLegend(), []);
  const currentRow = rows.find((row) => row.isCurrentUser);
  const currentPosition = currentRow
    ? rows.findIndex((row) => row.entryId === currentRow.entryId) + 1
    : null;

  useEffect(() => {
    const encoded = window.localStorage.getItem(FIXTURE_STORAGE_KEY);
    const currentPrediction = decodeFixtureState(encoded);

    if (!currentPrediction) {
      setRows(buildDemoLeaderboard());
      setHasCurrentPrediction(false);
      return;
    }

    setRows(buildDemoLeaderboard(currentPrediction));
    setHasCurrentPrediction(true);
  }, []);

  return (
    <main className={styles.pageShell}>
      <section className={styles.heroCard}>
        <p className={styles.eyebrow}>Ranking interno demo</p>
        <h1>Asi podria verse el ranking para tus clientes</h1>
        <p>
          Esta vista usa participantes de ejemplo y resultados parciales cargados en el admin.
          Si ya armaste tu prediccion, tambien la comparamos para mostrarte en que posicion
          quedarias.
        </p>

        <div className={styles.heroActions}>
          <Link href="/mi-prediccion" className={styles.primaryAction}>
            Volver a mi prediccion
          </Link>
          <Link href="/" className={styles.secondaryAction}>
            Ir al inicio
          </Link>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <article>
          <p className={styles.summaryLabel}>Participantes demo</p>
          <strong>{rows.length}</strong>
          <span>Incluye ejemplos y, si existe, tu prediccion actual.</span>
        </article>
        <article>
          <p className={styles.summaryLabel}>Progreso del scoring</p>
          <strong>
            {scoringLegend.scoredUnits}/{scoringLegend.totalUnits}
          </strong>
          <span>Unidades ya puntuadas con resultados de ejemplo.</span>
        </article>
        <article>
          <p className={styles.summaryLabel}>Tu posicion</p>
          <strong>{currentPosition ?? "--"}</strong>
          <span>
            {hasCurrentPrediction
              ? "Actualizada con la prediccion guardada en este navegador."
              : "Completa tu prediccion para comparar tu lugar en el ranking."}
          </span>
        </article>
      </section>

      <section className={styles.leaderboardCard}>
        <div className={styles.leaderboardHeader}>
          <p className={styles.eyebrow}>Tabla de posiciones</p>
          <h2>Ranking general</h2>
          <p className={styles.leaderboardHint}>
            Cada fila se puede abrir para ver de donde vienen los puntos. Para una empresa,
            esta es la profundidad justa: claridad para todos sin volver la experiencia pesada.
          </p>
        </div>

        <div className={styles.leaderboardList}>
          {rows.map((row, index) => (
            <details
              key={row.entryId}
              className={`${styles.rowCard} ${row.isCurrentUser ? styles.currentRow : ""}`}
              open={Boolean(row.isCurrentUser)}
            >
              <summary className={styles.rowSummary}>
                <span
                  className={`${styles.rowRank} ${index < 3 ? styles.topRank : ""}`}
                >
                  {index + 1}
                </span>

                <div className={styles.rowIdentity}>
                  <strong>{row.displayName}</strong>
                  {row.isCurrentUser ? <span className={styles.currentBadge}>Tu demo</span> : null}
                  <span className={styles.rowMeta}>{row.department}</span>
                </div>

                <div>
                  <b>{row.total} pts</b>
                  <small>
                    {row.scoredUnits}/{scoringLegend.totalUnits} unidades puntuadas
                  </small>
                </div>
              </summary>

              <div className={styles.rowBody}>
                {row.note ? <p className={styles.rowNote}>{row.note}</p> : null}

                <div className={styles.breakdownGrid}>
                  {getBreakdownItems(row).map((item) => (
                    <article key={item.label} className={styles.breakdownCard}>
                      <span>{item.label}</span>
                      <strong>{item.value} pts</strong>
                      <span>{item.help}</span>
                    </article>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.legendCard}>
        <p className={styles.eyebrow}>Recomendacion de producto</p>
        <p>
          Para venderlo a empresas, conviene mostrar el desglose por etapas para todos y dejar
          el detalle partido por partido solo para la vista personal o admin.
        </p>
        <ul className={styles.legendList}>
          <li>Publico general: total de puntos y desglose por fase.</li>
          <li>Jugador propio: detalle mas fino de donde sumo y donde dejo puntos.</li>
          <li>Admin: acceso completo si despues quieren auditar resultados o reglas.</li>
        </ul>
      </section>

      {!hasCurrentPrediction ? (
        <section className={styles.emptyCard}>
          <p className={styles.eyebrow}>Tu lugar</p>
          <p>
            Cuando completes tu prediccion en esta demo, la vamos a mezclar automaticamente con
            el ranking para que puedas mostrar una experiencia mas real.
          </p>
        </section>
      ) : null}
    </main>
  );
}
