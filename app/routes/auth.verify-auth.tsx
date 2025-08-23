// // app/routes/auth.verify-token.ts
// import { ActionFunction, json } from "@remix-run/node";
// import { auth } from "../utils/firebase.server";

// export const action: ActionFunction = async ({ request }) => {
//   const { idToken } = await request.json();
  
//   try {
//     const decodedToken = await auth.verifyIdToken(idToken);
//     return json({ valid: true, uid: decodedToken.uid });
//   } catch (error) {
//     return json({ valid: false, error: "Invalid token" }, { status: 401 });
//   }
// };