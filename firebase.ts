
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB1-gHW437ifOHJZWN3RzwrB05VzfSC8WE",
  authDomain: "freeman-d85a6.firebaseapp.com",
  databaseURL: "https://freeman-d85a6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "freeman-d85a6",
  storageBucket: "freeman-d85a6.firebasestorage.app",
  messagingSenderId: "343290732949",
  appId: "1:343290732949:web:b0743ebbb290ef2057569c",
  measurementId: "G-MY6D5JVWXN"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
