import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  server: (process.env.POLAR_SERVER as "production" | "sandbox") || "production",
});

/**
 * Helper to check if Polar server access token is configured.
 */
export function isPolarConfigured(): boolean {
  return Boolean(process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_ACCESS_TOKEN.trim() !== "");
}
