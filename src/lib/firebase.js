import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "wolfchat-500e0.firebaseapp.com",
  projectId: "wolfchat-500e0",
  storageBucket: "wolfchat-500e0.appspot.com",
  messagingSenderId: "718096069815",
  appId: "1:718096069815:web:656688152db7f5c84b0932"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()