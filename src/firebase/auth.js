import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";

import app from "./firebase";


const auth = getAuth(app);


// Session only until browser close

setPersistence(
  auth,
  browserSessionPersistence
);



export const loginAdmin = (email, password) => {

  return signInWithEmailAndPassword(
    auth,
    email,
    password
  );

};



export const logoutAdmin = () => {

  return signOut(auth);

};



export default auth;