// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSWvDY2vg0giirCgs_zbozYuuVt3WjHUQ",
  authDomain: "findtempwithdata.firebaseapp.com",
  projectId: "findtempwithdata",
  storageBucket: "findtempwithdata.firebasestorage.app",
  messagingSenderId: "951862891510",
  appId: "1:951862891510:web:69bf62d1cba83ce833edd7",
  measurementId: "G-YDWYSD9FFV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
