import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";
import { getData } from "../services/firestoreService";

import "./SeniorMembers.css";

function SeniorMembers() {
  const [members, setMembers] = useState([]);
  const [randomMembers, setRandomMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const membersPerPage = 8;

  const [sectionTitle, setSectionTitle] = useState(
    "All Senior Members of OCMA"
  );

  const [sectionDescription, setSectionDescription] = useState(
    "Our respected senior members who have contributed their experience and services for the cameramen community."
  );

  const [selectedImage, setSelectedImage] = useState(null);

  /* =====================================================
     LOAD MEMBERS
  ===================================================== */

  const loadMembers = async () => {
    try {
      const data = await getData("seniorMembers");
      setMembers(data);
    } catch (error) {
      console.log("Senior Members Error:", error);
    }
  };

  /* =====================================================
     LOAD SECTION SETTINGS
  ===================================================== */

  const loadSectionSettings = async () => {
    try {
      const ref = doc(db, "websiteSettings", "main");
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const data = snap.data();

      const shortName =
        data.website?.shortName?.trim() || "OCMA";

      const settings = data.homepage?.seniorMembers;

      setSectionTitle(
        settings?.title ||
          `All Senior Members of ${shortName}`
      );

      setSectionDescription(
        settings?.description ||
          "Our respected senior members who have contributed their experience and services for the cameramen community."
      );
    } catch (error) {
      console.log("Senior Settings Error:", error);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadMembers();
    loadSectionSettings();
  }, []);

  /* =====================================================
     SHUFFLE ALL MEMBERS
  ===================================================== */

  const shuffleMembers = (list) => {
    const shuffled = [...list];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(
        Math.random() * (i + 1)
      );

      [shuffled[i], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[i],
      ];
    }

    return shuffled;
  };

  /* =====================================================
     INITIAL RANDOM ORDER
     ALL MEMBERS ARE SHUFFLED
  ===================================================== */

  useEffect(() => {
    if (members.length === 0) return;

    setRandomMembers(shuffleMembers(members));
    setCurrentPage(1);
  }, [members]);

  /* =====================================================
     RANDOM CHANGE ONLY ON PAGE 1
  ===================================================== */

  useEffect(() => {
    if (
      currentPage !== 1 ||
      randomMembers.length <= 1
    ) {
      return;
    }

    const interval = setInterval(() => {
      setRandomMembers((previous) =>
        shuffleMembers(previous)
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [currentPage, randomMembers.length]);

  /* =====================================================
     PHOTO POPUP
  ===================================================== */

  useEffect(() => {
    if (!selectedImage) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.ceil(
    randomMembers.length / membersPerPage
  );

  const startIndex =
    (currentPage - 1) * membersPerPage;

  const paginatedMembers = randomMembers.slice(
    startIndex,
    startIndex + membersPerPage
  );

  /* =====================================================
     KEEP PAGE VALID
  ===================================================== */

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =====================================================
     PAGE NUMBERS
  ===================================================== */

  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <section className="public-senior-section">

        {/* SECTION HEADER */}

        <div className="public-senior-heading">

          <span className="public-senior-line"></span>

          <h2>{sectionTitle}</h2>

          <p>{sectionDescription}</p>

        </div>

        {/* MEMBERS */}

        <div className="public-senior-grid">

          {paginatedMembers.map((member) => {

            const stars = Math.min(
              Math.max(
                Number(member.stars) || 5,
                1
              ),
              5
            );

            const phone = member.phone
              ? member.phone
                  .replace(/\D/g, "")
                  .replace(/^0/, "92")
              : "";

            const image =
              member.image ||
              "/assets/ocma-logo.png";

            return (
              <article
                className="public-senior-card"
                key={member.id}
              >

                {/* TOP PHOTO */}

                <div className="public-senior-photo-wrap">

                  <a
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="public-senior-photo-link"
                    aria-label={`Open ${
                      member.name ||
                      "Senior Member"
                    } photo`}
                    onClick={(event) => {
                      event.preventDefault();
                      setSelectedImage(image);
                    }}
                  >

                    <div className="public-senior-photo">

                      <img
                        src={image}
                        alt={
                          member.name ||
                          "Senior Member"
                        }
                        loading="lazy"
                      />

                    </div>

                  </a>

                  <span className="public-senior-badge">
                    SENIOR
                  </span>

                </div>

                {/* CARD BODY */}

                <div className="public-senior-body">

                  <h3 className="public-senior-name">
                    {member.name ||
                      "Senior Member"}
                  </h3>

                  <p className="public-senior-designation">
                    {member.designation ||
                      "Senior Member"}
                  </p>

                  {/* DETAILS */}

                  <div className="public-senior-details">

                    {member.profession && (
                      <div className="public-senior-detail">

                        <span className="public-senior-detail-label">
                          PROFESSION
                        </span>

                        <strong className="public-senior-detail-value">
                          {member.profession}
                        </strong>

                      </div>
                    )}

                    {member.city && (
                      <div className="public-senior-detail">

                        <span className="public-senior-detail-label">
                          CITY
                        </span>

                        <strong className="public-senior-detail-value">
                          {member.city}
                        </strong>

                      </div>
                    )}

                  </div>

                  {/* RATING */}

                  <div className="public-senior-rating">

                    <div className="public-senior-stars">
                      {"★".repeat(stars)}
                      {"☆".repeat(5 - stars)}
                    </div>

                    <span className="public-senior-rating-number">
                      {stars}.0 Rating
                    </span>

                  </div>

                  {/* CONTACT */}

                  {(phone ||
                    member.memberCode) && (

                    <div className="public-senior-contact">

                      {phone && (
                        <a
                          href={`https://wa.me/${phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="public-senior-whatsapp"
                        >

                          <span>
                            WhatsApp Contact
                          </span>

                          <span className="public-senior-whatsapp-arrow">
                            →
                          </span>

                        </a>
                      )}

                      {member.memberCode && (
                        <span className="public-senior-member-code">
                          {member.memberCode}
                        </span>
                      )}

                    </div>

                  )}

                </div>

              </article>
            );
          })}

        </div>

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="senior-pagination">

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(page - 1, 1)
                )
              }
            >
              Previous
            </button>

            <div className="senior-pagination-numbers">

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  className={
                    currentPage === page
                      ? "active-page"
                      : ""
                  }
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>
              ))}

            </div>

            <button
              type="button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    page + 1,
                    totalPages
                  )
                )
              }
            >
              Next
            </button>

          </div>
        )}

      </section>

      {/* PHOTO POPUP */}

      {selectedImage && (
        <div
          className="public-senior-photo-popup"
          onClick={() =>
            setSelectedImage(null)
          }
        >

          <button
            type="button"
            className="public-senior-photo-popup-close"
            onClick={() =>
              setSelectedImage(null)
            }
            aria-label="Close photo"
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt="Senior Member"
            className="public-senior-photo-popup-image"
            onClick={(event) =>
              event.stopPropagation()
            }
          />

        </div>
      )}

    </>
  );
}

export default SeniorMembers;