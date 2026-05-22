"use client";

import { useActionState } from "react";

import { adminLoginAction, type AdminLoginState } from "@/app/c/[slug]/admin/actions";
import type { CorporateClient } from "@/lib/corporate/types";
import styles from "./corporate-shell.module.css";

interface AdminLoginProps {
  client: CorporateClient;
}

const INITIAL: AdminLoginState = {};

export function AdminLogin({ client }: AdminLoginProps) {
  const [state, formAction, isPending] = useActionState(adminLoginAction, INITIAL);

  return (
    <form action={formAction} className={styles.formCard}>
      <input type="hidden" name="slug" value={client.slug} />

      <div className={styles.formTitleBlock}>
        <span className={styles.formEyebrow}>Panel administrador</span>
        <h2 className={styles.formTitle}>Cargar resultados oficiales</h2>
      </div>

      <p className={styles.formHint}>
        Demo: la contraseña admin es <strong>{client.adminPassword}</strong>.
      </p>

      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label htmlFor="admin-pw">Contraseña</label>
          <input
            id="admin-pw"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      {state.error ? <p className={styles.formError}>{state.error}</p> : null}

      <button type="submit" className={styles.formSubmit} disabled={isPending}>
        {isPending ? "Ingresando…" : "Entrar al panel"}
      </button>
    </form>
  );
}
