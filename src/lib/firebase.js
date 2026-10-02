import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDHGANlsqxWZ7ArrwYszHh_KDg0X0eO3vg",
  authDomain: "attendify-4c55b.firebaseapp.com",
  projectId: "attendify-4c55b",
  storageBucket: "attendify-4c55b.firebasestorage.app",
  messagingSenderId: "12125271021",
  appId: "1:12125271021:web:3183ce6faaf45148f0ade4",
  measurementId: "G-1SF3BXGQ21"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Analytics safely on the client side
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, auth, analytics };
