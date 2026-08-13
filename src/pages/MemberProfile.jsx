import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getData } from "../services/firestoreService";

import "./MemberProfile.css";


function MemberProfile() {

  const { memberId } = useParams();

  const [member, setMember] = useState(null);

  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState("");

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const [shareMessage, setShareMessage] = useState("");


  // =====================================================
  // LOAD MEMBER
  // =====================================================

  const loadMember = async () => {

    try {

      const data = await getData("members");

      const found = data.find(
        (item) => item.memberId === memberId
      );

      setMember(found);

    }

    catch (error) {

      console.log(
        "Member Profile Error:",
        error
      );

    }

    finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadMember();

  }, [memberId]);


  // =====================================================
  // WHATSAPP NUMBER
  // =====================================================

  const whatsappNumber = member?.phone
    ? member.phone
        .replace(/\D/g, "")
        .replace(/^0/, "92")
    : "";


  // =====================================================
  // GOOGLE RATING
  // =====================================================

  const rating = Number(
    member?.googleRating || 0
  );


  const reviewCount = Number(
    member?.googleReviewCount || 0
  );


  // =====================================================
  // SHARE PROFILE
  // =====================================================

  const handleShare = async () => {

    const profileUrl =
      window.location.href;

    setShareMessage("");


    try {

      if (navigator.share) {

        await navigator.share({

          title:
            `OCMA Member - ${member.name}`,

          text:
            `OCMA Registered Member - ${member.name}`,

          url: profileUrl,

        });


        setShareMessage(
          "Profile successfully shared."
        );

        return;

      }


      if (navigator.clipboard) {

        await navigator.clipboard.writeText(
          profileUrl
        );


        setShareMessage(
          "Profile link copied successfully."
        );

        return;

      }


      const textArea =
        document.createElement(
          "textarea"
        );


      textArea.value =
        profileUrl;


      document.body.appendChild(
        textArea
      );


      textArea.select();


      document.execCommand(
        "copy"
      );


      document.body.removeChild(
        textArea
      );


      setShareMessage(
        "Profile link copied successfully."
      );

    }

    catch (error) {

      console.log(
        "Share Error:",
        error
      );


      if (
        error?.name ===
        "AbortError"
      ) {

        return;

      }


      setShareMessage(
        "Profile share نہیں ہو سکا۔ دوبارہ کوشش کریں۔"
      );

    }

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="profile-loading">

        Loading Member Profile...

      </div>

    );

  }


  // =====================================================
  // MEMBER NOT FOUND
  // =====================================================

  if (!member) {

    return (

      <div className="profile-loading">

        Member Not Found

      </div>

    );

  }


  // =====================================================
  // PORTFOLIO DATA
  // =====================================================

  const portfolioPhotos =
    member.portfolio?.photos || [];


  const videos =
    member.portfolio?.videos || [];


  // =====================================================
  // GOOGLE LOCATION
  // =====================================================

  const googleAddress =
    member.googleAddress || "";


  // =====================================================
  // JOINING DATE
  // =====================================================

  const joiningDate =
    member.joiningDate || "";


  // =====================================================
  // FORMAT JOINING DATE
  // =====================================================

  const formatJoiningDate = (date) => {

    if (!date) {
      return "Not Added";
    }

    try {

      const parsedDate =
        new Date(date);

      if (isNaN(parsedDate.getTime())) {
        return date;
      }

      return parsedDate.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }
      );

    }

    catch {

      return date;

    }

  };


  // =====================================================
  // OPEN PROFILE PHOTO
  // =====================================================

  const openProfileImage = () => {

    setSelectedImage(
      member.image ||
      "/assets/ocma-logo.png"
    );

  };


  // =====================================================
  // OPEN PORTFOLIO PHOTO
  // =====================================================

  const openPortfolioImage = (index) => {

    setSelectedPhotoIndex(index);

    setSelectedImage(
      portfolioPhotos[index]
    );

  };


  // =====================================================
  // NEXT PORTFOLIO PHOTO
  // =====================================================

  const nextPhoto = (e) => {

    e.stopPropagation();

    if (!portfolioPhotos.length) {
      return;
    }

    const nextIndex =
      (selectedPhotoIndex + 1)
      % portfolioPhotos.length;

    setSelectedPhotoIndex(
      nextIndex
    );

    setSelectedImage(
      portfolioPhotos[nextIndex]
    );

  };


  // =====================================================
  // PREVIOUS PORTFOLIO PHOTO
  // =====================================================

  const previousPhoto = (e) => {

    e.stopPropagation();

    if (!portfolioPhotos.length) {
      return;
    }

    const previousIndex =
      (selectedPhotoIndex - 1 +
        portfolioPhotos.length)
      %
      portfolioPhotos.length;

    setSelectedPhotoIndex(
      previousIndex
    );

    setSelectedImage(
      portfolioPhotos[previousIndex]
    );

  };


  // =====================================================
  // CLOSE IMAGE
  // =====================================================

  const closeImage = () => {

    setSelectedImage("");

  };


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <section className="member-profile">


      {/* =================================================
          PROFILE CARD
      ================================================= */}

      <div className="profile-card">


        {/* =================================================
            PROFILE TOP
        ================================================= */}

        <div className="profile-top">


          {/* CLICKABLE PROFILE PHOTO */}

          <div
            className="profile-image-wrapper"
            onClick={openProfileImage}
          >

            <img

              src={
                member.image
                  ? member.image
                  : "/assets/ocma-logo.png"
              }

              alt={member.name}

              className="profile-image"

            />


            <div className="photo-click-hint">

              🔍 Click to View

            </div>

          </div>


          {/* REGISTERED MEMBER BADGE */}

          <div className="registered-member-badge">

            ✓ Registered OCMA Member

          </div>


          <h1>

            {member.name}

          </h1>


          <h3 className="profile-id">

            {member.memberId}

          </h3>


          {/* =================================================
              JOINING DATE
          ================================================= */}

          <div className="member-joining-date">

            📅 <b>Joined OCMA:</b>{" "}

            {formatJoiningDate(
              joiningDate
            )}

          </div>


          {/* =================================================
              GOOGLE RATING
          ================================================= */}

          {rating > 0 && (

            <div className="profile-google-rating">


              <div className="profile-rating-stars">

                {"★".repeat(
                  Math.min(
                    5,
                    Math.round(rating)
                  )
                )}

                {"☆".repeat(
                  Math.max(
                    0,
                    5 -
                    Math.round(rating)
                  )
                )}

              </div>


              <span className="profile-rating-number">

                {rating.toFixed(1)}

              </span>


              {reviewCount > 0 && (

                <span className="profile-review-count">

                  ({reviewCount} reviews)

                </span>

              )}

            </div>

          )}


        </div>


        {/* =================================================
            MEMBER INFORMATION
        ================================================= */}

        <div className="profile-info">


          <p>

            📍 <b>City:</b>{" "}

            {member.city ||
              "Not Added"}

          </p>


          <p>

            🎥 <b>Profession:</b>{" "}

            {member.specialty ||
              "Not Added"}

          </p>


          <p>

            👨‍👦 <b>Father Name:</b>{" "}

            {member.fatherName ||
              "Not Added"}

          </p>


          <p>

            🏢 <b>Studio:</b>{" "}

            {member.studio ||
              "Not Added"}

          </p>


          <p>

            ⭐ <b>Experience:</b>{" "}

            {member.experience ||
              "Not Added"}

          </p>


          <p>

            📷 <b>Camera:</b>{" "}

            {member.cameraDetails ||
              "Not Added"}

          </p>


          <p>

            🩸 <b>Blood:</b>{" "}

            {member.bloodGroup ||
              "Not Added"}

          </p>


          <p>

            🏠 <b>Address:</b>{" "}

            {member.address ||
              "Not Added"}

          </p>


          <p>

            💬 <b>Message:</b>{" "}

            {member.message ||
              "Not Added"}

          </p>


        </div>


        {/* =================================================
            WHATSAPP
        ================================================= */}

        {whatsappNumber && (

          <a

            href={
              `https://wa.me/${whatsappNumber}`
            }

            target="_blank"

            rel="noopener noreferrer"

            className="profile-whatsapp"

          >

            💬 WhatsApp Contact

          </a>

        )}


      </div>


      {/* =================================================
          PROFESSIONAL PORTFOLIO
      ================================================= */}

      {portfolioPhotos.length > 0 && (

        <div className="member-portfolio">


          <h2>

            Professional Portfolio

          </h2>


          <div className="portfolio-gallery">


            {portfolioPhotos.map(

              (img, index) => (

                <div
                  className="portfolio-photo-item"
                  key={index}
                >

                  <img

                    src={img}

                    alt={
                      `Portfolio ${index + 1}`
                    }

                    onClick={() =>
                      openPortfolioImage(index)
                    }

                  />


                  <button

                    type="button"

                    className="portfolio-view-btn"

                    onClick={() =>
                      openPortfolioImage(index)
                    }

                  >

                    🔍 View Photo

                  </button>


                </div>

              )

            )}


          </div>


        </div>

      )}


      {/* =================================================
          VIDEO PORTFOLIO
      ================================================= */}

      {videos.length > 0 && (

        <div className="member-videos">


          <h2>

            Video Portfolio

          </h2>


          {videos.map(

            (video, index) => (

              <div

                className="video-item"

                key={index}

              >


                {video.embed ? (

                  <iframe

                    src={video.embed}

                    title={
                      `video-${index + 1}`
                    }

                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"

                    allowFullScreen

                  />

                ) : (

                  <p className="video-error">

                    Video Preview Available نہیں ہے

                  </p>

                )}


              </div>

            )

          )}


        </div>

      )}


      {/* =================================================
          IMAGE POPUP
      ================================================= */}

      {selectedImage && (

        <div

          className="image-popup"

          onClick={closeImage}

        >


          <button

            type="button"

            className="popup-close"

            onClick={(e) => {

              e.stopPropagation();

              closeImage();

            }}

          >

            ✕

          </button>


          {/* PREVIOUS */}

          {portfolioPhotos.length > 1 && (

            <button

              type="button"

              className="popup-prev"

              onClick={previousPhoto}

            >

              ❮

            </button>

          )}


          <img

            src={selectedImage}

            alt="Large Preview"

            onClick={(e) =>
              e.stopPropagation()
            }

          />


          {/* NEXT */}

          {portfolioPhotos.length > 1 && (

            <button

              type="button"

              className="popup-next"

              onClick={nextPhoto}

            >

              ❯

            </button>

          )}


          {/* PHOTO COUNTER */}

          {portfolioPhotos.length > 1 && (

            <div className="popup-counter">

              {selectedPhotoIndex + 1}

              {" / "}

              {portfolioPhotos.length}

            </div>

          )}


        </div>

      )}


      {/* =================================================
          CERTIFICATE
      ================================================= */}

      {member.certificate && (

        <div className="member-certificate">


          <h2>

            OCMA Certificate

          </h2>


          <a

            href={member.certificate}

            target="_blank"

            rel="noopener noreferrer"

            className="certificate-btn"

          >

            View Certificate

          </a>


        </div>

      )}


      {/* =================================================
          GOOGLE LOCATION
      ================================================= */}

      {googleAddress && (

        <div className="member-location">


          <h2>

            📍 Google Location

          </h2>


          <p>

            View this member's location,
            Google rating and latest reviews
            directly on Google Maps.

          </p>


          <a

            href={googleAddress}

            target="_blank"

            rel="noopener noreferrer"

            className="google-location-btn"

          >

            📍 View Google Location

          </a>


        </div>

      )}


      {/* =================================================
          SHARE PROFILE
      ================================================= */}

      <div className="share-profile">


        <h2>

          Share Member Profile

        </h2>


        <button

          type="button"

          className="share-btn"

          onClick={handleShare}

        >

          🔗 Share Profile

        </button>


        {shareMessage && (

          <p className="share-message">

            {shareMessage}

          </p>

        )}


      </div>


      {/* =================================================
          MEMBER QR CODE
      ================================================= */}

      <div className="member-qr">


        <h2>

          OCMA Profile QR

        </h2>


        <div className="qr-wrapper">


          <QRCodeCanvas

            value={
              window.location.href
            }

            size={220}

            bgColor="#ffffff"

            fgColor="#000000"

            level="H"

            includeMargin={true}

          />


        </div>


        <p>

          Scan کریں اور Member Profile کھولیں

        </p>


      </div>


    </section>

  );

}


export default MemberProfile;