
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

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




// =========================================================
// DEFAULT SETTINGS
// =========================================================

const defaultSettings = {
  website: {
    siteName: "Okara Cameramen Association",
    shortName: "OCMA",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    logo: "",
  },

  loadingScreen: {
    title: "Loading OCMA Website...",
    message: "Please wait while the website loads.",
  },

  hero: {
    heading: "Okara Cameramen Association",
    subtitle: "Professional Cameramen Community",
    description: "",
    smallText: "",
    buttonOne: "Join OCMA",
    buttonTwo: "View Members",
    banner: "",
    showHero: true,
    showLiveStats: true,
  },

  navbar: {
    name: "OCMA",
    tagline: "Okara Cameramen Association",
    showLiveNetwork: true,

    items: [
      {
        title: "Home",
        link: "/",
      },
      {
        title: "Members",
        link: "/members",
      },
      {
        title: "Gallery",
        link: "/gallery",
      },
      {
        title: "Training",
        link: "/training",
      },
      {
        title: "Announcements",
        link: "/announcements",
      },
      {
        title: "Join OCMA",
        link: "/join",
      },
    ],
  },

  homepage: {
    about: {
      title: "About OCMA",
      show: true,
    },

    registeredMembers: {
      title: "Registered Members",
      show: true,
    },

    gallery: {
      title: "Gallery",
      show: true,
    },

    ocmaGallery: {
      title: "OCMA Gallery",
      show: true,
    },

    announcements: {
      title: "Announcements",
      show: true,
    },

    seniorMembers: {
      title: "Senior Members",
      show: true,
    },

    authority: {
      title: "Authority",
      show: true,
    },

    training: {
      title: "Training",
      show: true,
    },
  },

  social: {
    facebook: "",
    instagram: "",
    youtube: "",
    whatsapp: "",
    tiktok: "",
  },

  footer: {
    aboutTitle: "About OCMA",
    aboutDescription: "",
    adminSectionTitle: "Admin / Developer",
    adminName: "",
    adminRole: "",
    developerText: "",
    adminPhoto: "",

    mapTitle: "Find Us",
    mapClickText: "Open in Google Maps",
    map: "",
    mapAddress: "",

    quickLinksTitle: "Quick Links",

    quickLinks: [
      {
        title: "Home",
        link: "/",
      },
      {
        title: "Members",
        link: "/members",
      },
    ],

    servicesTitle: "Services",

    services: [
      "Membership",
      "Training",
      "Member Profiles",
    ],
  },
};


// =========================================================
// HOME COMPONENT
// =========================================================

function Home() {

  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // -------------------------------------------------------
  // Loading screen settings
  // -------------------------------------------------------

  const [loadingScreen, setLoadingScreen] = useState(
    defaultSettings.loadingScreen
  );


  // =======================================================
  // LOAD WEBSITE SETTINGS
  // =======================================================

  useEffect(() => {

    let mounted = true;

    const loadSettings = async () => {

      try {

        console.log(
          "OCMA: Loading website settings..."
        );


        // =================================================
        // TRY TO LOAD LAST SAVED SETTINGS FROM BROWSER
        // =================================================

        try {

          const cachedSettings =
            localStorage.getItem(
              "ocmaWebsiteSettings"
            );

          if (cachedSettings) {

            const parsed =
              JSON.parse(cachedSettings);

            if (
              parsed?.loadingScreen
            ) {

              setLoadingScreen({

                ...defaultSettings.loadingScreen,

                ...parsed.loadingScreen,

              });

            }

          }

        } catch (cacheError) {

          console.warn(
            "OCMA: Local settings cache could not be read.",
            cacheError
          );

        }


        // =================================================
        // FIREBASE REFERENCE
        // =================================================

        const settingsRef = doc(
          db,
          "websiteSettings",
          "main"
        );


        // =================================================
        // LOAD FROM FIREBASE
        // =================================================

        const snap = await getDoc(
          settingsRef
        );


        if (!mounted) {
          return;
        }


        // =================================================
        // DOCUMENT EXISTS
        // =================================================

        if (snap.exists()) {

          const data = snap.data();


          console.log(
            "OCMA: Website settings loaded.",
            data
          );


          // ------------------------------------------------
          // MERGE ALL SETTINGS
          // ------------------------------------------------

          const mergedSettings = {

            ...defaultSettings,

            ...data,


            // WEBSITE
            website: {

              ...defaultSettings.website,

              ...(data.website || {}),

            },


            // LOADING SCREEN
            loadingScreen: {

              ...defaultSettings.loadingScreen,

              ...(data.loadingScreen || {}),

            },


            // HERO
            hero: {

              ...defaultSettings.hero,

              ...(data.hero || {}),

            },


            // NAVBAR
            navbar: {

              ...defaultSettings.navbar,

              ...(data.navbar || {}),

              items:
                Array.isArray(
                  data.navbar?.items
                )
                  ? data.navbar.items
                  : defaultSettings.navbar.items,

            },


            // HOMEPAGE
            homepage: {

              ...defaultSettings.homepage,

              ...(data.homepage || {}),


              about: {

                ...defaultSettings.homepage.about,

                ...(data.homepage?.about || {}),

              },


              registeredMembers: {

                ...defaultSettings.homepage.registeredMembers,

                ...(data.homepage?.registeredMembers || {}),

              },


              gallery: {

                ...defaultSettings.homepage.gallery,

                ...(data.homepage?.gallery || {}),

              },


              ocmaGallery: {

                ...defaultSettings.homepage.ocmaGallery,

                ...(data.homepage?.ocmaGallery || {}),

              },


              announcements: {

                ...defaultSettings.homepage.announcements,

                ...(data.homepage?.announcements || {}),

              },


              seniorMembers: {

                ...defaultSettings.homepage.seniorMembers,

                ...(data.homepage?.seniorMembers || {}),

              },


              authority: {

                ...defaultSettings.homepage.authority,

                ...(data.homepage?.authority || {}),

              },


              training: {

                ...defaultSettings.homepage.training,

                ...(data.homepage?.training || {}),

              },

            },


            // SOCIAL
            social: {

              ...defaultSettings.social,

              ...(data.social || {}),

            },


            // FOOTER
            footer: {

              ...defaultSettings.footer,

              ...(data.footer || {}),


              quickLinks:
                Array.isArray(
                  data.footer?.quickLinks
                )
                  ? data.footer.quickLinks
                  : defaultSettings.footer.quickLinks,


              services:
                Array.isArray(
                  data.footer?.services
                )
                  ? data.footer.services
                  : defaultSettings.footer.services,

            },

          };


          // =================================================
          // UPDATE LOADING SCREEN FROM ADMIN SETTINGS
          // =================================================

          setLoadingScreen(
            mergedSettings.loadingScreen
          );


          // =================================================
          // SAVE SETTINGS TO LOCAL CACHE
          // =================================================

          try {

            localStorage.setItem(
              "ocmaWebsiteSettings",
              JSON.stringify(
                mergedSettings
              )
            );

          } catch (cacheError) {

            console.warn(
              "OCMA: Could not save settings to local cache.",
              cacheError
            );

          }


          // =================================================
          // SET MAIN SETTINGS
          // =================================================

          setSettings(
            mergedSettings
          );


          setError("");


          return;

        }


        // =================================================
        // DOCUMENT DOES NOT EXIST
        // =================================================

        console.warn(
          "OCMA: websiteSettings/main does not exist."
        );


        // -------------------------------------------------
        // CREATE DEFAULT SETTINGS
        // -------------------------------------------------

        await setDoc(
          settingsRef,
          defaultSettings,
          {
            merge: true,
          }
        );


        if (!mounted) {
          return;
        }


        setSettings(
          defaultSettings
        );


        setLoadingScreen(
          defaultSettings.loadingScreen
        );


        setError("");


        // -------------------------------------------------
        // SAVE DEFAULT SETTINGS TO CACHE
        // -------------------------------------------------

        try {

          localStorage.setItem(
            "ocmaWebsiteSettings",
            JSON.stringify(
              defaultSettings
            )
          );

        } catch (cacheError) {

          console.warn(
            "OCMA: Could not save default settings cache.",
            cacheError
          );

        }

      } catch (err) {

        console.error(
          "OCMA Homepage Settings Error:",
          err
        );


        if (!mounted) {
          return;
        }


        // =================================================
        // IMPORTANT FALLBACK
        // =================================================
        // Firebase error hone par website permanently
        // loading screen par nahi rukegi.
        // =================================================

        setSettings(
          defaultSettings
        );


        setLoadingScreen(
          defaultSettings.loadingScreen
        );


        setError(
          "Website settings could not be loaded from Firebase. Default settings are being used."
        );

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    };


    loadSettings();


    return () => {

      mounted = false;

    };

  }, []);


  // =======================================================
  // LOADING SCREEN
  // =======================================================

  if (loading) {

    return (

      <div className="home-loading">

        <div className="home-loading-content">

          <div className="loading-spinner">
          </div>


          <h2>
            {loadingScreen.title}
          </h2>


          <p>
            {loadingScreen.message}
          </p>

        </div>

      </div>

    );

  }


  // =======================================================
  // SETTINGS FALLBACK
  // =======================================================

  const websiteSettings =
    settings || defaultSettings;


  // =======================================================
  // SETTINGS DATA
  // =======================================================

  const homepage =
    websiteSettings.homepage ||
    defaultSettings.homepage;


  const hero =
    websiteSettings.hero ||
    defaultSettings.hero;


  // =======================================================
  // MAIN WEBSITE
  // =======================================================

  return (

    <div className="ocma-home">


      {/* ==================================================
          FIREBASE ERROR NOTICE
      ================================================== */}

      {error && (

        <div
          style={{
            background: "#211b08",
            color: "#d4af37",
            textAlign: "center",
            padding: "8px 15px",
            fontSize: "13px",
            borderBottom:
              "1px solid rgba(212,175,55,0.25)",
          }}
        >

          {error}

        </div>

      )}


      {/* ==================================================
          ANNOUNCEMENTS
      ================================================== */}

      <Announcements />


      {/* ==================================================
          NAVBAR
      ================================================== */}

      <Navbar
        data={websiteSettings}
      />


      {/* ==================================================
          HERO
      ================================================== */}

      {hero.showHero !== false && (

        <Hero
          data={hero}
        />

      )}


      {/* ==================================================
          REGISTERED MEMBERS
      ================================================== */}

      {homepage.registeredMembers?.show !== false && (

        <section
          id="registered-members"
          className="home-section"
        >

          <RegisteredMembers />

        </section>

      )}


      {/* ==================================================
          MEMBER GALLERY
      ================================================== */}

      {homepage.gallery?.show !== false && (

        <section
          id="gallery"
          className="home-section"
        >

          <MemberGallery />

        </section>

      )}


      {/* ==================================================
          OCMA OFFICIAL GALLERY
      ================================================== */}

      {homepage.ocmaGallery?.show !== false && (

        <section
          id="ocma-gallery"
          className="home-section"
        >

          <OCMAGalleryPreview />

        </section>

      )}


      {/* ==================================================
          SENIOR MEMBERS
      ================================================== */}

      {homepage.seniorMembers?.show !== false && (

        <section
          id="senior-members"
          className="home-section"
        >

          <SeniorMembers />

        </section>

      )}


      {/* ==================================================
          AUTHORITY
      ================================================== */}

      {homepage.authority?.show !== false && (

        <section
          id="authority"
          className="home-section"
        >

          <Authority />

        </section>

      )}


      {/* ==================================================
          TRAINING
      ================================================== */}

      {homepage.training?.show !== false && (

        <section
          id="training"
          className="home-section"
        >

          <Training />

        </section>

      )}


      {/* ==================================================
          FOOTER
      ================================================== */}

      <Footer
        data={websiteSettings}
      />


    </div>

  );

}


export default Home;
