// app/utils/firebase.client.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, signOut } from "firebase/auth";
import { getDatabase, ref, push, get } from "firebase/database";

let app, auth, db, googleProvider, githubProvider, twitterProvider;

if (typeof window !== "undefined") {
  const firebaseConfig = window.ENV?.FIREBASE_CONFIG;

  if (firebaseConfig && !getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDatabase(app);

    googleProvider = new GoogleAuthProvider();
    githubProvider = new GithubAuthProvider();
    twitterProvider = new TwitterAuthProvider();
  } else if (getApps().length) {
    app = getApp();
    auth = getAuth(app);
    db = getDatabase(app);

    googleProvider = new GoogleAuthProvider();
    githubProvider = new GithubAuthProvider();
    twitterProvider = new TwitterAuthProvider();
  }
}

export async function firebaseLogout() {
  if (auth) {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
}

export function getUserAvatar(user) {
  return user?.photoURL;
}

// Type for client data
type ClientData = {
  name: string;
  email: string;
  company?: string;
  stamp?: {
    serial: string;
    signature: string;
    seed: string;
    filePath: string;
    verificationUrl?: string;
  };
  project?: string;
  duration?: string;
  projectCost?: number;
  partialCost?: number;
  remainingCost?: number;
  isDue?: boolean;
  details?: string;
  key?: string;
};

// Function to add client to RTDB under `clients` node
export async function addClientToRTDB(client: ClientData) {
  if (!db) throw new Error("Firebase DB not initialized");
  const clientsRef = ref(db, "clients");
  const newClientRef = await push(clientsRef, client);
  return newClientRef.key;
}

export async function getClientList(): Promise<ClientData[]> {
  if (!db) throw new Error("Firebase DB not initialized");

  const clientsRef = ref(db, "clients");
  const snapshot = await get(clientsRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val();

  // Convert object of objects into an array with keys
  return Object.entries(data).map(([key, value]: [string, any]) => ({
    key,
    ...value,
  }));
}