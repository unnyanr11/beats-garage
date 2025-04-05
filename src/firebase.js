import { initializeApp } from "firebase/app";  
import { getAuth } from "firebase/auth";  

// Firebase configuration from Firebase console  
const firebaseConfig = {  
    apiKey: "AIzaSyAWxY4CpLSXmPIyXEZ4eeyo25Bhmwd7XSM",
  authDomain: "beats-garage.firebaseapp.com",
  projectId: "beats-garage",
  storageBucket: "beats-garage.firebasestorage.app",
  messagingSenderId: "818956091362",
  appId: "1:818956091362:web:40f4a61fd1b060a1e083bb",
  measurementId: "G-GGFL6JT2LC" 
};  

// Initialize Firebase app  
const app = initializeApp(firebaseConfig);  

// Setup Firebase authentication  
export const auth = getAuth(app);  
export default app;  