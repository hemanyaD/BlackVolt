/**
 * Admin gate — DEMO-GRADE, not real security.
 *
 * A single shared password guards the admin UI and the admin API routes. It is
 * a plain constant shared by client and server, which means it ships in the
 * client bundle and anyone can read it. That is an accepted tradeoff for this
 * prototype (the user opted into a client-side password gate). For real auth,
 * move this to a server-only credential check + httpOnly session cookie.
 *
 * This module must stay free of server-only imports so the client gate and the
 * API route guard can both import the same constant.
 */

/** The shared admin password. Change before any non-demo use. */
export const ADMIN_PASSWORD = "blackvolt-admin";

/** localStorage key holding the (demo) admin session token. */
export const ADMIN_SESSION_KEY = "blackvolt:admin";

/** Header the admin client sends so the API routes can check the password. */
export const ADMIN_AUTH_HEADER = "x-admin-password";

/** True if a request carries the correct admin password header. */
export function isAdminRequest(req: Request): boolean {
  return req.headers.get(ADMIN_AUTH_HEADER) === ADMIN_PASSWORD;
}
