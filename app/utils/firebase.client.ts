// firebase.client.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signOut,
} from "firebase/auth";
import { getDatabase } from "firebase/database";

let app;
let auth;
let db;
let googleProvider;
let githubProvider;
let twitterProvider;

// Safe Firebase init (works on both server/client)
if (typeof window !== "undefined") {
  const firebaseConfig = window.ENV?.FIREBASE_CONFIG;

  if (firebaseConfig) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getDatabase(app);

    googleProvider = new GoogleAuthProvider();
    githubProvider = new GithubAuthProvider();
    twitterProvider = new TwitterAuthProvider();
  }
}

// 🔓 Logout function
export async function firebaseLogout() {
  if (auth) {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
}

// 🖼️ Get user avatar URL (null-safe)
export function getUserAvatar(user) {
  return user?.photoURL || "/default-avatar.png";
}

export { app, auth, db, googleProvider, githubProvider, twitterProvider };
