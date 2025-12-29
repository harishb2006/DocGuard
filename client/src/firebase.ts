
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAX87iCDNOZSjA_daPkn9sfeFCYNei4rsI",
    authDomain: "docg-9a14e.firebaseapp.com",
    projectId: "docg-9a14e",
    storageBucket: "docg-9a14e.firebasestorage.app",
    messagingSenderId: "695636710380",
    appId: "1:695636710380:web:56a547739dea33f187a6c9",
    measurementId: "G-4ZCD4B3QKJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
