export const DEV_AUTH_COOKIE = "dev-auth";

export type DevAuthRole = "TEACHER" | "STUDENT";

export type DevAuthClientSession = {
  role: DevAuthRole;
  name: string;
  email: string;
};

import { config } from "./env";

export function isDevAuthEnabled() {
  return config.app.isDev && config.features.devAuth;
}

export function isAllowedDevRole(role: string): role is DevAuthRole {
  return role === "TEACHER" || role === "STUDENT";
}

export function sanitizeDevAuthName(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 80);
}

export function sanitizeDevAuthEmail(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 120);
}
