// app/utils/firebase.config.ts
export const firebaseConfig = {
  apiKey:
    typeof window !== "undefined" ? window.ENV?.FIREBASE_CONFIG?.apiKey : "",
  authDomain:
    typeof window !== "undefined"
      ? window.ENV?.FIREBASE_CONFIG?.authDomain
      : "",
  databaseURL:
    typeof window !== "undefined"
      ? window.ENV?.FIREBASE_CONFIG?.databaseURL
      : "",
  projectId:
    typeof window !== "undefined" ? window.ENV?.FIREBASE_CONFIG?.projectId : "",
  storageBucket:
    typeof window !== "undefined"
      ? window.ENV?.FIREBASE_CONFIG?.storageBucket
      : "",
  messagingSenderId:
    typeof window !== "undefined"
      ? window.ENV?.FIREBASE_CONFIG?.messagingSenderId
      : "",
  appId:
    typeof window !== "undefined" ? window.ENV?.FIREBASE_CONFIG?.appId : "",
};
