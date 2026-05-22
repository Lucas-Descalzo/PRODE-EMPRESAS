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

          <p className={styles.eyebrow}>Demo del modo simple</p>
          <h1 className={styles.heroTitle}>Mostra la plataforma tal como la veria una empresa</h1>
          <p className={styles.heroCopy}>
            Esta demo reproduce la experiencia pre-Mundial: ordenar grupos, elegir los mejores
            terceros, completar todo el cuadro y ver un ranking de muestra.
          </p>

          <div className={styles.heroActions}>
            <Link href="/mi-prediccion" className={styles.primaryAction}>
              Ver la plataforma
            </Link>
            <Link href="/ranking" className={styles.secondaryAction}>
              Ver ranking de muestra
            </Link>
            {hasDraft ? (
              <Link href="/mi-prediccion" className={styles.secondaryAction}>
                Continuar demo
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.landingSteps}>
        <article>
          <span>1</span>
          <strong>Grupos</strong>
          <p>La prediccion puntua por posicion final de cada grupo.</p>
        </article>
        <article>
          <span>2</span>
          <strong>Mejores terceros</strong>
          <p>Se eligen los ocho terceros que avanzan a 16avos.</p>
        </article>
        <article>
          <span>3</span>
          <strong>Cuadro completo</strong>
          <p>La eliminatoria se completa entera antes del inicio del torneo.</p>
        </article>
        <article>
          <span>4</span>
          <strong>Ranking</strong>
          <p>La tabla muestra como se veria el resultado dentro de una empresa.</p>
        </article>
      </section>

      <section className={styles.demoRankingPreview}>
        <div className={styles.demoRankingPreviewHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Ranking de muestra</p>
            <h2>Asi se ve la tabla interna para una empresa</h2>
          </div>
          <Link href="/ranking" className={styles.secondaryAction}>
            Abrir ranking
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
                  {row.groupExactPositionPoints + row.groupTopTwoPoints + row.bestThirdPoints}{" "}
                  pre-Mundial +{" "}
                  {row.roundOf32Points +
                    row.roundOf16Points +
                    row.quarterFinalPoints +
                    row.semiFinalPoints +
                    row.thirdPlaceMatchPoints +
                    row.finalPoints}{" "}
                  cuadro
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
