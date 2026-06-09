import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD_8R1pmUh15FXPPt7m9XHs_aBL4I6p-2I",
  authDomain: "voxstock-494c4.firebaseapp.com",
  projectId: "voxstock-494c4",
  storageBucket: "voxstock-494c4.firebasestorage.app",
  messagingSenderId: "528704998765",
  appId: "1:528704998765:web:bc4f59a791c9e12af4de64"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();