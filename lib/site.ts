export function getSiteUrl(): string {
  const siteUrl = process.env.VERCEL_URL || "http://localhost:3000";

  return siteUrl.replace(/\/$/, "");
}
