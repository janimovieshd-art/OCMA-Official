
import { useEffect, useState } from "react";

import {
  getData,
} from "../services/firestoreService";

import "./Announcements.css";


function Announcements() {

  const collectionName = "announcements";

  const [announcements, setAnnouncements] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(true);

  const [hidden, setHidden] = useState(false);


  // ==========================================
  // LOAD ANNOUNCEMENTS
  // ==========================================

  useEffect(() => {

    const loadAnnouncements = async () => {

      try {

        const data = await getData(
          collectionName
        );

        const activeData = (data || []).filter(
          (item) =>
            item.status !== "INACTIVE" &&
            item.image
        );

        setAnnouncements(activeData);

      } catch (error) {

        console.error(
          "Announcements Load Error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    loadAnnouncements();

  }, []);


  // ==========================================
  // HIDE PANEL
  // ==========================================

  const hideAnnouncement = () => {

    setHidden(true);

  };


  // ==========================================
  // CLOSE IMAGE
  // ==========================================

  const closeImage = () => {

    setSelectedImage(null);

  };


  // ==========================================
  // ESC KEY
  // ==========================================

  useEffect(() => {

    const handleKeyDown = (event) => {

      if (event.key === "Escape") {

        setSelectedImage(null);

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, []);


  // ==========================================
  // LOADING / EMPTY / HIDDEN
  // ==========================================

  if (
    loading ||
    announcements.length === 0 ||
    hidden
  ) {

    return null;

  }


  // ==========================================
  // MAIN FLOATING ANNOUNCEMENT
  // ==========================================

  return (

    <>

      {/* ======================================
          FIXED FLOATING ANNOUNCEMENT
      ====================================== */}

      <div className="public-announcements">

        {/* CLOSE / HIDE BUTTON */}

        <button
          type="button"
          className="announcement-hide"
          onClick={hideAnnouncement}
          aria-label="Hide announcement"
          title="Hide announcement"
        >
          ×
        </button>


        {/* PANEL HEADER */}

        <div className="announcement-panel-header">

          <span className="announcement-live-dot" />

          <span>
            OCMA Announcement
          </span>

        </div>


        {/* ANNOUNCEMENT CONTENT */}

        <div className="announcement-panel-body">

          <div className="announcement-ticker">

            <div className="announcement-ticker-track">

              {announcements.map((item) => (

                <button
                  key={item.id}
                  type="button"
                  className="announcement-image-item"
                  onClick={() =>
                    setSelectedImage(item.image)
                  }
                  aria-label="Open announcement"
                >

                  <img
                    src={item.image}
                    alt="OCMA Announcement"
                  />

                  <div className="announcement-image-overlay">

                    <span>
                      Click to view
                    </span>

                  </div>

                </button>

              ))}

            </div>

          </div>

        </div>


        {/* PANEL FOOTER */}

        <div className="announcement-panel-footer">

          <span>
            Official OCMA Notice
          </span>

        </div>

      </div>


      {/* ======================================
          FULL IMAGE MODAL
      ====================================== */}

      {selectedImage && (

        <div
          className="announcement-modal"
          onClick={closeImage}
        >

          <div
            className="announcement-modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE MODAL */}

            <button
              type="button"
              className="announcement-close"
              onClick={closeImage}
              aria-label="Close"
            >
              ×
            </button>


            {/* FULL IMAGE */}

            <img
              src={selectedImage}
              alt="OCMA Announcement"
              className="announcement-full-image"
            />

          </div>

        </div>

      )}

    </>

  );

}


export default Announcements;

