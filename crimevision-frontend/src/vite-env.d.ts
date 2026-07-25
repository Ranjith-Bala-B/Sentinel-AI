/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CATALYST_PROJECT_ID: string;
  readonly VITE_CATALYST_ENV: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
