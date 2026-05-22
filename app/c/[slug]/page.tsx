import { notFound } from "next/navigation";
import Link from "next/link";

import { getCorporateClient } from "@/lib/corporate/clients";
import styles from "@/components/corporate/corporate-shell.module.css";

export default async function CorporateLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = getCorporateClient(slug);

  if (!client) {
    notFound();
  }

  const areaCopy =
    client.collectsArea && client.areaLabel
      ? `, ${client.areaLabel.toLowerCase()}`
      : "";
  const codeCopy = client.accessCodeRequired ? " y código interno" : "";

  return (
    <>
      <section className={styles.landingHero}>
        <span className={styles.landingEyebrow}>{client.tagline}</span>
        <h1 className={styles.landingTitle}>{client.displayName}</h1>
        <p className={styles.landingCopy}>
          Predecí los partidos del Mundial 2026 partido a partido. En fase de
          grupos elegís ganador o empate; en eliminatorias ponés el resultado
          exacto. Cada acierto suma puntos en el ranking interno.
        </p>
        <Link href={`/c/${client.slug}/partidos`} className={styles.landingCta}>
          Empezar a jugar →
        </Link>
      </section>

      <section className={styles.featureGrid}>
        <article className={styles.featureCard}>
          <span className={styles.featureNumber}>1</span>
          <h2 className={styles.featureTitle}>Ingresá tus datos</h2>
          <p className={styles.featureCopy}>
            Nombre, mail{areaCopy}{codeCopy}. Sin contraseñas, sin instalar
            nada.
          </p>
        </article>

        <article className={styles.featureCard}>
          <span className={styles.featureNumber}>2</span>
          <h2 className={styles.featureTitle}>Predecí cada partido</h2>
          <p className={styles.featureCopy}>
            Fase de grupos: ganador o empate. Partidos clave y eliminatorias:
            resultado exacto. Los partidos jugados se bloquean
            automáticamente.
          </p>
        </article>

        <article className={styles.featureCard}>
          <span className={styles.featureNumber}>3</span>
          <h2 className={styles.featureTitle}>Subí en el ranking</h2>
          <p className={styles.featureCopy}>
            Resultado exacto vale 3 puntos, ganador correcto vale 1. Ranking en
            tiempo real para toda la empresa.
          </p>
        </article>
      </section>
    </>
  );
}
