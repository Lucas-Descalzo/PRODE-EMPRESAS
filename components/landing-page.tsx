"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getDemoLeaderboardPreview } from "@/lib/demo-ranking";

import styles from "./world-cup-app.module.css";

const STANDALONE_DRAFT_KEY = "fwc26-fixture-state";
const FIRST_MATCH_AT = Date.parse("2026-06-11T18:00:00Z");

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

function getCountdown() {
  const difference = Math.max(0, FIRST_MATCH_AT - Date.now());
  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: pad2(days),
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
  };
}

const playModes = [
  {
    title: "Modo Simple",
    copy:
      "Se completa una sola vez antes del Mundial: grupos, mejores terceros y cuadro.",
    points: [
      "Despues cada uno sigue su posicion en el ranking durante el torneo.",
      "Es la forma mas facil de sumar a todo el equipo.",
      "Ideal para participar sin depender del dia a dia de cada partido.",
    ],
  },
  {
    title: "Modo Live",
    copy:
      "Lo mismo antes del Mundial, pero la eliminatoria se sigue partido a partido, en vivo, durante todo el torneo.",
    points: [
      "Mantiene la conversacion activa semana a semana.",
      "Cada cruce suma un nuevo momento para volver a jugar.",
      "Extiende la experiencia durante todo el torneo.",
    ],
  },
];

const faqItems = [
  {
    question: "Cuanto trabajo me da?",
    answer:
      "Cero. Nosotros configuramos, cargamos y operamos todo. Vos solo compartis el link con tu equipo.",
  },
  {
    question: "Puede jugar gente que no es fanatica del futbol?",
    answer:
      "Si. Se completa una vez y listo; no hace falta saber de futbol para participar.",
  },
  {
    question: "Lleva el logo y los colores de mi empresa?",
    answer:
      "Si. La plataforma se personaliza con la identidad de tu marca.",
  },
  {
    question: "Cuando conviene arrancar?",
    answer:
      "Antes del 11 de junio. Cuanto antes, mejor, para que el equipo tenga tiempo de cargar.",
  },
];

export function LandingPage() {
  const [hasDraft, setHasDraft] = useState(false);
  const [countdown, setCountdown] = useState(() => getCountdown());
  const rankingPreview = getDemoLeaderboardPreview(4);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setHasDraft(Boolean(window.localStorage.getItem(STANDALONE_DRAFT_KEY)));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className={styles.pageShell}>
      <header className={styles.landingTopBar}>
        <Link href="#inicio" className={styles.landingTopBrand}>
          <Image
            src="/official/wc26-logo.png"
            alt="World Cup 26"
            width={34}
            height={50}
            className={styles.headerBrandLogo}
            priority
          />
          <span>PRODE EMPRESAS</span>
        </Link>

        <nav className={styles.landingTopNav} aria-label="Navegacion de producto">
          <a href="#modos-de-juego">Modos de juego</a>
          <a href="#faq-demo">FAQ</a>
        </nav>

        <div className={styles.landingTopActions}>
          <Link href="/ranking" className={styles.secondaryAction}>
            Ranking
          </Link>
          <Link href="/mi-prediccion" className={styles.primaryAction}>
            Ver la plataforma
          </Link>
        </div>
      </header>

      <section className={styles.landingCountdownStrip} aria-label="Cuenta regresiva">
        <div className={styles.landingCountdownLabel}>
          <strong>Faltan para el primer partido del Mundial 2026</strong>
          <span>11 de junio de 2026, segun el calendario oficial de FIFA</span>
        </div>

        <div className={styles.landingCountdownGrid}>
          <div className={styles.landingCountdownUnit}>
            <strong>{countdown.days}</strong>
            <span>Dias</span>
          </div>
          <div className={styles.landingCountdownUnit}>
            <strong>{countdown.hours}</strong>
            <span>Hs</span>
          </div>
          <div className={styles.landingCountdownUnit}>
            <strong>{countdown.minutes}</strong>
            <span>Min</span>
          </div>
          <div className={styles.landingCountdownUnit}>
            <strong>{countdown.seconds}</strong>
            <span>Seg</span>
          </div>
        </div>
      </section>

      <section id="inicio" className={styles.landingHero}>
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

          <p className={styles.eyebrow}>Prode corporativo</p>
          <h1 className={styles.heroTitle}>Vivan el Mundial en equipo</h1>
          <p className={styles.heroCopy}>
            Un prode del Mundial 2026 con la cara de tu empresa. Todos juegan y compiten en un
            ranking interno y la operacion la hacemos nosotros, de principio a fin.
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
                Continuar mi prediccion
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section id="modos-de-juego" className={styles.landingInfoSection}>
        <div className={styles.landingSectionHeader}>
          <p className={styles.sectionEyebrow}>Modos de juego</p>
          <h2>Dos formas de jugarlo</h2>
          <p>Elegis la dinamica que mejor encaja con tu equipo y con el ritmo del torneo.</p>
        </div>

        <div className={styles.landingInfoGrid}>
          {playModes.map((mode, index) => (
            <article
              key={mode.title}
              className={`${styles.landingInfoCard} ${
                index === 0 ? styles.landingInfoCardFeatured : ""
              }`}
            >
              <div className={styles.landingInfoTop}>
                <div>
                  <strong>{mode.title}</strong>
                  <span>{mode.copy}</span>
                </div>
              </div>

              <ul className={styles.landingInfoList}>
                {mode.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.demoRankingPreview}>
        <div className={styles.demoRankingPreviewHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Ranking de muestra</p>
            <h2>Asi se veria la tabla interna para una empresa</h2>
            <p className={styles.heroCopy}>
              Cada persona compite con su nombre y su area en una tabla clara, simple y facil de
              seguir durante todo el Mundial.
            </p>
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
                <span>Puntaje actual</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="faq-demo" className={styles.landingInfoSection}>
        <div className={styles.landingSectionHeader}>
          <p className={styles.sectionEyebrow}>FAQ</p>
          <h2>Preguntas frecuentes</h2>
        </div>

        <div className={styles.landingFaqGrid}>
          {faqItems.map((item) => (
            <details key={item.question} className={styles.landingFaqItem}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
