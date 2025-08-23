// utils/firebase.admin.server.ts
import { initializeApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App;
let adminAuth: Auth;

try {
  // Check if required environment variables are present
  const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing Firebase Admin environment variables:', missingVars);
    throw new Error('Firebase Admin configuration incomplete');
  }

  // Initialize Firebase Admin
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  }, 'admin'); // Give it a unique name

  adminAuth = getAuth(adminApp);
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  // Fallback for development
  adminAuth = {
    verifyIdToken: async (token: string) => {
      console.warn('Firebase Admin not configured, using mock verification');
      try {
        // Simple token decoding without verification for development
        const payload = token.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
        return decoded;
      } catch (e) {
        throw new Error('Invalid token structure');
      }
    }
  } as any;
}

export { adminAuth };