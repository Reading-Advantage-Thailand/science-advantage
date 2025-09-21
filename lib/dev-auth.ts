export const DEV_AUTH_COOKIE = "dev-auth";

export type DevAuthRole = "TEACHER" | "STUDENT";

export type DevAuthClientSession = {
  role: DevAuthRole;
  name: string;
  email: string;
};

export function isDevAuthEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEV_AUTH === "true"
  );
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
