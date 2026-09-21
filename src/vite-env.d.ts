/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KIOSK_ID: string;
  readonly VITE_COUNTRY: string;
  readonly VITE_EXPERIENCE_NAME: string;
  readonly VITE_EVIUS_URL: string;
  readonly VITE_EVIUS_TOKEN: string;
  readonly VITE_EVIUS_EVENT_ID: string;
  readonly VITE_EVIUS_EXPERIENCE_ID: string;
  readonly VITE_RANKING_DB_URL: string;
  readonly VITE_RANKING_DB_API_KEY: string;
  readonly VITE_RANKING_DB_TABLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
