import { useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Announcements from "../components/Announcements";
import Authority from "../components/Authority";
import SeniorMembers from "../components/SeniorMembers";
import RegisteredMembers from "../components/RegisteredMembers";
import MemberGallery from "../components/MemberGallery";
import OCMAGalleryPreview from "../components/OCMAGalleryPreview";
import Training from "../components/Training";
import Footer from "../components/Footer";


function Home() {

  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(true);


  // ==========================================
  // LOAD WEBSITE SETTINGS
  // ==========================================

  useEffect(() => {

    const loadSettings = async () => {

      try {

        const settingsRef = doc(
          db,
          "websiteSettings",
          "main"
        );

        const snap = await getDoc(
          settingsRef
        );


        if (snap.exists()) {

          setSettings(
            snap.data()
          );

        }

      } catch (error) {

        console.error(
          "Homepage Settings Error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    loadSettings();

  }, []);


  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {

    return (

      <div className="home-loading">

        <div className="home-loading-content">

          <div className="loading-spinner" />

          <h2>
            Loading OCMA Website...
          </h2>

          <p>
            Please wait while the website loads.
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // SETTINGS NOT FOUND
  // ==========================================

  if (!settings) {

    return (

      <div className="home-loading">

        <div className="home-loading-content">

          <h2>
            Website Settings Not Found
          </h2>

          <p>
            OCMA website settings could not
            be loaded from Firebase.
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // SETTINGS DATA
  // ==========================================

  const homepage =
    settings.homepage || {};

  const hero =
    settings.hero || {};


  // ==========================================
  // MAIN HOMEPAGE
  // ==========================================

  return (

    <div className="ocma-home">


      {/* ======================================
          FIXED ANNOUNCEMENT TICKER
          
          This is NOT a homepage section.
          It stays fixed at the top.
          
          If there is no uploaded announcement,
          the component returns nothing.
      ====================================== */}

      <Announcements />


      {/* ======================================
          NAVBAR
      ====================================== */}

      <Navbar
        data={settings}
      />


      {/* ======================================
          HERO
      ====================================== */}

      {hero.showHero !== false && (

        <Hero
          data={hero}
        />

      )}


      {/* ======================================
          REGISTERED MEMBERS
      ====================================== */}

      {homepage.registeredMembers?.show && (

        <section
          id="registered-members"
          className="home-section"
        >

          <RegisteredMembers />

        </section>

      )}


      {/* ======================================
          MEMBER GALLERY
      ====================================== */}

      {homepage.gallery?.show && (

        <section
          id="gallery"
          className="home-section"
        >

          <MemberGallery />

        </section>

      )}


      {/* ======================================
          OCMA OFFICIAL GALLERY
      ====================================== */}

      {homepage.ocmaGallery?.show && (

        <section
          id="ocma-gallery"
          className="home-section"
        >

          <OCMAGalleryPreview />

        </section>

      )}


      {/* ======================================
          SENIOR MEMBERS
      ====================================== */}

      {homepage.seniorMembers?.show && (

        <section
          id="senior-members"
          className="home-section"
        >

          <SeniorMembers />

        </section>

      )}


      {/* ======================================
          AUTHORITY
      ====================================== */}

      {homepage.authority?.show && (

        <section
          id="authority"
          className="home-section"
        >

          <Authority />

        </section>

      )}


      {/* ======================================
          TRAINING
      ====================================== */}

      {homepage.training?.show && (

        <section
          id="training"
          className="home-section"
        >

          <Training />

        </section>

      )}


      {/* ======================================
          FOOTER
      ====================================== */}

      <Footer
        data={settings}
      />


    </div>

  );

}


export default Home;