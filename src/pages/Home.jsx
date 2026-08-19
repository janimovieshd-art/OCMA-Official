import "./Home.css";
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

  homeTheme: {
    color: "#0b0b0b",
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
      { title: "Home", link: "/" },
      { title: "Members", link: "/members" },
      { title: "Gallery", link: "/gallery" },
      { title: "Training", link: "/training" },
      { title: "Announcements", link: "/announcements" },
      { title: "Join OCMA", link: "/join" },
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
      { title: "Home", link: "/" },
      { title: "Members", link: "/members" },
    ],
    servicesTitle: "Services",
    services: [
      "Membership",
      "Training",
      "Member Profiles",
    ],
  },
};

function Home() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingScreen, setLoadingScreen] = useState(
    defaultSettings.loadingScreen
  );

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        try {
          const cachedSettings = localStorage.getItem(
            "ocmaWebsiteSettings"
          );

          if (cachedSettings) {
            const parsed = JSON.parse(cachedSettings);

            if (parsed?.loadingScreen) {
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

        const settingsRef = doc(
          db,
          "websiteSettings",
          "main"
        );

        const snap = await getDoc(settingsRef);

        if (!mounted) return;

        if (snap.exists()) {
          const data = snap.data();

          const mergedSettings = {
            ...defaultSettings,
            ...data,

            website: {
              ...defaultSettings.website,
              ...(data.website || {}),
            },

            loadingScreen: {
              ...defaultSettings.loadingScreen,
              ...(data.loadingScreen || {}),
            },

            homeTheme: {
              ...defaultSettings.homeTheme,
              ...(data.homeTheme || {}),
            },

            hero: {
              ...defaultSettings.hero,
              ...(data.hero || {}),
            },

            navbar: {
              ...defaultSettings.navbar,
              ...(data.navbar || {}),
              items:
                Array.isArray(data.navbar?.items) &&
                data.navbar.items.length
                  ? data.navbar.items
                  : defaultSettings.navbar.items,
            },

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

            social: {
              ...defaultSettings.social,
              ...(data.social || {}),
            },

            footer: {
              ...defaultSettings.footer,
              ...(data.footer || {}),

              quickLinks:
                Array.isArray(data.footer?.quickLinks) &&
                data.footer.quickLinks.length
                  ? data.footer.quickLinks
                  : defaultSettings.footer.quickLinks,

              services:
                Array.isArray(data.footer?.services) &&
                data.footer.services.length
                  ? data.footer.services
                  : defaultSettings.footer.services,
            },
          };

          setLoadingScreen(
            mergedSettings.loadingScreen
          );

          try {
            localStorage.setItem(
              "ocmaWebsiteSettings",
              JSON.stringify(mergedSettings)
            );
          } catch (cacheError) {
            console.warn(
              "OCMA: Could not save settings to local cache.",
              cacheError
            );
          }

          setSettings(mergedSettings);
          setError("");

          return;
        }

        await setDoc(
          settingsRef,
          defaultSettings,
          { merge: true }
        );

        if (!mounted) return;

        setSettings(defaultSettings);
        setLoadingScreen(
          defaultSettings.loadingScreen
        );
        setError("");

        try {
          localStorage.setItem(
            "ocmaWebsiteSettings",
            JSON.stringify(defaultSettings)
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

        if (!mounted) return;

        setSettings(defaultSettings);
        setLoadingScreen(
          defaultSettings.loadingScreen
        );
        setError(
          "Website settings could not be loaded from Firebase. Default settings are being used."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="home-loading-content">
          <div className="loading-spinner"></div>

          <h2>{loadingScreen.title}</h2>

          <p>{loadingScreen.message}</p>
        </div>
      </div>
    );
  }

  const websiteSettings =
    settings || defaultSettings;

  const homepage =
    websiteSettings.homepage ||
    defaultSettings.homepage;

  const hero =
    websiteSettings.hero ||
    defaultSettings.hero;

  const homeTheme =
    websiteSettings.homeTheme ||
    defaultSettings.homeTheme;

  const themeColor =
    /^#[0-9A-Fa-f]{6}$/.test(
      homeTheme.color || ""
    )
      ? homeTheme.color
      : defaultSettings.homeTheme.color;

  return (
    <div
      className="ocma-home"
      style={{
        "--home-theme": themeColor,
      }}
    >
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

      <Announcements />

      <Navbar data={websiteSettings} />

      {hero.showHero !== false && (
        <Hero data={hero} />
      )}

      {homepage.registeredMembers?.show !== false && (
        <section
          id="registered-members"
          className="home-section"
        >
          <RegisteredMembers />
        </section>
      )}

      {homepage.gallery?.show !== false && (
        <section
          id="gallery"
          className="home-section"
        >
          <MemberGallery />
        </section>
      )}

      {homepage.ocmaGallery?.show !== false && (
        <section
          id="ocma-gallery"
          className="home-section"
        >
          <OCMAGalleryPreview />
        </section>
      )}

      {homepage.seniorMembers?.show !== false && (
        <section
          id="senior-members"
          className="home-section"
        >
          <SeniorMembers />
        </section>
      )}

      {homepage.authority?.show !== false && (
        <section
          id="authority"
          className="home-section"
        >
          <Authority />
        </section>
      )}

      {homepage.training?.show !== false && (
        <section
          id="training"
          className="home-section"
        >
          <Training />
        </section>
      )}

      <Footer data={websiteSettings} />
    </div>
  );
}

export default Home;