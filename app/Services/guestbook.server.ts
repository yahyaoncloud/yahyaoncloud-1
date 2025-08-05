// import { initializeApp } from "firebase/app";
// import {
//   getDatabase,
//   get,
//   ref,
//   push,
//   onValue,
//   remove,
//   query,
//   orderByChild,
//   endAt,
// } from "firebase/database";
// import { environment } from "../environments/environment";

// const firebaseConfig = {
//   apiKey: environment.FIREBASE_API_KEY,
//   authDomain: environment.FIREBASE_AUTH_DOMAIN,
//   databaseURL: environment.FIREBASE_DATABASE_URL,
//   projectId: environment.FIREBASE_PROJECT_ID,
//   storageBucket: environment.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: environment.FIREBASE_MESSAGING_SENDER_ID,
//   appId: environment.FIREBASE_APP_ID,
// };

// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);

// interface GUser {
//   name: string;
//   email: string;
//   date: number;
//   message: string;
// }

// export class GuestbookService {
//   private messagesRef = ref(database, "guestbook");

//   async addMessage(user: GUser): Promise<void> {
//     try {
//       await push(this.messagesRef, {
//         ...user,
//         date: Date.now(),
//       });
//     } catch (error) {
//       console.error("Error adding message:", error);
//       throw new Error("Failed to add message");
//     }
//   }

// async getMessages(): Promise<(GUser & { id: string })[]> {
//   const snapshot = await get(this.messagesRef);
//   const data = snapshot.val();
//   if (!data) return [];
//   return Object.entries(data).map(([key, value]: [string, any]) => ({
//     ...value,
//     id: key,
//   }));
// }

//   async cleanupOldMessages(): Promise<void> {
//     try {
//       const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
//       const oldMessagesQuery = query(
//         this.messagesRef,
//         orderByChild("date"),
//         endAt(twentyFourHoursAgo)
//       );

//       onValue(
//         oldMessagesQuery,
//         async (snapshot) => {
//           const data = snapshot.val();
//           if (data) {
//             const deletionPromises = Object.keys(data).map((key) =>
//               remove(ref(database, `guestbook/${key}`))
//             );
//             await Promise.all(deletionPromises);
//           }
//         },
//         { onlyOnce: true }
//       );
//     } catch (error) {
//       console.error("Error cleaning up old messages:", error);
//       throw new Error("Failed to clean up old messages");
//     }
//   }
// }
