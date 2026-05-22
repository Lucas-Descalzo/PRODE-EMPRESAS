"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getDemoLeaderboardPreview } from "@/lib/demo-ranking";

import styles from "./world-cup-app.module.css";

const STANDALONE_DRAFT_KEY = "fwc26-fixture-state";

export function LandingPage() {
  const [hasDraft, setHasDraft] = useState(false);
  const rankingPreview = getDemoLeaderboardPreview(4);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setHasDraft(Boolean(window.localStorage.getItem(STANDALONE_DRAFT_KEY)));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <main className={styles.pageShell}>
      <section className={styles.landingHero}>
        <div className={styles.landingHeroCopy}>
          <div className={styles.brandRow}>
            <Image
              src="/official/wc26-logo.png"
              alt="World Cup 26"
              width={70}
              height={105}
              className={styles.wcLogo}
              priority
            />
            <Image
              src="/official/fifa-logo-white.png"
              alt="FIFA"
              width={150}
              height={49}
              className={styles.fifaLogo}
            />
          </div>

          <p className={styles.eyebrow}>Fixture Mundial 2026</p>
          <h1 className={styles.heroTitle}>Arma tu fixture del Mundial 2026</h1>
          <p className={styles.heroCopy}>
            Juga la fase de grupos partido por partido, defini los mejores terceros y completa
            la eliminatoria por ganador directo en esta demo lista para presentar a empresas.
          </p>

          <div className={styles.heroActions}>
            <Link href="/mi-prediccion" className={styles.primaryAction}>
              Armar mi prediccion
            </Link>
            <Link href="/ranking" className={styles.secondaryAction}>
              Ver ranking demo
            </Link>
            {hasDraft ? (
              <Link href="/mi-prediccion" className={styles.secondaryAction}>
                Continuar mi prediccion
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.demoRankingPreview}>
        <div className={styles.demoRankingPreviewHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Ranking interno</p>
            <h2>Asi se veria la tabla de posiciones para una empresa</h2>
            <p className={styles.heroCopy}>
              Incluimos participantes de ejemplo para mostrar el look del ranking, el puntaje y
              el desglose por etapas sin necesidad de cargar usuarios reales.
            </p>
          </div>
          <Link href="/ranking" className={styles.secondaryAction}>
            Abrir ranking completo
          </Link>
        </div>

        <div className={styles.demoRankingPreviewList}>
          {rankingPreview.map((row, index) => (
            <article key={row.entryId} className={styles.demoRankingPreviewRow}>
              <span className={styles.demoRankingPreviewRank}>#{index + 1}</span>
              <div className={styles.demoRankingPreviewIdentity}>
                <strong>{row.displayName}</strong>
                <span>{row.department}</span>
              </div>
              <div className={styles.demoRankingPreviewPoints}>
                <strong>{row.total} pts</strong>
                <span>
                  {row.groupClassificationPoints + row.groupExactPositionPoints} grupos +{" "}
                  {row.roundOf32Points +
                    row.roundOf16Points +
                    row.quarterFinalPoints +
                    row.semiFinalPoints}{" "}
                  knockout
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <nav className={styles.landingSecondaryNav} aria-label="Paginas adicionales">
        <Link href="/ranking">Ranking</Link>
        <Link href="/calendario">Calendario</Link>
        <Link href="/ayuda">Ayuda</Link>
      </nav>
    </main>
  );
}
