/**
 * Firebase config — Dashboard Admin Brumerie
 * Remplacer les valeurs par celles de votre projet Firebase Console
 * (Project Settings → General → Your apps → Web app)
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'VOTRE_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'brumerie.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'brumerie',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'brumerie.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| 'SENDER_ID',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || 'APP_ID',
};

// Éviter la double initialisation en dev (HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
