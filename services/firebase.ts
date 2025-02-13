// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxHzmLiQrGUNdfMYWSOYm0YhHBrHW_yQg",
  authDomain: "tanc-8f884.firebaseapp.com",
  projectId: "tanc-8f884",
  storageBucket: "tanc-8f884.firebasestorage.app",
  messagingSenderId: "948811545016",
  appId: "1:948811545016:web:05edf742387cb00071774d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);