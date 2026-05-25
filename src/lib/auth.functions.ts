import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  attemptLogin,
  clearSessionCookie,
  getSessionFromCookie,
  setSessionCookie,
  signAdmin,
} from "./auth.server";

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().email().max(200),
        password: z.string().min(1).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const user = await attemptLogin(data.email, data.password);
    if (!user) return { ok: false as const, error: "Credenciais inválidas" };
    const token = signAdmin({ sub: user.id, email: user.email });
    setSessionCookie(token);
    return { ok: true as const, email: user.email };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  clearSessionCookie();
  return { ok: true };
});

export const adminMe = createServerFn({ method: "GET" }).handler(async () => {
  const s = getSessionFromCookie();
  return { authenticated: !!s, email: s?.email ?? null };
});
