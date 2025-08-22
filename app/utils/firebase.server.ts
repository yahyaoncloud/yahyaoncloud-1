import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, push, get } from "firebase/database";
import { environment } from "../environments/environment"; // <- import environment.ts

let app: ReturnType<typeof getApp>;
let db: ReturnType<typeof getDatabase>;

function getFirebaseApp() {
    if (app) return app;

    const firebaseConfig = {
        apiKey: environment.FIREBASE_API_KEY,
        authDomain: environment.FIREBASE_AUTH_DOMAIN,
        databaseURL: environment.FIREBASE_DATABASE_URL,
        projectId: environment.FIREBASE_PROJECT_ID,
        storageBucket: environment.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: environment.FIREBASE_MESSAGING_SENDER_ID,
        appId: environment.FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey) throw new Error("Firebase environment config not set");

    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getDatabase(app);
    return app;
}

// Add client to RTDB
export async function addClientToRTDB(client: any) {
    getFirebaseApp();
    const clientsRef = ref(db, "clients");
    const newClientRef = await push(clientsRef, client);
    return newClientRef.key;
}

// Get all clients from RTDB
export async function getClientList() {
    getFirebaseApp();
    const clientsRef = ref(db, "clients");
    const snapshot = await get(clientsRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data).map(([key, value]: [string, any]) => ({
        key,
        ...value,
    }));
}
export async function getClientByCredentials(serial: string, signature: string) {
    const { db } = getFirebaseApp();
    const clientsRef = ref(db, "clients");
    const snap = await get(clientsRef);
    if (!snap.exists()) return null;

    const data = snap.val();
    const found = Object.entries(data).find(
        ([key, value]: [string, any]) =>
            value.stamp?.serial === serial && value.stamp?.signature === signature
    );

    if (!found) return null;

    const [key, value] = found;
    return { key, ...(value as object) };
}