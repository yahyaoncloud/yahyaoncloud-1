// app/utils/firebase.client.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, signOut } from "firebase/auth";
import { getDatabase, ref, push } from "firebase/database";

let app: ReturnType<typeof initializeApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;
let db: ReturnType<typeof getDatabase> | undefined;
let googleProvider: GoogleAuthProvider | undefined;
let githubProvider: GithubAuthProvider | undefined;
let twitterProvider: TwitterAuthProvider | undefined;

if (typeof window !== "undefined") {
  const firebaseConfig = window.ENV?.FIREBASE_CONFIG;

  if (firebaseConfig && !getApps().length) {
    app = initializeApp(firebaseConfig);
  } else if (getApps().length) {
    app = getApp();
  }

  if (app) {
    auth = getAuth(app);
    db = getDatabase(app);

    googleProvider = new GoogleAuthProvider();
    githubProvider = new GithubAuthProvider();
    twitterProvider = new TwitterAuthProvider();
  }
}

export { auth, db, googleProvider, githubProvider, twitterProvider };

// Logout helper
export async function firebaseLogout() {
  if (auth) await signOut(auth);
}

// Example: get user avatar
export function getUserAvatar(user: any) {
  return user?.photoURL;
}
