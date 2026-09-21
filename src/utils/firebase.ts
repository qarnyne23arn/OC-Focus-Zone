/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFvhYYqf0ZpeGraBaxTaZsnY3ora0CD7s",
  authDomain: "oc-focus-zone.firebaseapp.com",
  projectId: "oc-focus-zone",
  storageBucket: "oc-focus-zone.firebasestorage.app",
  messagingSenderId: "298545778088",
  appId: "1:298545778088:web:1386482d90348615ba619d",
  measurementId: "G-QFNLES87PH"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
