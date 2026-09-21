/**
 * Per-country/per-deployment configuration. Every value comes from Vite env
 * vars (`.env.<mode>` or the hosting platform's env config) — never
 * hardcoded, never shared between the Mexico/Colombia deployments.
 */

function readOptional(key: string): string | undefined {
  const value = import.meta.env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readRequired(key: string): string {
  const value = readOptional(key);
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const env = {
  country: readRequired("VITE_COUNTRY"),
  kioskId: readOptional("VITE_KIOSK_ID") ?? "unknown",

  evius: {
    url: readOptional("VITE_EVIUS_URL"),
    token: readOptional("VITE_EVIUS_TOKEN"),
    eventId: readOptional("VITE_EVIUS_EVENT_ID"),
    experienceId: readOptional("VITE_EVIUS_EXPERIENCE_ID"),
    /** "source" on /attendees — same knob as the catalog's EXPERIENCE_NAME. */
    experienceName: readOptional("VITE_EXPERIENCE_NAME") ?? "Mirage - Memory Match",
  },

  /** Shared Supabase (or equivalent) ranking store. Left unconfigured until the schema lands. */
  rankingDb: {
    url: readOptional("VITE_RANKING_DB_URL"),
    apiKey: readOptional("VITE_RANKING_DB_API_KEY"),
    table: readOptional("VITE_RANKING_DB_TABLE") ?? "participations",
  },
};

export const RANKING_EXPERIENCE = "memory_match";
