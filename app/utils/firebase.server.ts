import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, push, get } from "firebase/database";

let app: ReturnType<typeof getApp> | undefined;
let db: ReturnType<typeof getDatabase> | undefined;

/**
 * Initialize Firebase app and DB
 */
function getFirebaseApp(): { app: ReturnType<typeof getApp>; db: ReturnType<typeof getDatabase> } {
    if (app && db) return { app, db };

    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY!,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
        databaseURL: process.env.FIREBASE_DATABASE_URL!,
        projectId: process.env.FIREBASE_PROJECT_ID!,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.FIREBASE_APP_ID!,
    };

    if (!firebaseConfig.apiKey) throw new Error("Firebase environment config not set");

    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getDatabase(app);

    return { app, db };
}

/**
 * Add a client to RTDB
 */
export async function addClientToRTDB(client: any) {
    const { db } = getFirebaseApp();
    const clientsRef = ref(db, "clients");
    const newClientRef = await push(clientsRef, client);
    return newClientRef.key;
}

/**
 * Get all clients from RTDB
 */
export async function getClientList() {
    const { db } = getFirebaseApp();
    const clientsRef = ref(db, "clients");
    const snapshot = await get(clientsRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data).map(([key, value]: [string, any]) => ({
        key,
        ...value,
    }));
}

/**
 * Get a client by serial + signature
 */
export async function getClientByCredentials(serial: string, signature: string) {
    const { db } = getFirebaseApp();
    const clientsRef = ref(db, "clients");
    const snap = await get(clientsRef);
    if (!snap.exists()) return null;

    const data = snap.val();
    const found = Object.entries(data).find(
        ([, value]: [string, any]) =>
            value.stamp?.serial === serial && value.stamp?.signature === signature
    );

    if (!found) return null;
    const [key, value] = found;
    return { key, ...(value as object) };
}
