import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAm3JPi51XdnSSQ8uz6PH8ao0eOJHL6aeI",
  authDomain: "manage-your-time-e04ae.firebaseapp.com",
  projectId: "manage-your-time-e04ae",
  storageBucket: "manage-your-time-e04ae.firebasestorage.app",
  messagingSenderId: "136411655429",
  appId: "1:136411655429:web:9ab81a07dbbfdb498bdb6c",
  measurementId: "G-W9L2EVJ40E"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
