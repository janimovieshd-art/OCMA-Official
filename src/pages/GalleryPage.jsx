import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";


function GalleryPage() {

  const [websiteName, setWebsiteName] =
    useState("OCMA");


  useEffect(() => {

    const loadSettings = async () => {

      try {

        const snap = await getDoc(
          doc(db, "websiteSettings", "main")
        );


        if (snap.exists()) {

          const data = snap.data();

          setWebsiteName(
            data.website?.shortName?.trim() ||
            "OCMA"
          );

        }

      } catch (error) {

        console.log(
          "Gallery Settings Error:",
          error
        );

      }

    };


    loadSettings();

  }, []);


  return (

    <section
      style={{
        padding: "80px",
        color: "white",
        background: "#050505",
        textAlign: "center"
      }}
    >

      <h1>
        {websiteName} Gallery
      </h1>


      <p>
        Gallery will be managed from Admin Panel.
      </p>

    </section>

  );

}


export default GalleryPage;