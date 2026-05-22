import { notFound } from "next/navigation";

import { getCorporateClient } from "@/lib/corporate/clients";
import {
  getLeaderboardForClient,
  getOfficialResultsForClient,
} from "@/lib/corporate/db";
import { getCurrentParticipant } from "@/lib/corporate/session";
import styles from "@/components/corporate/corporate-shell.module.css";

export const dynamic = "force-dynamic";

export default async function LigaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = getCorporateClient(slug);
  if (!client) {
    notFound();
  }

  const [currentParticipant, rows, officialResults] = await Promise.all([
    getCurrentParticipant(client.slug),
    getLeaderboardForClient(client.slug),
    getOfficialResultsForClient(client.slug),
  ]);

  const totalResults = Object.keys(officialResults).length;
  const participantsWithPredictions = rows.filter(
    (row) => row.predictions_count > 0,
  ).length;

  return (
    <>
      <section className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionEyebrow}>Liga interna</span>
            <h2 className={styles.sectionTitle}>{client.shortName} · Mundial 2026</h2>
          </div>
          <p className={styles.sectionHint}>
            {rows.length}{" "}
            {rows.length === 1 ? "participante" : "participantes"} ·{" "}
            {participantsWithPredictions} con predicciones cargadas ·{" "}
            {totalResults}{" "}
            {totalResults === 1
              ? "resultado oficial"
              : "resultados oficiales"}{" "}
            cargados.
          </p>
        </div>
      </section>

      <div className={styles.leaderboardCard}>
        {rows.length === 0 ? (
          <p className={styles.leaderboardEmpty}>
            Todavía no hay participantes anotados. Sé el primero en armar tu
            predicción.
          </p>
        ) : (
          <table className={styles.leaderboardTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                {client.collectsArea ? <th>{client.areaLabel}</th> : null}
                <th>Predicciones</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isSelf = currentParticipant?.id === row.id;
                return (
                  <tr key={row.id} className={isSelf ? styles.leaderboardSelf : ""}>
                    <td className={styles.leaderboardRank}>{index + 1}</td>
                    <td>
                      {row.name}
                      {isSelf ? " (vos)" : ""}
                    </td>
                    {client.collectsArea ? <td>{row.area ?? "—"}</td> : null}
                    <td>{row.predictions_count}</td>
                    <td className={styles.leaderboardPoints}>{row.total_points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
