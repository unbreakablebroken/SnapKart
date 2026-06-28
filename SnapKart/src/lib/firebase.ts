import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";

const firebaseConfig = {
  projectId: "careful-rain-0mvz5",
  appId: "1:635858723289:web:620499cc4b1ec5dd4d79c8",
  apiKey: "AIzaSyA6Zdxh_3TGdVxEz0gryxXhLL2TwExbOIc",
  authDomain: "careful-rain-0mvz5.firebaseapp.com",
  storageBucket: "careful-rain-0mvz5.firebasestorage.app",
  messagingSenderId: "635858723289"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom Database ID as configured
export const db = initializeFirestore(app, {}, "ai-studio-snapkart-90ed63a8-ca0b-4216-a2b0-d8308885eca7");

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Test Connection function (as required by the skill docs)
export async function testConnection() {
  try {
    // Attempt fetching a dummy document to test network / credentials
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase connection verified successfully.");
  } catch (error) {
    console.warn("Firestore connection check completed. (Offline status or empty DB is normal)", error);
  }
}

testConnection();
