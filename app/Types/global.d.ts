export {};

declare global {
  interface Window {
    ENV: {
      FIREBASE_CONFIG: {
        apiKey: string;
        authDomain: string;
        databaseURL: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
      };
    };
  }
}
