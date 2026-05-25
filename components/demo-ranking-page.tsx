"use client";

import Link from "next/link";

import { getDemoLeaderboard } from "@/lib/demo-ranking";

import styles from "./demo-ranking.module.css";

export function DemoRankingPage() {
  const rows = getDemoLeaderboard();

  return (
    <main className={styles.pageShell}>
      <section className={styles.heroCard}>
        <p className={styles.eyebrow}>Ranking interno</p>
        <h1>Asi se ve el ranking interno</h1>
        <p>
          Cada persona compite en una tabla con su nombre y su area. Un puntaje, una posicion, y
          la charla asegurada en la oficina.
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

      <section className={styles.leaderboardCard}>
        <div className={styles.leaderboardHeader}>
          <p className={styles.eyebrow}>Tabla de posiciones</p>
          <h2>Ranking general</h2>
        </div>

        <div className={styles.leaderboardList}>
          {rows.map((row, index) => (
            <article key={row.entryId} className={styles.rowCard}>
              <div className={styles.rowSummary}>
                <span className={`${styles.rowRank} ${index < 3 ? styles.topRank : ""}`}>
                  {index + 1}
                </span>

                <div className={styles.rowIdentity}>
                  <strong>{row.displayName}</strong>
                  <span className={styles.rowMeta}>{row.department}</span>
                </div>

                <div>
                  <b>{row.total} pts</b>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
