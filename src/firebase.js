// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByjIfGf14YS_NBdB-YFhWDVUmuKjEBx7k",
  authDomain: "mtg-mechanics-master.firebaseapp.com",
  projectId: "mtg-mechanics-master",
  storageBucket: "mtg-mechanics-master.appspot.com",
  messagingSenderId: "440536723424",
  appId: "1:440536723424:web:741dfd08ad4bab058fc585"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
