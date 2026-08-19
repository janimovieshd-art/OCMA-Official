
import { useState } from "react";

import {
  signInWithPopup
} from "firebase/auth";

import {
  auth,
  googleProvider
} from "../firebase/firebase";


function GoogleLogin({
  onLogin,
  buttonText = "Continue with Google"
}) {

  const [loading, setLoading] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [error, setError] =
    useState("");


  // =====================================
  // GOOGLE LOGIN
  // =====================================

  const handleGoogleLogin = async () => {

    try {

      setLoading(true);

      setError("");


      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );


      const loggedInUser =
        result.user;


      setUser(
        loggedInUser
      );


      // =====================================
      // SEND USER TO PARENT COMPONENT
      // =====================================

      if (onLogin) {

        onLogin(
          loggedInUser
        );

      }

    }

    catch (error) {

      console.log(
        "Google Login Error:",
        error
      );


      if (
        error?.code ===
        "auth/popup-closed-by-user"
      ) {

        setError(
          "Google Login window بند کر دی گئی۔"
        );

      }

      else {

        setError(
          "Google Login نہیں ہو سکا۔ دوبارہ کوشش کریں۔"
        );

      }

    }

    finally {

      setLoading(false);

    }

  };


  // =====================================
  // LOGGED IN USER
  // =====================================

  if (user) {

    return (

      <div className="google-login-success">

        <img
          src={
            user.photoURL ||
            "/assets/ocma-logo.png"
          }
          alt={
            user.displayName ||
            "Google User"
          }
          className="google-user-photo"
        />


        <h3>

          {user.displayName ||
            "Google User"}

        </h3>


        <p>

          {user.email}

        </p>


        <p>

          ✓ Google Login Successful

        </p>

      </div>

    );

  }


  // =====================================
  // LOGIN BUTTON
  // =====================================

  return (

    <div className="google-login">

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="google-login-button"
      >

        {loading
          ? "Google Login ہو رہا ہے..."
          : buttonText}

      </button>


      {error && (

        <p className="google-login-error">

          {error}

        </p>

      )}

    </div>

  );

}


export default GoogleLogin;
