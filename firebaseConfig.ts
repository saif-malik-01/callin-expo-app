// firebaseConfig.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCVxL-ct-KcmnGuV-PNNpHUHejTuPeTQCQ",
  authDomain: "voip-90d9a.firebaseapp.com",
  projectId: "voip-90d9a",
  storageBucket: "voip-90d9a.appspot.com",
  messagingSenderId: "82934491668",
  appId: "1:82934491668:android:154199caf79bdb811c1501",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const firestore = getFirestore(app);
const functions = getFunctions(app);

export { auth, firestore, functions };
