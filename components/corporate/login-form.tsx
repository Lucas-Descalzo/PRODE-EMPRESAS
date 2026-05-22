"use client";

import { useActionState } from "react";

import { loginAction, type LoginActionState } from "@/app/c/[slug]/partidos/actions";
import type { CorporateClient } from "@/lib/corporate/types";
import styles from "./corporate-shell.module.css";

interface LoginFormProps {
  client: CorporateClient;
}

const INITIAL_STATE: LoginActionState = {};

export function LoginForm({ client }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} className={styles.formCard}>
      <input type="hidden" name="slug" value={client.slug} />

      <div className={styles.formTitleBlock}>
        <span className={styles.formEyebrow}>Ingresar</span>
        <h2 className={styles.formTitle}>Sumate al ranking interno</h2>
      </div>

      {client.accessCodeRequired && client.accessCode ? (
        <p className={styles.formHint}>
          Demo: usá el código <strong>{client.accessCode}</strong> para entrar.
          En producción cada empresa reparte el suyo a sus empleados.
        </p>
      ) : null}

      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label htmlFor="login-name">Nombre y apellido</label>
          <input
            id="login-name"
            name="name"
            type="text"
            placeholder="Ej: María González"
            autoComplete="name"
            required
            minLength={2}
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="login-email">Email corporativo</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="maria@empresa.com"
            autoComplete="email"
            required
          />
        </div>

        {client.collectsArea ? (
          <div className={styles.formField}>
            <label htmlFor="login-area">{client.areaLabel ?? "Área"}</label>
            <input
              id="login-area"
              name="area"
              type="text"
              placeholder="Ej: Marketing"
              autoComplete="organization"
              required
            />
          </div>
        ) : null}

        {client.accessCodeRequired ? (
          <div className={styles.formField}>
            <label htmlFor="login-code">Código interno</label>
            <input
              id="login-code"
              name="code"
              type="text"
              placeholder="Te lo dieron en RRHH"
              autoCapitalize="characters"
              spellCheck={false}
              required
            />
          </div>
        ) : null}
      </div>

      {state.error ? <p className={styles.formError}>{state.error}</p> : null}

      <button type="submit" className={styles.formSubmit} disabled={isPending}>
        {isPending ? "Ingresando…" : "Empezar a jugar"}
      </button>
    </form>
  );
}
