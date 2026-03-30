import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQAYpFOytDafrMgPUyi9z7QicdV0vL91M",
  authDomain: "cifra-tuus.firebaseapp.com",
  projectId: "cifra-tuus",
  storageBucket: "cifra-tuus.appspot.com",
  messagingSenderId: "1084412647265",
  appId: "1:1084412647265:web:a49bd879979daaadd35720",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();

const db = getFirestore(app);

export { app, auth, db };