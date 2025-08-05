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

export { app, auth, db, googleProvider, githubProvider, twitterProvider };
