// Firebase configuration
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBp-WX8zAR7qeEVPRcH5vef7UNAxoNy3jU",
  authDomain: "knipetak-520b3.firebaseapp.com",
  projectId: "knipetak-520b3",
  storageBucket: "knipetak-520b3.firebasestorage.app",
  messagingSenderId: "1028143362766",
  appId: "1:1028143362766:web:e358ac6d5e0d6d5e8c969f",
  measurementId: "G-VLMZB0HC3Y",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export default app;
