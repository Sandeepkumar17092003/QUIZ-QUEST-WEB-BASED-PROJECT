
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5yYy-qCg_rfLx6gwFWMosAwafJPaj6cM",
  authDomain: "crud-c1e4e.firebaseapp.com",
  projectId: "crud-c1e4e",
  storageBucket: "crud-c1e4e.appspot.com",
  messagingSenderId: "722831696367",
  appId: "1:722831696367:web:2a3199637d80b481d4961a",
  measurementId: "G-MXXBTDH0WT"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebaseApp);

export default firebaseApp;
export const storage = getStorage(firebaseApp);
export const db = getFirestore(firebaseApp);
export {  collection, getDocs }; // Export the methods correctly