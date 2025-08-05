// app/utils/firebase.client.ts

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

if (typeof window !== "undefined" && window.ENV?.FIREBASE_CONFIG?.apiKey) {
  const firebaseConfig = window.ENV.FIREBASE_CONFIG;

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
  return user?.photoURL || "/default-avatar.png";
}

export { app, auth, db, googleProvider, githubProvider, twitterProvider };
