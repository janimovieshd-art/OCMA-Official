import { Link } from "react-router-dom";

import heroImage from "../assets/hero-camera-drone.png";

import "./Hero.css";

function Hero({ data }) {
  /* =====================================
     HERO SETTINGS
  ===================================== */

  const hero = {
    heading:
      data?.heading ||
      "All Pakistan Professional Cameramen Finder",

    subtitle:
      data?.subtitle ||
      "A National Platform For Photography & Videography Services",

    description:
      data?.description ||
      "Welcome to OCMA Professional Camera Network",

    smallText:
      data?.smallText ||
      "Pakistan Professional Photography & Media Network",

    buttonOne:
      data?.buttonOne ||
      "Search Professionals",

    buttonTwo:
      data?.buttonTwo ||
      "Join OCMA Network",

    banner:
      data?.banner || "",

    /*
      Settings سے false آئے تو Hero بند ہوگا۔
      undefined/null کی صورت میں Hero ON رہے گا۔
    */
    showHero:
      data?.showHero !== false,

    floating:
      data?.floating || {
        show: true,

        items: [
          "Photographer",
          "Drone Operator",
          "Videographer",
          "Cinematographer",
        ],
      },
  };

  /* =====================================
     HERO OFF
  ===================================== */

  if (hero.showHero === false) {
    return null;
  }

  /* =====================================
     HERO
  ===================================== */

  return (
    <section
      className="hero"
      style={{
        backgroundImage: `url(${hero.banner || heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* =====================================
          MAIN HERO CONTENT
      ===================================== */}

      <div className="hero-overlay">

        {/* =====================================
            FLOATING PROFESSIONS
        ===================================== */}

        {hero.floating?.show !== false && (
          <div className="hero-floating">
            {hero.floating?.items?.map(
              (item, index) => (
                <span key={index}>
                  {item}
                </span>
              )
            )}
          </div>
        )}

        {/* =====================================
            MAIN HEADING
        ===================================== */}

        <h1>
          {hero.heading}
        </h1>

        {/* =====================================
            SUBTITLE
        ===================================== */}

        <p className="hero-subtitle">
          {hero.subtitle}
        </p>

        {/* =====================================
            DESCRIPTION
        ===================================== */}

        <p className="hero-text">
          {hero.description}
        </p>

        {/* =====================================
            SMALL TEXT
        ===================================== */}

        <p className="hero-small">
          {hero.smallText}
        </p>

        {/* =====================================
            BUTTONS
        ===================================== */}

        <div className="hero-buttons">

          <Link
            to="/members"
            className="hero-btn primary-btn"
          >
            {hero.buttonOne}
          </Link>

          <Link
            to="/join-ocma"
            className="hero-btn secondary-btn"
          >
            {hero.buttonTwo}
          </Link>

        </div>

      </div>
    </section>
  );
}

export default Hero;