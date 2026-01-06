import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdvSikVTHB43ajFGlRlEzGf3XZFGc4RUs",
  authDomain: "workhub360-b1d02.firebaseapp.com",
  projectId: "workhub360-b1d02",
  storageBucket: "workhub360-b1d02.firebasestorage.app",
  messagingSenderId: "76262806454",
  appId: "1:76262806454:web:74e2ddc9f9b64334132717"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };