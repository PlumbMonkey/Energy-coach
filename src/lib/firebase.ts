/**
 * Firebase Configuration & Setup
 *
 * SETUP STEPS:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project called "conductor-scheduler"
 * 3. Click "Web" to add a web app — copy the config object into your .env file
 * 4. In the left sidebar: Build → Firestore Database → Create Database
 * 5. Choose "Start in test mode" for now (you can add security rules later)
 * 6. Create a Firestore collection called "conductor" with a document "tasks"
 * 7. That's it — the app will sync automatically across all your devices
 *
 * Once set up, users and devices will auto-sync task state in real-time.
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'

// Read config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Check if Firebase config is properly set
const isConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain

let app: ReturnType<typeof initializeApp> | null = null
let db: ReturnType<typeof getFirestore> | null = null

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  } catch (err) {
    console.error('Firebase initialization failed:', err)
  }
}

export { db }
export { isConfigured }
export { collection, doc, getDoc, setDoc, onSnapshot }

/**
 * Helper to ensure Firebase is available
 */
export function ensureFirebase() {
  if (!isConfigured || !db) {
    throw new Error(
      'Firebase not configured. Set VITE_FIREBASE_* environment variables.'
    )
  }
  return db
}
