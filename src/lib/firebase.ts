import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDK4rRIWwgJyV4d_yMbl4T27FlbkxiUEJQ",
  authDomain: "invest-f4ea1.firebaseapp.com",
  projectId: "invest-f4ea1",
  storageBucket: "invest-f4ea1.firebasestorage.app",
  messagingSenderId: "732473850265",
  appId: "1:732473850265:web:4807a7a84d65291bb97b08",
  measurementId: "G-7HG22RS1P7",
};

const app = initializeApp(firebaseConfig);

// Analytics is only available in supported environments (i.e., browser contexts).
const analytics = isSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch(() => null);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, analytics, googleProvider };
