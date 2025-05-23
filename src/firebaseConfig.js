import { initializeApp } from "firebase/app";  
import { getAuth, GoogleAuthProvider } from "firebase/auth";  
import { getFirestore } from "firebase/firestore"; // Import Firestore for database access  

const firebaseConfig = {  
  apiKey: "AIzaSyAWxY4CpLSXmPIyXEZ4eeyo25Bhmwd7XSM",  
  authDomain: "beats-garage.firebaseapp.com",  
  projectId: "beats-garage",  
  storageBucket: "beats-garage.appspot.com", // Fixed storage bucket value  
  messagingSenderId: "818956091362",  
  appId: "1:818956091362:web:40f4a61fd1b060a1e083bb",  
  measurementId: "G-GGFL6JT2LC",  
};  

// Initialize Firebase  
const app = initializeApp(firebaseConfig);  

// Firebase Authentication  
export const auth = getAuth(app); // Exporting Authentication instance  
export const googleProvider = new GoogleAuthProvider(); // Exporting Google Sign-in provider  

// Firestore Database  
export const db = getFirestore(app); // Exporting Firestore instance  

export default app;  