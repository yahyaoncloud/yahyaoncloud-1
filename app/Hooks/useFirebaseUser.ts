// app/hooks/useFirebaseUser.ts
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../utils/firebase.client";

export function useFirebaseUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setUser(user));
  }, []);

  return user;
}
