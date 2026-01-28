// config/firebase.js (or config/firebaseConfig.js)
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBVIXNrwdJfHQUOgl5aCWvZaRZ7ZDHUfs8",
  authDomain: "smartdesk-b2d23.firebaseapp.com",
  projectId: "smartdesk-b2d23",
  storageBucket: "smartdesk-b2d23.firebasestorage.app",
  messagingSenderId: "835773968416",
  appId: "1:835773968416:web:dfd8457f60fa95b050cc45",
  measurementId: "G-F8TJLVLWP5"
};

// ✅ Prevent re-initializing app during reloads
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Persist auth state using AsyncStorage (React Native)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});


// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);