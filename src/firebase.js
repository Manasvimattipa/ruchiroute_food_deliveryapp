import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCGJzet03LkhCg2W7erWnEst9Fbc0tYKsM",
  authDomain: "ecom-webapp-99927.firebaseapp.com",
  projectId: "ecom-webapp-99927",
  storageBucket: "ecom-webapp-99927.firebasestorage.app",
  messagingSenderId: "215794250171",
  appId: "1:215794250171:web:01fb154ccaeb37a5b3d49e",
  measurementId: "G-40YE7R50JJ"
};

export const app = initializeApp(firebaseConfig);
export const adminApp = initializeApp(firebaseConfig, 'admin'); // Secondary app for isolated session
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
