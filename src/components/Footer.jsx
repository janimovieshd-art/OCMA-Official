
import "./Footer.css";

function Footer({ data }) {
  const settings = data || {};

  const website = settings.website || {};
  const social = settings.social || {};
  const footer = settings.footer || {};

  /* ================================
     WHATSAPP NUMBER
  ================================= */

  const whatsappNumber = website.whatsapp
    ? website.whatsapp.replace(/\D/g, "").replace(/^0/, "92")
    : "";

  /* ================================
     MAP
  ================================= */

  const mapLink =
    footer.map?.trim() ||
    "https://www.google.com/maps/search/?api=1&query=Pakistan";

  const mapAddress =
    footer.mapAddress?.trim() || "Pakistan";

  const mapEmbedUrl =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(mapAddress) +
    "&output=embed";

  /* ================================
     QUICK LINKS
  ================================= */

  const quickLinks = footer.quickLinks || [
    {
      title: "Home",
      link: "/",
    },
    {
      title: "Registered Members",
      link: "/#registered-members",
    },
    {
      title: "Senior Members",
      link: "/#senior-members",
    },
    {
      title: "Gallery",
      link: "/ocma-gallery",
    },
    {
      title: "Join OCMA",
      link: "/join-ocma",
    },
  ];

  /* ================================
     SERVICES
  ================================= */

  const services = footer.services || [
    "📷 Professional Photography",
    "🎥 Video Production",
    "🚁 Drone Services",
    "🎬 Cinematography",
  ];

  return (
    <footer className="footer">

      {/* =================================
          PREMIUM ABOUT US
      ================================= */}

      <section
        id="about"
        className="footer-about-section"
      >
        <div className="footer-about-content">

         

          <h2>
            {footer.aboutTitle || "About OCMA"}
          </h2>

          <div className="footer-about-line" />

          <p>
            {footer.aboutDescription ||
              "Okara Cameramen Association (OCMA) is a professional platform for photographers, videographers, drone operators and media professionals across Pakistan."}
          </p>

        </div>
      </section>


      {/* =================================
          FOOTER MAIN CONTAINER
      ================================= */}

      <div className="footer-container">

        {/* =================================
            QUICK LINKS
        ================================= */}

        <div className="footer-box footer-quick-links">

          <h3>
            {footer.quickLinksTitle || "Quick Links"}
          </h3>

          <div className="footer-links">

            {quickLinks.map((item, index) => {
              if (!item?.title) return null;

              return (
                <a
                  href={item.link || "#"}
                  key={index}
                >
                  {item.title}
                </a>
              );
            })}

          </div>

        </div>


        {/* =================================
            SERVICES
        ================================= */}

        <div className="footer-box footer-services">

          <h3>
            {footer.servicesTitle || "Services"}
          </h3>

          <div className="footer-services-list">

            {services.map((service, index) => {
              if (!service) return null;

              return (
                <p key={index}>
                  {service}
                </p>
              );
            })}

          </div>

        </div>


        {/* =================================
            CONTACT
        ================================= */}

        <div className="footer-box footer-contact">

          <h3>
            {footer.contactTitle || "Contact"}
          </h3>

          <div className="contact-item">

            <strong>
              {footer.emailLabel || "📧 Email"}
            </strong>

            <span>
              {website.email || "-"}
            </span>

          </div>


          <div className="contact-item">

            <strong>
              {footer.phoneLabel || "📞 Phone"}
            </strong>

            <span>
              {website.phone || "-"}
            </span>

          </div>


          <div className="contact-item">

            <strong>
              {footer.whatsappLabel || "💬 WhatsApp"}
            </strong>

            <span>
              {website.whatsapp || "-"}
            </span>

          </div>


          {whatsappNumber && (
            <a
              href={
                "https://wa.me/" +
                whatsappNumber
              }
              target="_blank"
              rel="noopener noreferrer"
              className="contact-admin-btn"
            >
              {footer.contactAdminText ||
                "Contact Admin"}
            </a>
          )}

        </div>


        {/* =================================
            ADMIN / DEVELOPER PROFILE
        ================================= */}

        <div className="footer-box admin-profile-box">

          <h3>
            {footer.adminSectionTitle ||
              "Developed & Managed By"}
          </h3>

          <div className="admin-profile-card">

            <div className="admin-photo-wrapper">

              <img
                src={
                  footer.adminPhoto ||
                  "/assets/Jani Admin And Modeator Of OCMA.jpg"
                }
                alt={
                  footer.adminName ||
                  "OCMA Admin"
                }
                className="admin-profile-photo"
              />

            </div>

            <h2>
              {footer.adminName ||
                "Ramzan Jani"}
            </h2>

            <h4>
              {footer.adminRole ||
                "Admin & Moderator"}
            </h4>

            <p>
              {footer.developerText ||
                "Founder & Developer"}
            </p>

          </div>

        </div>

      </div>


      {/* =================================
          LOCATION / MAP
      ================================= */}

      <div className="map-section">

        <div className="map-box">

          <h3>
            {footer.mapTitle ||
              "OCMA Location"}
          </h3>

          <p className="map-click-text">
            {footer.mapClickText ||
              "📍 Click on the map to open location"}
          </p>

          <div className="map-preview">

            <iframe
              src={mapEmbedUrl}
              loading="lazy"
              title={
                footer.mapTitle ||
                "OCMA Location"
              }
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="map-click-layer"
              aria-label="Open OCMA Location in Google Maps"
            />

          </div>

        </div>

      </div>


      {/* =================================
          SOCIAL MEDIA
      ================================= */}

      <div className="social-section">

        <h3>
          {footer.socialTitle ||
            "Follow Us"}
        </h3>

        <div className="social-links">

          {social.facebook && (
            <a
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          )}

          {social.instagram && (
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              📷 Instagram
            </a>
          )}

          {social.youtube && (
            <a
              href={social.youtube}
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶ YouTube
            </a>
          )}

          {social.tiktok && (
            <a
              href={social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
            >
              TikTok
            </a>
          )}

        </div>

      </div>


      {/* =================================
          COPYRIGHT
      ================================= */}

      <div className="footer-bottom">

        <span>
          © {new Date().getFullYear()}
        </span>

        <span>
          {website.siteName ||
            "Okara Cameramen Association"}
        </span>

        <span className="copyright-divider">
          |
        </span>

        <span>
          {footer.copyright ||
            "All Rights Reserved"}
        </span>

      </div>

    </footer>
  );
}

export default Footer;

