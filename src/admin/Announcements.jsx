import { useEffect, useState } from "react";

import {
  addData,
  getData,
  deleteData,
} from "../services/firestoreService";

import { uploadImage } from "../services/cloudinary";

import "./Announcements.css";


function Announcements() {

  const collectionName = "announcements";

  const [announcements, setAnnouncements] = useState([]);

  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const [loadingData, setLoadingData] = useState(true);


  // ==========================================
  // LOAD ANNOUNCEMENTS
  // ==========================================

  const loadAnnouncements = async () => {

    try {

      setLoadingData(true);

      const data = await getData(collectionName);

      setAnnouncements(data || []);

    } catch (error) {

      console.error(
        "Announcements Load Error:",
        error
      );

    } finally {

      setLoadingData(false);

    }

  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    loadAnnouncements();

  }, []);


  // ==========================================
  // IMAGE UPLOAD
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!image) {

      alert("Please select an announcement image.");

      return;

    }


    try {

      setLoading(true);


      // Upload image to Cloudinary
      const imageUrl = await uploadImage(image);


      // Save only image information
      await addData(
        collectionName,
        {
          image: imageUrl,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        }
      );


      // Reset
      setImage(null);


      // Reset file input
      const fileInput =
        document.getElementById(
          "announcement-image-input"
        );

      if (fileInput) {

        fileInput.value = "";

      }


      // Reload
      await loadAnnouncements();


    } catch (error) {

      console.error(
        "Announcement Upload Error:",
        error
      );

      alert(
        "Announcement upload failed."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // DELETE ANNOUNCEMENT
  // ==========================================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this announcement?"
      );


    if (!confirmDelete) {

      return;

    }


    try {

      await deleteData(
        collectionName,
        id
      );

      await loadAnnouncements();

    } catch (error) {

      console.error(
        "Announcement Delete Error:",
        error
      );

      alert(
        "Announcement delete failed."
      );

    }

  };


  // ==========================================
  // MAIN UI
  // ==========================================

  return (

    <div className="announcement-admin">

      {/* ======================================
          HEADER
      ====================================== */}

      <h1>
        Announcement Management
      </h1>


      {/* ======================================
          UPLOAD FORM
      ====================================== */}

      <form
        className="announcement-form"
        onSubmit={handleSubmit}
      >

        <div>

          <label>
            Upload A4 Announcement
          </label>

          <p
            style={{
              color: "#aaa",
              fontSize: "13px",
              marginTop: "6px",
            }}
          >
            Upload the complete notice as an image.
            No title or description is required.
          </p>

        </div>


        <input
          id="announcement-image-input"
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(
              e.target.files?.[0] || null
            )
          }
        />


        {/* SELECTED IMAGE PREVIEW */}

        {image && (

          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "10px",
              marginTop: "5px",
            }}
          >

            <img
              src={URL.createObjectURL(image)}
              alt="Announcement Preview"
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "contain",
                display: "block",
              }}
            />

          </div>

        )}


        <button
          type="submit"
          disabled={loading || !image}
        >

          {loading
            ? "Uploading..."
            : "Upload Announcement"}

        </button>

      </form>


      {/* ======================================
          EXISTING ANNOUNCEMENTS
      ====================================== */}

      <div className="announcement-list">

        {loadingData ? (

          <div
            style={{
              color: "#aaa",
              padding: "20px",
            }}
          >
            Loading announcements...
          </div>

        ) : announcements.length === 0 ? (

          <div
            style={{
              color: "#aaa",
              padding: "20px",
            }}
          >
            No announcements uploaded yet.
          </div>

        ) : (

          announcements.map((item) => (

            <div
              className="announcement-card"
              key={item.id}
            >

              {/* IMAGE */}

              {item.image && (

                <img
                  className="announcement-thumb"
                  src={item.image}
                  alt="OCMA Announcement"
                />

              )}


              {/* DELETE */}

              <button
                type="button"
                className="delete-btn"
                onClick={() =>
                  handleDelete(item.id)
                }
              >
                Delete
              </button>

            </div>

          ))

        )}

      </div>

    </div>

  );

}


export default Announcements;