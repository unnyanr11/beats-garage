import { initializeApp } from "firebase/app";  
import { getAuth, GoogleAuthProvider } from "firebase/auth";  
import { getFirestore } from "firebase/firestore";  

const firebaseConfig = {  
  apiKey: "AIzaSyAWxY4CpLSXmPIyXEZ4eeyo25Bhmwd7XSM",  
  authDomain: "beats-garage.firebaseapp.com",  
  projectId: "beats-garage",  
  storageBucket: "beats-garage.appspot.com", // Make sure this is correct  
  messagingSenderId: "818956091362",  
  appId: "1:818956091362:web:40f4a61fd1b060a1e083bb",  
  measurementId: "G-GGFL6JT2LC",  
};  

// Initialize Firebase  
const app = initializeApp(firebaseConfig);  

// Export Firebase services  
export const auth = getAuth(app); // Ensure `auth` is initialized *after* the app  
export const googleProvider = new GoogleAuthProvider();  
export const db = getFirestore(app);  

export default app;  