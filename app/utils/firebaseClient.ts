// firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yahyaoncloud-9b5c6.firebaseapp.com",
  projectId: "yahyaoncloud-9b5c6",
  // ... other keys
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GithubAuthProvider();

export { auth, provider, signInWithPopup };
