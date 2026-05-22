"use client";

import Link from "next/link";

import {
  getDemoLeaderboard,
  type DemoLeaderboardRow,
} from "@/lib/demo-ranking";

import styles from "./demo-ranking.module.css";

function getBreakdownItems(row: DemoLeaderboardRow) {
  return [
    {
      label: "Posiciones exactas",
      value: row.groupExactPositionPoints,
      help: "Equipos ubicados en su puesto final correcto.",
    },
    {
      label: "Top 2 en otro orden",
      value: row.groupTopTwoPoints,
      help: "Clasificados bien detectados aunque el 1-2 haya quedado invertido.",
    },
    {
      label: "Mejores terceros",
      value: row.bestThirdPoints,
      help: "Terceros que elegiste y efectivamente avanzan.",
    },
    {
      label: "16avos y octavos",
      value: row.roundOf32Points + row.roundOf16Points,
      help: "Cruces acertados en la primera mitad del cuadro.",
    },
    {
      label: "Cuartos y semis",
      value: row.quarterFinalPoints + row.semiFinalPoints,
      help: "Picks correctos en las instancias decisivas.",
    },
    {
      label: "Tercer puesto y final",
      value: row.thirdPlaceMatchPoints + row.finalPoints,
      help: "Ultimos dos partidos del torneo.",
    },
  ];
}

export function DemoRankingPage() {
  const rows = getDemoLeaderboard();

  return (
    <main className={styles.pageShell}>
      <section className={styles.heroCard}>
        <p className={styles.eyebrow}>Ranking de muestra</p>
        <h1>Una vista simple del ranking interno</h1>
        <p>
          Esta pagina muestra como se veria la tabla de posiciones en una empresa usando el modo
          simple: grupos, mejores terceros y cuadro completo cargados antes del Mundial.
        </p>

        <div className={styles.heroActions}>
          <Link href="/mi-prediccion" className={styles.primaryAction}>
            Ver la plataforma
          </Link>
          <Link href="/" className={styles.secondaryAction}>
            Volver al inicio
          </Link>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <article>
          <p className={styles.summaryLabel}>Participantes</p>
          <strong>{rows.length}</strong>
          <span>Ejemplos cargados para mostrar formato, puntaje y orden.</span>
        </article>
        <article>
          <p className={styles.summaryLabel}>Modo</p>
          <strong>Simple</strong>
          <span>Pre-Mundial, con cuadro completo y ranking por etapas.</span>
        </article>
        <article>
          <p className={styles.summaryLabel}>Puntaje maximo</p>
          <strong>234 pts</strong>
          <span>112 del pre-Mundial y 122 de eliminatoria.</span>
        </article>
      </section>

      <section className={styles.leaderboardCard}>
        <div className={styles.leaderboardHeader}>
          <p className={styles.eyebrow}>Tabla de posiciones</p>
          <h2>Ranking general</h2>
          <p className={styles.leaderboardHint}>
            Cada fila se despliega para mostrar de donde sale el puntaje sin sobrecargar la
            pantalla principal.
          </p>
        </div>

        <div className={styles.leaderboardList}>
          {rows.map((row, index) => (
            <details key={row.entryId} className={styles.rowCard}>
              <summary className={styles.rowSummary}>
                <span className={`${styles.rowRank} ${index < 3 ? styles.topRank : ""}`}>
                  {index + 1}
                </span>

                <div className={styles.rowIdentity}>
                  <strong>{row.displayName}</strong>
                  <span className={styles.rowMeta}>{row.department}</span>
                </div>

                <div>
                  <b>{row.total} pts</b>
                  <small>
                    {row.groupExactPositionPoints + row.groupTopTwoPoints + row.bestThirdPoints}{" "}
                    pre-Mundial +{" "}
                    {row.roundOf32Points +
                      row.roundOf16Points +
                      row.quarterFinalPoints +
                      row.semiFinalPoints +
                      row.thirdPlaceMatchPoints +
                      row.finalPoints}{" "}
                    cuadro
                  </small>
                </div>
              </summary>

              <div className={styles.rowBody}>
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
    </main>
  );
}
