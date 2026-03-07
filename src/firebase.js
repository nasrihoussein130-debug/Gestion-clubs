import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBeXKBI3fPguNbhBHQlQc7ygDjeWIhsjU4",
  authDomain: "gestion-clubs-d0b75.firebaseapp.com",
  projectId: "gestion-clubs-d0b75",
  storageBucket: "gestion-clubs-d0b75.firebasestorage.app",
  messagingSenderId: "1035473043979",
  appId: "1:1035473043979:web:a90fdbdf43e2d95240fd0e",
  measurementId: "G-MW7CDNPS8M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);