const ADMIN_PASSWORD = "Nutzungsdauer";

export function verifyAdminPassword(value: string) {
  return value.trim() === ADMIN_PASSWORD;
}
