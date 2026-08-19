
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";



const firebaseConfig = {

  apiKey: "AIzaSyAhaKT-a9BFuzNE6d6UN0BuHEmTNon4ZxY",

  authDomain: "ocma-official.firebaseapp.com",

  projectId: "ocma-official",

  storageBucket: "ocma-official.firebasestorage.app",

  messagingSenderId: "527582795786",

  appId: "1:527582795786:web:9aa5e5ef083d8312cfe7f3"

};




const app = initializeApp(firebaseConfig);




const db = getFirestore(app);




// =====================================
// FIREBASE AUTHENTICATION
// =====================================

const auth = getAuth(app);

const googleProvider =
  new GoogleAuthProvider();




// =====================================
// EXPORTS
// =====================================

export {
  db,
  auth,
  googleProvider
};


export default app;
