"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./world-cup-app.module.css";

const STANDALONE_DRAFT_KEY = "fwc26-fixture-state";

export function LandingPage() {
  const [hasDraft, setHasDraft] = useState(false);

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
          <h1 className={styles.heroTitle}>Armá tu fixture del Mundial 2026</h1>
          <p className={styles.heroCopy}>
            Armá tu predicción del Mundial y compartila como imagen en esta
            demo lista para presentar a empresas.
          </p>

          <div className={styles.heroActions}>
            <Link href="/mi-prediccion" className={styles.primaryAction}>
              Armar mi predicción
            </Link>
            {hasDraft ? (
              <Link href="/mi-prediccion" className={styles.secondaryAction}>
                Continuar mi predicción
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <nav className={styles.landingSecondaryNav} aria-label="Páginas adicionales">
        <Link href="/calendario">Calendario</Link>
        <Link href="/ayuda">Ayuda</Link>
      </nav>
    </main>
  );
}
