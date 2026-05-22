import type { ReactNode } from "react";

import type { CorporateClient } from "@/lib/corporate/types";
import { CorporateHeader } from "./corporate-header";
import styles from "./corporate-shell.module.css";

interface CorporateShellProps {
  client: CorporateClient;
  children: ReactNode;
  participantName?: string;
}

export function CorporateShell({
  client,
  children,
  participantName,
}: CorporateShellProps) {
  const cssVars = {
    "--client-primary": client.branding.primary,
    "--client-primary-hover": client.branding.primaryHover,
    "--client-on-primary": client.branding.contrastOnPrimary,
    "--client-glow": `${client.branding.primary}24`,
    "--client-eyebrow": "#c8000a",
  } as React.CSSProperties;

  return (
    <div className={styles.shell} style={cssVars}>
      <CorporateHeader client={client} participantName={participantName} />
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <span>{client.displayName} · Predicciones internas</span>
        <span>No es un producto oficial de FIFA · Solo para uso interno</span>
      </footer>
    </div>
  );
}
