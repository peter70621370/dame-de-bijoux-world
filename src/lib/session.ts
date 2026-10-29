import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Session du back-office : un jeton signé dans un cookie httpOnly, valable 7 jours.

export const SESSION_COOKIE = "ddb_session";
const DUREE_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  adminId: string;
  /** Copie de AdminUser.sessionVersion au moment de la connexion. */
  version: number;
};

function cle() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET n'est pas défini (voir .env.example).");
  return new TextEncoder().encode(secret);
}

export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, cle(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.v !== "number") return null;
    return { adminId: payload.sub, version: payload.v };
  } catch {
    return null;
  }
}

export async function createSession({ adminId, version }: SessionPayload) {
  const expires = new Date(Date.now() + DUREE_MS);
  const token = await new SignJWT({ v: version })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(cle());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Vercel sert toujours en HTTPS ; en local, `next dev` tourne en HTTP.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function readSession() {
  return decryptSession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
