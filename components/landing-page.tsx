"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
    tag: "Visible en la demo",
    copy:
      "La empresa completa toda la experiencia antes del Mundial: grupos, mejores terceros y cuadro final.",
    points: [
      "La fase de grupos puntua por posicion final confirmada.",
      "Los mejores terceros se eligen una sola vez antes del torneo.",
      "La eliminatoria se completa entera por clasificado, sin marcador.",
    ],
  },
  {
    title: "Modo Live",
    tag: "Formato sugerido",
    copy:
      "Mantiene el mismo pre-Mundial del modo simple, pero la eliminatoria se juega partido a partido durante el torneo.",
    points: [
      "Comparte grupos y mejores terceros cargados antes del debut.",
      "Cada cruce eliminatorio se habilita cuando queda confirmado.",
      "Se vende comercialmente, pero no se muestra como flujo jugable en esta demo.",
    ],
  },
];

const scoringBlocks = [
  {
    title: "Pre-Mundial",
    subtitle: "Base comun para ambos modos",
    items: [
      "Equipo en puesto exacto: +2",
      "Top 2 correcto pero 1-2 invertido: +1",
      "Cada mejor tercero acertado: +2",
      "Maximo de esta etapa: 112 puntos",
    ],
  },
  {
    title: "Modo Simple",
    subtitle: "Cuadro completo antes del torneo",
    items: [
      "16avos: +2 por clasificado acertado",
      "Octavos: +4 por clasificado acertado",
      "Cuartos: +6 por clasificado acertado",
      "Semis: +8, tercer puesto: +8 y final: +10",
    ],
  },
  {
    title: "Modo Live",
    subtitle: "Eliminatoria partido a partido",
    items: [
      "Solo resultado, ganador + diferencia o marcador exacto",
      "Cada fase aumenta el valor del acierto",
      "Si pronostica empate, tambien define quien clasifica",
      "Pensado para generar mas dispersion en el ranking",
    ],
  },
];

const faqItems = [
  {
    question: "Que muestra exactamente esta demo?",
    answer:
      "Muestra la plataforma como la veria una empresa en el modo simple: home, flujo de prediccion, ranking de muestra y formato general del producto.",
  },
  {
    question: "El G/E/P suma puntos por si solo?",
    answer:
      "No. En grupos funciona como ayuda opcional para pensar el orden final. Lo que puntua realmente es la posicion final confirmada de cada equipo en su grupo.",
  },
  {
    question: "Por que el modo live no se simula completo en la demo?",
    answer:
      "Porque antes del Mundial no existe una forma natural de navegar toda la eliminatoria live. Se explica como formato sugerido, pero la experiencia visible queda enfocada en el modo simple.",
  },
  {
    question: "Que se ve en el ranking?",
    answer:
      "Una tabla interna con nombres de ejemplo, puntaje total y desglose por etapas. Es la profundidad justa para mostrar el producto sin volverlo tecnico ni pesado.",
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

  const heroPills = useMemo(
    () => [
      "Demo enfocada en Modo Simple",
      "Ranking de muestra incluido",
      "Modo Live explicado dentro de la propuesta",
    ],
    [],
  );

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
          <span>PRODE EMPRESAS DEMO</span>
        </Link>

        <nav className={styles.landingTopNav} aria-label="Navegacion de producto">
          <a href="#modos-de-juego">Modos de juego</a>
          <a href="#como-se-puntua">Como se puntua</a>
          <a href="#faq-demo">FAQ</a>
        </nav>

        <div className={styles.landingTopActions}>
          <Link href="/ranking" className={styles.secondaryAction}>
            Ranking
          </Link>
          <Link href="/mi-prediccion" className={styles.primaryAction}>
            Ver demo
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

          <p className={styles.eyebrow}>Demo del producto</p>
          <h1 className={styles.heroTitle}>Mostra la plataforma tal como la compraria una empresa</h1>
          <p className={styles.heroCopy}>
            La demo publica deja visible el Modo Simple para que puedan entender el formato,
            recorrer la experiencia y ver como se presentaria un ranking interno.
          </p>

          <div className={styles.landingPillRow}>
            {heroPills.map((pill) => (
              <span key={pill} className={styles.landingPill}>
                {pill}
              </span>
            ))}
          </div>

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

      <section id="modos-de-juego" className={styles.landingInfoSection}>
        <div className={styles.landingSectionHeader}>
          <p className={styles.sectionEyebrow}>Modos de juego</p>
          <h2>Dos formatos claros para vender el producto</h2>
          <p>
            La demo publica queda centrada en el modo simple. El modo live se explica como opcion
            comercial para empresas que quieran sostener el juego durante todo el torneo.
          </p>
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
                <em>{mode.tag}</em>
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

      <section id="como-se-puntua" className={styles.landingInfoSection}>
        <div className={styles.landingSectionHeader}>
          <p className={styles.sectionEyebrow}>Como se puntua</p>
          <h2>Un sistema consistente entre etapas</h2>
          <p>
            El puntaje combina una base fuerte pre-Mundial con una eliminatoria que gana peso a
            medida que avanza el torneo.
          </p>
        </div>

        <div className={styles.landingScoringGrid}>
          {scoringBlocks.map((block) => (
            <article key={block.title} className={styles.landingScoringCard}>
              <p className={styles.landingScoringEyebrow}>{block.subtitle}</p>
              <strong>{block.title}</strong>
              <ul className={styles.landingInfoList}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
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
              La idea no es simular usuarios reales, sino mostrar de forma clara como se verian el
              puntaje, las posiciones y el desglose por etapas.
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

      <section id="faq-demo" className={styles.landingInfoSection}>
        <div className={styles.landingSectionHeader}>
          <p className={styles.sectionEyebrow}>FAQ</p>
          <h2>Preguntas que conviene responder en la misma demo</h2>
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
