import "./Settings.css";
import React, { useEffect, useState } from "react";
import {
  FaCog,
  FaGlobe,
  FaImage,
  FaUpload,
  FaBars,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaLink,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaSave,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { uploadImage } from "../services/cloudinary";



// ==========================================
// DEFAULT SETTINGS
// ==========================================

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


// ==========================================
// SETTINGS COMPONENT
// ==========================================

function Settings() {

  // ==========================================
  // STATE
  // ==========================================

  const [settings, setSettings] =
    useState(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const [logoUploading, setLogoUploading] =
    useState(false);

  const [bannerUploading, setBannerUploading] =
    useState(false);

  const [adminPhotoUploading, setAdminPhotoUploading] =
    useState(false);


  // ==========================================
  // SECURITY STATE
  // ==========================================

  const [security, setSecurity] = useState({
    adminEmail: "",
    mobile: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOldPassword, setShowOldPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);


  // ==========================================
  // LOAD SETTINGS ON PAGE LOAD
  // ==========================================

  useEffect(() => {
    loadWebsiteSettings();
  }, []);


  // ==========================================
  // LOAD SETTINGS
  // ==========================================

  const loadWebsiteSettings = async () => {

    try {

      setLoading(true);
      setError("");

      const settingsRef = doc(
        db,
        "websiteSettings",
        "main"
      );

      const snap = await getDoc(
        settingsRef
      );


      if (snap.exists()) {

        const data = snap.data();


        const mergedSettings = {

          ...defaultSettings,

          ...data,


          website: {
            ...defaultSettings.website,
            ...(data.website || {}),
          },


          hero: {
            ...defaultSettings.hero,
            ...(data.hero || {}),
          },


          navbar: {
            ...defaultSettings.navbar,
            ...(data.navbar || {}),

            items:
              Array.isArray(
                data.navbar?.items
              ) &&
              data.navbar.items.length > 0
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
              Array.isArray(
                data.footer?.quickLinks
              ) &&
              data.footer.quickLinks.length > 0
                ? data.footer.quickLinks
                : defaultSettings.footer.quickLinks,


            services:
              Array.isArray(
                data.footer?.services
              ) &&
              data.footer.services.length > 0
                ? data.footer.services
                : defaultSettings.footer.services,

          },

        };


        setSettings(
          mergedSettings
        );

      } else {

        await setDoc(
          settingsRef,
          defaultSettings
        );

        setSettings(
          defaultSettings
        );

      }

    } catch (err) {

      console.error(
        "Settings Load Error:",
        err
      );

      setError(
        "Settings load failed."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // GENERIC UPDATE
  // ==========================================

  const updateField = (
    section,
    key,
    value
  ) => {

    setSettings((prev) => ({

      ...prev,

      [section]: {

        ...prev[section],

        [key]: value,

      },

    }));

  };


  // ==========================================
  // HOMEPAGE UPDATE
  // ==========================================

  const updateHomepageSection = (
    section,
    key,
    value
  ) => {

    setSettings((prev) => ({

      ...prev,

      homepage: {

        ...prev.homepage,

        [section]: {

          ...prev.homepage[section],

          [key]: value,

        },

      },

    }));

  };


  // ==========================================
  // NAVBAR UPDATE
  // ==========================================

  const updateNavbar = (
    index,
    key,
    value
  ) => {

    setSettings((prev) => {

      const items = [
        ...prev.navbar.items,
      ];

      items[index] = {

        ...items[index],

        [key]: value,

      };


      return {

        ...prev,

        navbar: {

          ...prev.navbar,

          items,

        },

      };

    });

  };


  // ==========================================
  // FOOTER UPDATE
  // ==========================================

  const updateFooter = (
    key,
    value
  ) => {

    setSettings((prev) => ({

      ...prev,

      footer: {

        ...prev.footer,

        [key]: value,

      },

    }));

  };


  // ==========================================
  // QUICK LINK UPDATE
  // ==========================================

  const updateQuickLink = (
    index,
    key,
    value
  ) => {

    setSettings((prev) => {

      const quickLinks = [
        ...prev.footer.quickLinks,
      ];

      quickLinks[index] = {

        ...quickLinks[index],

        [key]: value,

      };


      return {

        ...prev,

        footer: {

          ...prev.footer,

          quickLinks,

        },

      };

    });

  };


  // ==========================================
  // ADD QUICK LINK
  // ==========================================

  const addQuickLink = () => {

    setSettings((prev) => ({

      ...prev,

      footer: {

        ...prev.footer,

        quickLinks: [

          ...prev.footer.quickLinks,

          {
            title: "New Link",
            link: "/",
          },

        ],

      },

    }));

  };


  // ==========================================
  // REMOVE QUICK LINK
  // ==========================================

  const removeQuickLink = (
    index
  ) => {

    setSettings((prev) => ({

      ...prev,

      footer: {

        ...prev.footer,

        quickLinks:
          prev.footer.quickLinks.filter(
            (_, i) => i !== index
          ),

      },

    }));

  };


  // ==========================================
  // SERVICE UPDATE
  // ==========================================

  const updateService = (
    index,
    value
  ) => {

    setSettings((prev) => {

      const services = [
        ...prev.footer.services,
      ];

      services[index] = value;


      return {

        ...prev,

        footer: {

          ...prev.footer,

          services,

        },

      };

    });

  };


  // ==========================================
  // ADD SERVICE
  // ==========================================

  const addService = () => {

    setSettings((prev) => ({

      ...prev,

      footer: {

        ...prev.footer,

        services: [

          ...prev.footer.services,

          "New Service",

        ],

      },

    }));

  };


  // ==========================================
  // REMOVE SERVICE
  // ==========================================

  const removeService = (
    index
  ) => {

    setSettings((prev) => ({

      ...prev,

      footer: {

        ...prev.footer,

        services:
          prev.footer.services.filter(
            (_, i) => i !== index
          ),

      },

    }));

  };


  // ==========================================
  // SOCIAL UPDATE
  // ==========================================

  const updateSocial = (
    key,
    value
  ) => {

    setSettings((prev) => ({

      ...prev,

      social: {

        ...prev.social,

        [key]: value,

      },

    }));

  };


  // ==========================================
  // SECURITY UPDATE
  // ==========================================

  const updateSecurity = (
    key,
    value
  ) => {

    setSecurity((prev) => ({

      ...prev,

      [key]: value,

    }));

  };


  // ==========================================
  // LOGO UPLOAD
  // ==========================================

  const handleLogoUpload = async (e) => {

    const file =
      e.target.files?.[0];

    if (!file) return;


    try {

      setLogoUploading(true);
      setError("");
      setSuccess("");


      const url =
        await uploadImage(file);


      updateField(
        "website",
        "logo",
        url
      );


      setSuccess(
        "Logo uploaded successfully."
      );

    } catch (err) {

      console.error(
        "Logo Upload Error:",
        err
      );

      setError(
        "Logo upload failed."
      );

    } finally {

      setLogoUploading(false);

      e.target.value = "";

    }

  };


  // ==========================================
  // HERO BANNER UPLOAD
  // ==========================================

  const handleBannerUpload = async (e) => {

    const file =
      e.target.files?.[0];

    if (!file) return;


    try {

      setBannerUploading(true);
      setError("");
      setSuccess("");


      const url =
        await uploadImage(file);


      updateField(
        "hero",
        "banner",
        url
      );


      setSuccess(
        "Hero banner uploaded successfully."
      );

    } catch (err) {

      console.error(
        "Banner Upload Error:",
        err
      );

      setError(
        "Hero banner upload failed."
      );

    } finally {

      setBannerUploading(false);

      e.target.value = "";

    }

  };


  // ==========================================
  // ADMIN PHOTO UPLOAD
  // ==========================================

  const handleAdminPhotoUpload =
    async (e) => {

      const file =
        e.target.files?.[0];

      if (!file) return;


      try {

        setAdminPhotoUploading(true);
        setError("");
        setSuccess("");


        const url =
          await uploadImage(file);


        updateFooter(
          "adminPhoto",
          url
        );


        setSuccess(
          "Admin photo uploaded successfully."
        );

    } catch (err) {

      console.error(
        "Admin Photo Upload Error:",
        err
      );

      setError(
        "Admin photo upload failed."
      );

    } finally {

      setAdminPhotoUploading(false);

      e.target.value = "";

    }

  };


  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  const saveSettings = async () => {

    try {

      setSaving(true);
      setError("");
      setSuccess("");


      await setDoc(

        doc(
          db,
          "websiteSettings",
          "main"
        ),

        settings,

        {
          merge: true,
        }

      );


      setSuccess(
        "Website settings saved successfully."
      );

    } catch (err) {

      console.error(
        "Settings Save Error:",
        err
      );

      setError(
        "Settings save failed."
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {

    return (

      <div className="settings-page">

        <div className="settings-loading">

          <FaSpinner className="loading-icon" />

          <h2>
            Loading Settings...
          </h2>

          <p>
            Please wait.
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // MAIN UI
  // ==========================================

  return (

    <div className="settings-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="settings-header">

        <div>

          <span className="settings-label">
            OCMA ADMIN PANEL
          </span>

          <h1>
            <FaCog />
            Website Control Center
          </h1>

          <p>
            Manage your complete OCMA
            website from one place.
          </p>

        </div>

      </div>


      {/* ======================================
          WEBSITE INFORMATION
      ====================================== */}

      <div className="settings-card">

        <div className="card-heading">

          <FaGlobe />

          <div>

            <h2>
              Website Information
            </h2>

            <p>
              Basic website and contact
              information.
            </p>

          </div>

        </div>


        <div className="input-grid">

          <div>

            <label>
              Website Name
            </label>

            <input
              value={
                settings.website.siteName
              }
              onChange={(e) =>
                updateField(
                  "website",
                  "siteName",
                  e.target.value
                )
              }
            />

          </div>


          <div>

            <label>
              Short Name
            </label>

            <input
              value={
                settings.website.shortName
              }
              onChange={(e) =>
                updateField(
                  "website",
                  "shortName",
                  e.target.value
                )
              }
            />

          </div>


          <div>

            <label>
              Contact Number
            </label>

            <input
              value={
                settings.website.phone
              }
              onChange={(e) =>
                updateField(
                  "website",
                  "phone",
                  e.target.value
                )
              }
            />

          </div>


          <div>

            <label>
              WhatsApp Number
            </label>

            <input
              value={
                settings.website.whatsapp
              }
              onChange={(e) =>
                updateField(
                  "website",
                  "whatsapp",
                  e.target.value
                )
              }
            />

          </div>


          <div>

            <label>
              Email
            </label>

            <input
              type="email"
              value={
                settings.website.email
              }
              onChange={(e) =>
                updateField(
                  "website",
                  "email",
                  e.target.value
                )
              }
            />

          </div>


          <div>

            <label>
              Address
            </label>

            <input
              value={
                settings.website.address
              }
              onChange={(e) =>
                updateField(
                  "website",
                  "address",
                  e.target.value
                )
              }
            />

          </div>

        </div>

      </div>


      {/* ======================================
          WEBSITE LOGO
      ====================================== */}

      <div className="settings-card">

        <div className="card-heading">

          <FaImage />

          <div>

            <h2>
              Website Logo
            </h2>

            <p>
              Upload and manage the
              website logo.
            </p>

          </div>

        </div>


        {settings.website.logo && (

          <div className="image-preview-box">

            <img
              src={
                settings.website.logo
              }
              alt="Website Logo"
              className="settings-preview"
            />

          </div>

        )}


        <label className="upload-btn">

          <FaUpload />

          {logoUploading
            ? "Uploading..."
            : "Upload Logo"}

          <input
            type="file"
            hidden
            accept="image/*"
            onChange={
              handleLogoUpload
            }
          />

        </label>

      </div>


      {/* ======================================
          HERO SECTION
      ====================================== */}

      <div className="settings-card">

        <div className="card-heading">

          <FaImage />

          <div>

            <h2>
              Hero Section
            </h2>

            <p>
              Control the main homepage
              banner and text.
            </p>

          </div>

        </div>


        <label>
          Hero Heading
        </label>

        <input
          value={
            settings.hero.heading
          }
          onChange={(e) =>
            updateField(
              "hero",
              "heading",
              e.target.value
            )
          }
        />


        <label>
          Hero Subtitle
        </label>

        <input
          value={
            settings.hero.subtitle
          }
          onChange={(e) =>
            updateField(
              "hero",
              "subtitle",
              e.target.value
            )
          }
        />


        <label>
          Hero Description
        </label>

        <textarea
          value={
            settings.hero.description
          }
          onChange={(e) =>
            updateField(
              "hero",
              "description",
              e.target.value
            )
          }
        />


        <label>
          Hero Small Text
        </label>

        <input
          value={
            settings.hero.smallText
          }
          onChange={(e) =>
            updateField(
              "hero",
              "smallText",
              e.target.value
            )
          }
        />


        <div className="input-grid">

          <div>

            <label>
              Primary Button Text
            </label>

            <input
              value={
                settings.hero.buttonOne
              }
              onChange={(e) =>
                updateField(
                  "hero",
                  "buttonOne",
                  e.target.value
                )
              }
            />

          </div>


          <div>

            <label>
              Secondary Button Text
            </label>

            <input
              value={
                settings.hero.buttonTwo
              }
              onChange={(e) =>
                updateField(
                  "hero",
                  "buttonTwo",
                  e.target.value
                )
              }
            />

          </div>

        </div>


        {settings.hero.banner && (

          <div className="banner-preview">

            <img
              src={
                settings.hero.banner
              }
              alt="Hero Banner"
              className="settings-banner-preview"
            />

          </div>

        )}


        <label className="upload-btn">

          <FaUpload />

          {bannerUploading
            ? "Uploading..."
            : "Upload Hero Banner"}

          <input
            type="file"
            hidden
            accept="image/*"
            onChange={
              handleBannerUpload
            }
          />

        </label>


        {/* ======================================
            HERO ON / OFF
        ====================================== */}

        <div className="switch-row">

          <div>

            <strong>
              Show Hero Section
            </strong>

            <span>
              Display hero section on
              homepage.
            </span>

          </div>


          <button
            type="button"
            className={
              settings.hero.showHero
                ? "switch active"
                : "switch"
            }
            onClick={() =>
              updateField(
                "hero",
                "showHero",
                !settings.hero.showHero
              )
            }
          >

            {settings.hero.showHero
              ? "ON"
              : "OFF"}

          </button>

        </div>


        {/* ======================================
            LIVE STATS ON / OFF
        ====================================== */}

        <div className="switch-row">

          <div>

            <strong>
              Show Live Statistics
            </strong>

            <span>
              Display live statistics
              inside the hero section.
            </span>

          </div>


          <button
            type="button"
            className={
              settings.hero.showLiveStats
                ? "switch active"
                : "switch"
            }
            onClick={() =>
              updateField(
                "hero",
                "showLiveStats",
                !settings.hero.showLiveStats
              )
            }
          >

            {settings.hero.showLiveStats
              ? "ON"
              : "OFF"}

          </button>

        </div>

      </div>


      {/* ======================================
          NAVBAR SETTINGS
      ====================================== */}

      <div className="settings-card">

        <div className="card-heading">

          <FaBars />

          <div>

            <h2>
              Navbar Settings
            </h2>

            <p>
              Manage navigation name,
              tagline and live network.
            </p>

          </div>

        </div>


        {/* ======================================
            NAVBAR NAME
        ====================================== */}

        <label>
          Navbar Name
        </label>

        <input
          value={
            settings.navbar.name
          }
          onChange={(e) =>
            updateField(
              "navbar",
              "name",
              e.target.value
            )
          }
        />


        {/* ======================================
            NAVBAR TAGLINE
        ====================================== */}

        <label>
          Navbar Tagline
        </label>

        <input
          value={
            settings.navbar.tagline
          }
          onChange={(e) =>
            updateField(
              "navbar",
              "tagline",
              e.target.value
            )
          }
        />


        {/* ======================================
            LIVE NETWORK ON / OFF
        ====================================== */}

        <div className="switch-row">

          <div>

            <strong>
              Show Live Network
            </strong>

            <span>
              Display live members, cities
              and city-wise member counts
              in the navbar.
            </span>

          </div>


          <button
            type="button"
            className={
              settings.navbar.showLiveNetwork
                ? "switch active"
                : "switch"
            }
            onClick={() =>
              updateField(
                "navbar",
                "showLiveNetwork",
                !settings.navbar.showLiveNetwork
              )
            }
          >

            {settings.navbar.showLiveNetwork
              ? "ON"
              : "OFF"}

          </button>

        </div>


        {/* ======================================
            MENU ITEMS
        ====================================== */}

        <h3 className="sub-heading">
          Menu Items
        </h3>


        <div className="menu-list">

          {settings.navbar.items.map(
            (item, index) => (

              <div
                className="menu-item"
                key={index}
              >

                <div>

                  <label>
                    Menu Title
                  </label>

                  <input
                    value={
                      item.title || ""
                    }
                    onChange={(e) =>
                      updateNavbar(
                        index,
                        "title",
                        e.target.value
                      )
                    }
                  />

                </div>


                <div>

                  <label>
                    Menu Link
                  </label>

                  <input
                    value={
                      item.link || ""
                    }
                    onChange={(e) =>
                      updateNavbar(
                        index,
                        "link",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            )
          )}

        </div>

      </div>


      {/* ======================================
          HOMEPAGE SECTIONS
      ====================================== */}

      <div className="settings-card">

        <div className="card-heading">

          <FaHome />

          <div>

            <h2>
              Homepage Sections
            </h2>

            <p>
              Change section titles and
              visibility.
            </p>

          </div>

        </div>


        {Object.keys(
          settings.homepage
        ).map((section) => {

          const sectionData =
            settings.homepage[
              section
            ];


          return (

            <div
              className="homepage-control"
              key={section}
            >

              {/* ================================
                  SECTION TITLE
              ================================= */}

              <div className="homepage-title">

                <label>
                  Section Title
                </label>

                <input
                  value={
                    sectionData.title ||
                    ""
                  }
                  onChange={(e) =>
                    updateHomepageSection(
                      section,
                      "title",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* ================================
                  VISIBILITY
              ================================= */}

              <div className="homepage-visibility">

                <label>
                  Visibility
                </label>

                <button
                  type="button"
                  className={
                    sectionData.show
                      ? "switch active"
                      : "switch"
                  }
                  onClick={() =>
                    updateHomepageSection(
                      section,
                      "show",
                      !sectionData.show
                    )
                  }
                >

                  {sectionData.show
                    ? "ON"
                    : "OFF"}

                </button>

              </div>

            </div>

          );

        })}

      </div>


      {/* ======================================
          FOOTER ABOUT
      ====================================== */}

      <div className="settings-card">

        <div className="card-heading">

          <FaInfoCircle />

          <div>

            <h2>
              Footer About OCMA
            </h2>

            <p>
              Manage the footer
              introduction.
            </p>

          </div>

        </div>


        <label>
          About Title
        </label>

        <input
          value={
            settings.footer.aboutTitle
          }
          onChange={(e) =>
            updateFooter(
              "aboutTitle",
              e.target.value
            )
          }
        />


        <label>
          About Description
        </label>

        <textarea
          rows="5"
          value={
            settings.footer.aboutDescription
          }
          onChange={(e) =>
            updateFooter(
              "aboutDescription",
              e.target.value
            )
          }
        />

      </div>


      {/* ======================================
          ADMIN / DEVELOPER PROFILE
      ====================================== */}

      <div className="settings-card">

        <div className="card-heading">

          <FaCog />

          <div>

            <h2>
              Admin / Developer Profile
            </h2>

            <p>
              Manage the profile shown
              in the website footer.
            </p>

          </div>

        </div>


        <label>
          Admin Section Title
        </label>

        <input
          value={
            settings.footer.adminSectionTitle
          }
          onChange={(e) =>
            updateFooter(
              "adminSectionTitle",
              e.target.value
            )
          }
        />


        <label>
          Admin Name
        </label>

        <input
          value={
            settings.footer.adminName
          }
          onChange={(e) =>
            updateFooter(
              "adminName",
              e.target.value
            )
          }
        />


        <label>
          Admin Role
        </label>

        <input
          value={
            settings.footer.adminRole
          }
          onChange={(e) =>
            updateFooter(
              "adminRole",
              e.target.value
            )
          }
        />


        <label>
          Developer Text
        </label>

        <input
          value={
            settings.footer.developerText
          }
          onChange={(e) =>
            updateFooter(
              "developerText",
              e.target.value
            )
          }
        />


        {/* ==================================
            ADMIN PHOTO PREVIEW
        ================================== */}

        {settings.footer.adminPhoto && (

          <div className="image-preview-box">

            <img
              src={
                settings.footer.adminPhoto
              }
              alt="Admin"
              className="settings-preview admin-settings-photo"
            />

          </div>

        )}


        {/* ==================================
            ADMIN PHOTO UPLOAD
        ================================== */}

        <label className="upload-btn">

          <FaUpload />

          {adminPhotoUploading
            ? "Uploading..."
            : "Upload Admin Photo"}

          <input
            type="file"
            hidden
            accept="image/*"
            onChange={
              handleAdminPhotoUpload
            }
          />

        </label>

      </div>


      {/* ======================================
          FOOTER MAP
      ====================================== */}

      <div className="settings-card">

        <div className="card-heading">

          <FaMapMarkerAlt />

          <div>

            <h2>
              Footer Map
            </h2>

            <p>
              Set the location displayed
              in the website footer.
            </p>

          </div>

        </div>


        <label>
          Map Title
        </label>

        <input
          value={
            settings.footer.mapTitle
          }
          onChange={(e) =>
            updateFooter(
              "mapTitle",
              e.target.value
            )
          }
        />


        <label>
          Map Click Text
        </label>

        <input
          value={
            settings.footer.mapClickText
          }
          onChange={(e) =>
            updateFooter(
              "mapClickText",
              e.target.value
            )
          }
        />


        <label>
          Google Maps Location Link
        </label>

        <input
          type="url"
          placeholder="https://maps.app.goo.gl/..."
          value={
            settings.footer.map
          }
          onChange={(e) =>
            updateFooter(
              "map",
              e.target.value
            )
          }
        />


        <label>
          Map Address / Search Location
        </label>

        <input
          value={
            settings.footer.mapAddress
          }
          onChange={(e) =>
            updateFooter(
              "mapAddress",
              e.target.value
            )
          }
        />


        {/* ==================================
            MAP INFORMATION
        ================================== */}

        <div className="info-note">

          <FaInfoCircle />

          <p>
            Google Maps میں اپنی
            location کھولیں، Share
            کریں، Copy Link کریں،
            پھر وہ link اوپر والے
            field میں paste کریں۔
            Map Address میں وہ جگہ
            لکھیں جسے map preview
            میں دکھانا ہے۔
          </p>

        </div>

      </div>


      {/* ======================================
          FOOTER QUICK LINKS
      ====================================== */}

      <div className="settings-card">

        <div className="card-heading">

          <FaLink />

          <div>

            <h2>
              Footer Quick Links
            </h2>

            <p>
              Manage links displayed
              in the footer.
            </p>

          </div>

        </div>


        <label>
          Quick Links Section Title
        </label>

        <input
          value={
            settings.footer.quickLinksTitle
          }
          onChange={(e) =>
            updateFooter(
              "quickLinksTitle",
              e.target.value
            )
          }
        />


        <h3 className="sub-heading">
          Links
        </h3>


        {/* ==================================
            QUICK LINKS LIST
        ================================== */}

        {settings.footer.quickLinks.map(
          (item, index) => (

            <div
              className="menu-item"
              key={index}
            >

              <div>

                <label>
                  Link Title
                </label>

                <input
                  value={
                    item.title || ""
                  }
                  onChange={(e) =>
                    updateQuickLink(
                      index,
                      "title",
                      e.target.value
                    )
                  }
                />

              </div>


              <div>

                <label>
                  Link URL
                </label>

                <input
                  value={
                    item.link || ""
                  }
                  onChange={(e) =>
                    updateQuickLink(
                      index,
                      "link",
                      e.target.value
                    )
                  }
                />

              </div>


              <button
                type="button"
                className="delete-btn"
                onClick={() =>
                  removeQuickLink(index)
                }
              >
                Remove
              </button>

            </div>

          )
        )}


        {/* ==================================
            ADD QUICK LINK
        ================================== */}

        <button
          type="button"
          className="secondary-action"
          onClick={addQuickLink}
        >
          + Add Quick Link
        </button>

      </div>


      {/* ======================================
          FOOTER SERVICES
      ====================================== */}

      <div className="settings-card">

        <div className="card-heading">

          <FaImage />

          <div>

            <h2>
              Footer Services
            </h2>

            <p>
              Manage services shown
              in the footer.
            </p>

          </div>

        </div>


        <label>
          Services Section Title
        </label>

        <input
          value={
            settings.footer.servicesTitle
          }
          onChange={(e) =>
            updateFooter(
              "servicesTitle",
              e.target.value
            )
          }
        />


        <h3 className="sub-heading">
          Services
        </h3>


        {/* ==================================
            SERVICES LIST
        ================================== */}

        {settings.footer.services.map(
          (service, index) => (

            <div
              className="service-item"
              key={index}
            >

              <input
                value={service}
                placeholder="Service"
                onChange={(e) =>
                  updateService(
                    index,
                    e.target.value
                  )
                }
              />


              <button
                type="button"
                className="delete-btn"
                onClick={() =>
                  removeService(index)
                }
              >
                Remove
              </button>

            </div>

          )
        )}


        {/* ==================================
            ADD SERVICE
        ================================== */}

        <button
          type="button"
          className="secondary-action"
          onClick={addService}
        >
          + Add Service
        </button>

      </div>
      {/* ======================================
    SOCIAL MEDIA / FOLLOW US
====================================== */}

<div className="settings-card">

  <div className="card-heading">

    <FaLink />

    <div>

      <h2>
        Social Media / Follow Us
      </h2>

      <p>
        Update the social media links
        displayed in the website footer.
      </p>

    </div>

  </div>


  <div className="input-grid">

    {/* FACEBOOK */}

    <div>

      <label>
        Facebook URL
      </label>

      <input
        type="url"
        placeholder="https://facebook.com/your-page"
        value={
          settings.social.facebook
        }
        onChange={(e) =>
          updateSocial(
            "facebook",
            e.target.value
          )
        }
      />

    </div>


    {/* INSTAGRAM */}

    <div>

      <label>
        Instagram URL
      </label>

      <input
        type="url"
        placeholder="https://instagram.com/your-page"
        value={
          settings.social.instagram
        }
        onChange={(e) =>
          updateSocial(
            "instagram",
            e.target.value
          )
        }
      />

    </div>


    {/* YOUTUBE */}

    <div>

      <label>
        YouTube URL
      </label>

      <input
        type="url"
        placeholder="https://youtube.com/@your-channel"
        value={
          settings.social.youtube
        }
        onChange={(e) =>
          updateSocial(
            "youtube",
            e.target.value
          )
        }
      />

    </div>


    {/* TIKTOK */}

    <div>

      <label>
        TikTok URL
      </label>

      <input
        type="url"
        placeholder="https://www.tiktok.com/@your-account"
        value={
          settings.social.tiktok
        }
        onChange={(e) =>
          updateSocial(
            "tiktok",
            e.target.value
          )
        }
      />

    </div>


    {/* WHATSAPP */}

    <div>

      <label>
        WhatsApp URL
      </label>

      <input
        type="url"
        placeholder="https://wa.me/923001234567"
        value={
          settings.social.whatsapp
        }
        onChange={(e) =>
          updateSocial(
            "whatsapp",
            e.target.value
          )
        }
      />

    </div>

  </div>

</div>

      {/* ======================================
          SECURITY SETTINGS
      ====================================== */}

      <div className="settings-card security-card">

        <div className="card-heading">

          <FaLock />

          <div>

            <h2>
              Security Settings
            </h2>

            <p>
              Admin security information.
            </p>

          </div>

        </div>


        <div className="input-grid">

          {/* ==================================
              ADMIN EMAIL
          ================================== */}

          <div>

            <label>
              Admin Email
            </label>

            <input
              type="email"
              value={
                security.adminEmail
              }
              onChange={(e) =>
                updateSecurity(
                  "adminEmail",
                  e.target.value
                )
              }
            />

          </div>


          {/* ==================================
              ADMIN MOBILE
          ================================== */}

          <div>

            <label>
              Admin Mobile Number
            </label>

            <input
              type="text"
              value={
                security.mobile
              }
              onChange={(e) =>
                updateSecurity(
                  "mobile",
                  e.target.value
                )
              }
            />

          </div>


          {/* ==================================
              OLD PASSWORD
          ================================== */}

          <div>

            <label>
              Old Password
            </label>

            <div className="password-box">

              <input
                type={
                  showOldPassword
                    ? "text"
                    : "password"
                }
                value={
                  security.oldPassword
                }
                onChange={(e) =>
                  updateSecurity(
                    "oldPassword",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowOldPassword(
                    !showOldPassword
                  )
                }
              >

                {showOldPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}

              </button>

            </div>

          </div>


          {/* ==================================
              NEW PASSWORD
          ================================== */}

          <div>

            <label>
              New Password
            </label>

            <div className="password-box">

              <input
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                value={
                  security.newPassword
                }
                onChange={(e) =>
                  updateSecurity(
                    "newPassword",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
              >

                {showNewPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}

              </button>

            </div>

          </div>


          {/* ==================================
              CONFIRM PASSWORD
          ================================== */}

          <div>

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              value={
                security.confirmPassword
              }
              onChange={(e) =>
                updateSecurity(
                  "confirmPassword",
                  e.target.value
                )
              }
            />

          </div>

        </div>


        <div className="info-note">

          <FaInfoCircle />

          <p>
            Password change will require
            admin verification.
          </p>

        </div>

      </div>


      {/* ======================================
          SAVE SETTINGS
      ====================================== */}

      <div className="save-action-row">

        <button
          className="save-btn"
          onClick={saveSettings}
          disabled={saving}
        >

          {saving ? (
            <FaSpinner
              className="button-spinner"
            />
          ) : (
            <FaSave />
          )}


          {saving
            ? "Saving Settings..."
            : "Save Website Settings"}

        </button>


        {/* ==================================
            SUCCESS MESSAGE
        ================================== */}

        {success && (

          <div className="save-status success-message">

            <FaCheckCircle />

            <span>
              {success}
            </span>

          </div>

        )}


        {/* ==================================
            ERROR MESSAGE
        ================================== */}

        {error && (

          <div className="save-status error-message">

            <FaTimesCircle />

            <span>
              {error}
            </span>

          </div>

        )}

      </div>

    </div>

  );

}


export default Settings;