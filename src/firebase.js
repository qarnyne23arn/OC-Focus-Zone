import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDocs, collection, query, where, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFvhYYqf0ZpeGraBaxTaZsnY3ora0CD7s",
  authDomain: "oc-focus-zone.firebaseapp.com",
  projectId: "oc-focus-zone",
  storageBucket: "oc-focus-zone.firebasestorage.app",
  messagingSenderId: "298545778088",
  appId: "1:298545778088:web:1386482d90348615ba619d",
  measurementId: "G-QFNLES87PH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication & Database exports
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// 1. Google Login Helper
export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logoutUser = () => signOut(auth);

// 2. Save Session Data Helper
export const saveDailySession = async (dateKey, sessionData) => {
  const user = auth.currentUser;
  if (!user) return;
  const ref = doc(db, "users", user.uid, "sessions", dateKey);
  await setDoc(ref, {
    ...sessionData,
    updatedAt: new Date()
  }, { merge: true });
};

// 3. Fetch Last 90 Days History Helper
export const fetchLast90Days = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const q = query(
    collection(db, "users", user.uid, "sessions"),
    where("updatedAt", ">=", ninetyDaysAgo),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export default app;
