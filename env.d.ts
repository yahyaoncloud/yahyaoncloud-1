/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

interface WindowEnv {
  SUPABASE_ID?: string;
  SUPABASE_ANON?: string;
  SUPABASE_URL?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  NODE_ENV?: string;
  FIREBASE_CONFIG?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
    databaseURL?: string;
  };
}

declare global {
  interface Window {
    ENV?: WindowEnv;
  }
}

export {};
