import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getData } from "../services/firestoreService";

import "./Navbar.css";


function Navbar({ data }) {

  const location = useLocation();
  const navigate = useNavigate();

  const settings = data || {};

  const navbar = settings.navbar || {};
  const website = settings.website || {};
  const homepage = settings.homepage || {};


  /* =====================================================
     LIVE NETWORK DATA
  ===================================================== */

  const [activeMembers, setActiveMembers] = useState(0);

  const [cityData, setCityData] = useState([]);

  const [currentCity, setCurrentCity] = useState(0);


  /* =====================================================
     LOAD LIVE NETWORK
  ===================================================== */

  useEffect(() => {

    const loadLiveNetwork = async () => {

      try {

        const members =
          await getData("members");

        const active =
          (members || []).filter(
            (member) =>
              member.status === "ACTIVE"
          );

        setActiveMembers(active.length);


        /* =====================================
           CITY COUNTS
        ===================================== */

        const cityCounts = {};

        active.forEach((member) => {

          const city =
            member.city?.trim();

          if (!city) return;

          cityCounts[city] =
            (cityCounts[city] || 0) + 1;

        });


        /* =====================================
           CITY DATA
        ===================================== */

        const cities =
          Object.entries(cityCounts)
            .map(([city, count]) => ({
              city,
              count,
            }))
            .sort(
              (a, b) =>
                b.count - a.count
            );


        setCityData(cities);

        setCurrentCity(0);

      } catch (error) {

        console.log(
          "Navbar Live Network Error:",
          error
        );

      }

    };


    loadLiveNetwork();


    const refresh =
      setInterval(
        loadLiveNetwork,
        60000
      );


    return () =>
      clearInterval(refresh);

  }, []);


  /* =====================================================
     CITY AUTO CHANGE
  ===================================================== */

  useEffect(() => {

    if (cityData.length <= 1) {
      return;
    }


    const cityInterval =
      setInterval(() => {

        setCurrentCity(
          (previous) =>
            (previous + 1) %
            cityData.length
        );

      }, 3500);


    return () =>
      clearInterval(cityInterval);

  }, [cityData]);


  /* =====================================================
     CURRENT CITY
  ===================================================== */

  const selectedCity =
    cityData.length > 0
      ? cityData[currentCity]
      : null;


  /* =====================================================
     GO HOME
  ===================================================== */

  const goHome = (event) => {

    if (event) {
      event.preventDefault();
    }


    if (location.pathname !== "/") {

      navigate("/");


      setTimeout(() => {

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

      }, 500);

    } else {

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    }

  };


  /* =====================================================
     SCROLL SECTION
  ===================================================== */

  const scrollSection = (id) => {

    if (location.pathname !== "/") {

      navigate("/");


      setTimeout(() => {

        const element =
          document.querySelector(id);


        if (element) {

          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

        }

      }, 500);

    } else {

      const element =
        document.querySelector(id);


      if (element) {

        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      }

    }

  };


  /* =====================================================
     SECTION VISIBILITY
  ===================================================== */

  const isSectionVisible = (item) => {

    const link =
      item?.link || "";

    const type =
      item?.type || "";


    /* =========================================
       ABOUT
    ========================================= */

    if (
      link === "/about" ||
      link === "/#about" ||
      link === "#about"
    ) {

      return (
        homepage.about?.show !== false
      );

    }


    /* =========================================
       OCMA GALLERY
    ========================================= */

    if (
      link === "/ocma-gallery" ||
      link === "/#ocma-gallery" ||
      link === "#ocma-gallery"
    ) {

      return (
        homepage.ocmaGallery?.show !== false
      );

    }


    /* =========================================
       MEMBER GALLERY
    ========================================= */

    if (
      link === "/#gallery" ||
      link === "#gallery"
    ) {

      return (
        homepage.gallery?.show !== false
      );

    }


    /* =========================================
       REGISTERED MEMBERS
    ========================================= */

    if (
      link === "/#registered-members" ||
      link === "#registered-members"
    ) {

      return (
        homepage.registeredMembers?.show !== false
      );

    }


    /* =========================================
       SENIOR MEMBERS
    ========================================= */

    if (
      link === "/#senior-members" ||
      link === "#senior-members"
    ) {

      return (
        homepage.seniorMembers?.show !== false
      );

    }


    /* =========================================
       AUTHORITY
    ========================================= */

    if (
      link === "/#authority" ||
      link === "#authority"
    ) {

      return (
        homepage.authority?.show !== false
      );

    }


    /* =========================================
       TRAINING
    ========================================= */

    if (
      link === "/#training" ||
      link === "#training"
    ) {

      return (
        homepage.training?.show !== false
      );

    }


    /* =========================================
       ANNOUNCEMENTS
    ========================================= */

    if (
      link === "/#announcements" ||
      link === "#announcements"
    ) {

      return (
        homepage.announcements?.show !== false
      );

    }


    /* =========================================
       GALLERY DROPDOWN
    ========================================= */

    if (type === "gallery") {

      const ocmaGalleryEnabled =
        homepage.ocmaGallery?.show === true;

      const memberGalleryEnabled =
        homepage.gallery?.show === true;


      return (
        ocmaGalleryEnabled ||
        memberGalleryEnabled
      );

    }


    /* =========================================
       HOME
       
       Home should always remain available.
    ========================================= */

    if (link === "/") {

      return true;

    }


    /* =========================================
       OTHER NORMAL LINKS
    ========================================= */

    return true;

  };


  /* =====================================================
     NAVBAR
  ===================================================== */

  return (

    <nav className="navbar">


      {/* =================================================
          LOGO
      ================================================= */}

      <div className="nav-logo">

        <Link
          to="/"
          className="logo-link"
          onClick={goHome}
        >

          <img
            src={
              website.logo ||
              "/assets/LOGO copy.PNG"
            }
            alt="OCMA Logo"
          />


          <div className="logo-text">

            <h3>
              {navbar.name ||
                website.shortName ||
                "OCMA"}
            </h3>


            <span>
              {navbar.tagline ||
                website.siteName ||
                "Official Website"}
            </span>

          </div>

        </Link>

      </div>


      {/* =================================================
          LIVE NETWORK
      ================================================= */}

      {navbar.showLiveNetwork !== false && (

        <div className="nav-live-network">


          {/* ACTIVE MEMBERS */}

          <div className="nav-live-item nav-members-item">

            <span className="nav-live-dot"></span>

            <span className="nav-live-label">
              LIVE
            </span>

            <strong>
              {activeMembers}
            </strong>

            <small>
              MEMBERS
            </small>

          </div>


          {/* SEPARATOR */}

          <span className="nav-live-separator">
            |
          </span>


          {/* CITY COUNT */}

          <div className="nav-live-item nav-city-count-item">

            <span className="nav-city-icon">
              ◉
            </span>

            <strong>
              {cityData.length}
            </strong>

            <small>
              CITIES
            </small>

          </div>


          {/* SEPARATOR */}

          <span className="nav-live-separator">
            |
          </span>


          {/* LIVE CITY */}

          <div className="nav-live-city-display">

            {selectedCity ? (

              <div
                className="nav-live-city"
                key={
                  selectedCity.city +
                  selectedCity.count
                }
              >

                <span className="nav-city-live-dot"></span>

                <strong>
                  {selectedCity.city}
                </strong>

                <small>
                  {selectedCity.count}{" "}
                  {selectedCity.count === 1
                    ? "Member"
                    : "Members"}
                </small>

              </div>

            ) : (

              <div className="nav-live-city nav-city-loading">

                <span className="nav-city-live-dot"></span>

                <small>
                  Members joining...
                </small>

              </div>

            )}

          </div>

        </div>

      )}


      {/* =================================================
          NAVIGATION LINKS
      ================================================= */}

      <div className="nav-links">


        {navbar.items?.map(
          (item, index) => {


            /* =========================================
               VISIBILITY CHECK
            ========================================= */

            if (
              !isSectionVisible(item)
            ) {

              return null;

            }


            /* =========================================
               GALLERY DROPDOWN
            ========================================= */

            if (
              item.type === "gallery"
            ) {

              const showOCMAGallery =
                homepage.ocmaGallery?.show === true;

              const showMemberGallery =
                homepage.gallery?.show === true;


              /* BOTH OFF */

              if (
                !showOCMAGallery &&
                !showMemberGallery
              ) {

                return null;

              }


              return (

                <div
                  className="gallery-menu"
                  key={index}
                >

                  <span className="gallery-title">

                    {item.title ||
                      "Gallery"}

                  </span>


                  <div className="gallery-dropdown">


                    {/* OCMA GALLERY */}

                    {showOCMAGallery && (

                      <Link
                        to="/ocma-gallery"
                      >

                        {item.ocmaTitle ||
                          "OCMA Gallery"}

                      </Link>

                    )}


                    {/* MEMBER GALLERY */}

                    {showMemberGallery && (

                      <a
                        href="/#gallery"
                        onClick={(e) => {

                          e.preventDefault();

                          scrollSection(
                            "#gallery"
                          );

                        }}
                      >

                        {item.memberTitle ||
                          "Member Gallery"}

                      </a>

                    )}

                  </div>

                </div>

              );

            }


            /* =========================================
               HOME SECTION LINKS
            ========================================= */

            if (
              item.link?.startsWith("/#")
            ) {

              return (

                <a
                  key={index}
                  href={item.link}
                  onClick={(e) => {

                    e.preventDefault();

                    scrollSection(
                      "#" +
                      item.link.split("#")[1]
                    );

                  }}
                >

                  {item.title}

                </a>

              );

            }


            /* =========================================
               HOME
            ========================================= */

            if (
              item.link === "/"
            ) {

              return (

                <Link
                  key={index}
                  to="/"
                  onClick={goHome}
                >

                  {item.title}

                </Link>

              );

            }


            /* =========================================
               NORMAL LINK
            ========================================= */

            return (

              <Link
                key={index}
                to={item.link}
              >

                {item.title}

              </Link>

            );

          }
        )}

      </div>

    </nav>

  );

}


export default Navbar;