import styles from "./group-page.module.css";

interface ScoringExplainerProps {
  compact?: boolean;
  enabled?: boolean;
}

export function ScoringExplainer({ compact = false, enabled = true }: ScoringExplainerProps) {
  return (
    <details className={compact ? styles.scoringExplainerCompact : styles.scoringExplainer}>
      <summary>
        <span className={styles.scoringQuestionMark} aria-hidden>
          ?
        </span>
        <span>
          {enabled
            ? "Como funciona el sistema de puntos"
            : "El sistema de puntos no esta activo en este grupo"}
        </span>
      </summary>

      <div className={styles.scoringExplainerBody}>
        {!enabled ? (
          <div className={styles.scoringExplainerNotice}>
            Este grupo puede guardar fixtures, pero no mostrar ranking por puntos.
          </div>
        ) : null}

        <div>
          <strong>Grupos</strong>
          <p>
            Cada equipo en el puesto exacto suma +2. Si acertaste que un equipo terminaba en el
            top 2, pero invertiste el 1-2, suma +1.
          </p>
        </div>

        <div>
          <strong>Mejores terceros</strong>
          <p>Cada tercero seleccionado que efectivamente avance a 16avos suma +2.</p>
        </div>

        <div>
          <strong>Eliminatoria</strong>
          <p>
            Se puntua por cruce acertado: 16avos +2, octavos +4, cuartos +6, semifinales +8,
            tercer puesto +8 y final +10.
          </p>
        </div>
      </div>
    </details>
  );
}
