const ADMIN_SESSION_KEY = "hidden-path-admin-auth";
const ADMIN_PASSWORD = "Nutzungsdauer";

export function verifyAdminPassword(value: string) {
  return value.trim() === ADMIN_PASSWORD;
}

export function hasAdminSession() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

export function setAdminSession(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled) {
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
  } else {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
