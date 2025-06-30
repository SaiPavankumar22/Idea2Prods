import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEjXemLLsmWVebdsh69tcaFWdcWJdlVbs",
  authDomain: "idea2prod.firebaseapp.com",
  projectId: "idea2prod",
  storageBucket: "idea2prod.firebasestorage.app",
  messagingSenderId: "661770561365",
  appId: "1:661770561365:web:c7c26978cb51bf9e45b1dc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;