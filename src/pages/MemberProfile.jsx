import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { getData } from "../services/firestoreService";

import "./MemberProfile.css";


function MemberProfile() {

  const { memberId } = useParams();

  const [member, setMember] = useState(null);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // IMAGE POPUP
  // =====================================================

  const [selectedImage, setSelectedImage] = useState("");

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const [shareMessage, setShareMessage] = useState("");

  // =====================================================
  // IMAGE ZOOM
  // =====================================================

  const [imageZoom, setImageZoom] = useState(1);

  const [imagePan, setImagePan] = useState({
    x: 0,
    y: 0
  });

  const imagePopupRef = useRef(null);

  const imageRef = useRef(null);

  const imageDragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0
  });

  const imageTouchRef = useRef({
    mode: null,
    startDistance: 0,
    startZoom: 1,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0
  });


  // =====================================================
  // VIDEO POPUP
  // =====================================================

  const [selectedVideo, setSelectedVideo] = useState(null);

  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);


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
  // PORTFOLIO DATA
  // =====================================================

  const portfolioPhotos =
    member?.portfolio?.photos || [];

  const videos =
    member?.portfolio?.videos || [];


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
  // GOOGLE LOCATION
  // =====================================================

  const googleAddress =
    member?.googleAddress || "";


  // =====================================================
  // JOINING DATE
  // =====================================================

  const joiningDate =
    member?.joiningDate || "";


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
  // RESET IMAGE ZOOM
  // =====================================================

  const resetImageZoom = () => {

    setImageZoom(1);

    setImagePan({
      x: 0,
      y: 0
    });

  };


  // =====================================================
  // ZOOM IMAGE
  // =====================================================

  const zoomImage = (amount) => {

    setImageZoom((currentZoom) => {

      const newZoom =
        Math.min(
          5,
          Math.max(
            1,
            Number(
              (currentZoom + amount).toFixed(2)
            )
          )
        );

      if (newZoom === 1) {

        setImagePan({
          x: 0,
          y: 0
        });

      }

      return newZoom;

    });

  };


  // =====================================================
  // OPEN PROFILE PHOTO
  // =====================================================

  const openProfileImage = () => {

    setSelectedPhotoIndex(0);

    setSelectedImage(
      member.image ||
      "/assets/ocma-logo.png"
    );

    resetImageZoom();

  };


  // =====================================================
  // OPEN PORTFOLIO PHOTO
  // =====================================================

  const openPortfolioImage = (index) => {

    setSelectedPhotoIndex(index);

    setSelectedImage(
      portfolioPhotos[index]
    );

    resetImageZoom();

  };


  // =====================================================
  // NEXT PORTFOLIO PHOTO
  // =====================================================

  const nextPhoto = (e) => {

    if (e) {
      e.stopPropagation();
    }

    if (!portfolioPhotos.length) {
      return;
    }

    const nextIndex =
      (
        selectedPhotoIndex + 1
      ) %
      portfolioPhotos.length;

    setSelectedPhotoIndex(
      nextIndex
    );

    setSelectedImage(
      portfolioPhotos[nextIndex]
    );

    resetImageZoom();

  };


  // =====================================================
  // PREVIOUS PORTFOLIO PHOTO
  // =====================================================

  const previousPhoto = (e) => {

    if (e) {
      e.stopPropagation();
    }

    if (!portfolioPhotos.length) {
      return;
    }

    const previousIndex =
      (
        selectedPhotoIndex -
        1 +
        portfolioPhotos.length
      )
      %
      portfolioPhotos.length;

    setSelectedPhotoIndex(
      previousIndex
    );

    setSelectedImage(
      portfolioPhotos[previousIndex]
    );

    resetImageZoom();

  };


  // =====================================================
  // CLOSE IMAGE
  // =====================================================

  const closeImage = () => {

    setSelectedImage("");

    resetImageZoom();

  };


  // =====================================================
  // IMAGE MOUSE DOWN
  // =====================================================

  const handleImageMouseDown = (e) => {

    if (imageZoom <= 1) {
      return;
    }

    e.preventDefault();

    imageDragRef.current = {

      dragging: true,

      startX: e.clientX,

      startY: e.clientY,

      startPanX: imagePan.x,

      startPanY: imagePan.y

    };

  };


  // =====================================================
  // IMAGE MOUSE MOVE
  // =====================================================

  const handleImageMouseMove = (e) => {

    if (
      !imageDragRef.current.dragging ||
      imageZoom <= 1
    ) {
      return;
    }

    e.preventDefault();

    const deltaX =
      e.clientX -
      imageDragRef.current.startX;

    const deltaY =
      e.clientY -
      imageDragRef.current.startY;

    setImagePan({

      x:
        imageDragRef.current.startPanX +
        deltaX,

      y:
        imageDragRef.current.startPanY +
        deltaY

    });

  };


  // =====================================================
  // IMAGE MOUSE UP
  // =====================================================

  const handleImageMouseUp = () => {

    imageDragRef.current.dragging = false;

  };


  // =====================================================
  // DISTANCE BETWEEN TWO TOUCHES
  // =====================================================

  const getTouchDistance = (touch1, touch2) => {

    const dx =
      touch1.clientX -
      touch2.clientX;

    const dy =
      touch1.clientY -
      touch2.clientY;

    return Math.sqrt(
      dx * dx +
      dy * dy
    );

  };


  // =====================================================
  // IMAGE TOUCH START
  // =====================================================

  const handleImageTouchStart = (e) => {

    if (!e.touches.length) {
      return;
    }

    if (e.touches.length === 2) {

      const distance =
        getTouchDistance(
          e.touches[0],
          e.touches[1]
        );

      imageTouchRef.current = {

        mode: "pinch",

        startDistance: distance,

        startZoom: imageZoom,

        startX: 0,

        startY: 0,

        startPanX: imagePan.x,

        startPanY: imagePan.y

      };

      return;

    }

    if (
      e.touches.length === 1 &&
      imageZoom > 1
    ) {

      const touch =
        e.touches[0];

      imageTouchRef.current = {

        mode: "drag",

        startDistance: 0,

        startZoom: imageZoom,

        startX: touch.clientX,

        startY: touch.clientY,

        startPanX: imagePan.x,

        startPanY: imagePan.y

      };

    }

  };


  // =====================================================
  // IMAGE TOUCH MOVE
  // =====================================================

  const handleImageTouchMove = (e) => {

    if (!e.touches.length) {
      return;
    }

    e.preventDefault();

    // ---------------------------------------------------
    // PINCH ZOOM
    // ---------------------------------------------------

    if (
      e.touches.length === 2 &&
      imageTouchRef.current.mode === "pinch"
    ) {

      const distance =
        getTouchDistance(
          e.touches[0],
          e.touches[1]
        );

      if (
        !imageTouchRef.current.startDistance
      ) {
        return;
      }

      const ratio =
        distance /
        imageTouchRef.current.startDistance;

      const newZoom =
        Math.min(
          5,
          Math.max(
            1,
            Number(
              (
                imageTouchRef.current.startZoom *
                ratio
              ).toFixed(2)
            )
          )
        );

      setImageZoom(newZoom);

      if (newZoom <= 1) {

        setImagePan({
          x: 0,
          y: 0
        });

      }

      return;

    }


    // ---------------------------------------------------
    // DRAG
    // ---------------------------------------------------

    if (
      e.touches.length === 1 &&
      imageTouchRef.current.mode === "drag" &&
      imageZoom > 1
    ) {

      const touch =
        e.touches[0];

      const deltaX =
        touch.clientX -
        imageTouchRef.current.startX;

      const deltaY =
        touch.clientY -
        imageTouchRef.current.startY;

      setImagePan({

        x:
          imageTouchRef.current.startPanX +
          deltaX,

        y:
          imageTouchRef.current.startPanY +
          deltaY

      });

    }

  };


  // =====================================================
  // IMAGE TOUCH END
  // =====================================================

  const handleImageTouchEnd = () => {

    imageTouchRef.current.mode = null;

  };


  // =====================================================
  // MOUSE WHEEL ZOOM
  // =====================================================

  const handleImageWheel = (e) => {

    e.preventDefault();

    e.stopPropagation();

    if (e.deltaY < 0) {

      zoomImage(0.25);

    }
    else {

      zoomImage(-0.25);

    }

  };


  // =====================================================
  // GET RAW VIDEO URL
  // =====================================================

  const getVideoRawUrl = (video) => {

    if (!video) {
      return "";
    }

    if (typeof video === "string") {

      return video.trim();

    }

    return (
      video.embed ||
      video.url ||
      video.link ||
      video.videoUrl ||
      ""
    ).trim();

  };


  // =====================================================
  // GET VIDEO TYPE
  // =====================================================

  const getVideoType = (video) => {

    const rawUrl =
      getVideoRawUrl(video).toLowerCase();

    if (
      rawUrl.includes(
        "instagram.com"
      )
    ) {

      return "instagram";

    }

    if (
      rawUrl.includes(
        "youtube.com"
      ) ||
      rawUrl.includes(
        "youtu.be"
      )
    ) {

      return "youtube";

    }

    if (
      rawUrl.includes(
        "facebook.com"
      )
    ) {

      return "facebook";

    }

    return "other";

  };


  // =====================================================
  // GET YOUTUBE ID
  // =====================================================

  const getYouTubeId = (url) => {

    if (!url) {
      return "";
    }

    try {

      const parsedUrl =
        new URL(url);

      if (
        parsedUrl.hostname.includes(
          "youtube.com"
        )
      ) {

        const watchId =
          parsedUrl.searchParams.get("v");

        if (watchId) {
          return watchId;
        }

        const shortsMatch =
          parsedUrl.pathname.match(
            /\/shorts\/([^/?#]+)/
          );

        if (shortsMatch) {
          return shortsMatch[1];
        }

        const embedMatch =
          parsedUrl.pathname.match(
            /\/embed\/([^/?#]+)/
          );

        if (embedMatch) {
          return embedMatch[1];
        }

      }

      if (
        parsedUrl.hostname.includes(
          "youtu.be"
        )
      ) {

        return parsedUrl.pathname
          .replace("/", "")
          .trim();

      }

    }

    catch (error) {

      console.log(
        "YouTube ID Error:",
        error
      );

    }

    return "";

  };


  // =====================================================
  // GET INSTAGRAM EMBED URL
  // =====================================================

  const getInstagramEmbedUrl = (url) => {

    if (!url) {
      return "";
    }

    try {

      const parsedUrl =
        new URL(url);

      const pathname =
        parsedUrl.pathname;

      if (
        pathname.includes(
          "/embed"
        )
      ) {

        return url;

      }

      const reelMatch =
        pathname.match(
          /\/reel\/([^/?#]+)/
        );

      if (reelMatch) {

        return (
          `https://www.instagram.com/reel/${reelMatch[1]}/embed/`
        );

      }

      const postMatch =
        pathname.match(
          /\/p\/([^/?#]+)/
        );

      if (postMatch) {

        return (
          `https://www.instagram.com/p/${postMatch[1]}/embed/`
        );

      }

      const tvMatch =
        pathname.match(
          /\/tv\/([^/?#]+)/
        );

      if (tvMatch) {

        return (
          `https://www.instagram.com/tv/${tvMatch[1]}/embed/`
        );

      }

    }

    catch (error) {

      console.log(
        "Instagram URL Error:",
        error
      );

    }

    return "";

  };


  // =====================================================
  // GET VIDEO EMBED URL
  // =====================================================

  const getVideoEmbedUrl = (video) => {

    const rawUrl =
      getVideoRawUrl(video);

    if (!rawUrl) {
      return "";
    }

    const type =
      getVideoType(video);

    if (
      type === "instagram"
    ) {

      return getInstagramEmbedUrl(
        rawUrl
      );

    }

    if (
      type === "youtube"
    ) {

      const youtubeId =
        getYouTubeId(rawUrl);

      if (youtubeId) {

        return (
          `https://www.youtube.com/embed/${youtubeId}?rel=0`
        );

      }

    }

    if (
      type === "facebook"
    ) {

      return (
        `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
          rawUrl
        )}&show_text=false`
      );

    }

    return rawUrl;

  };


  // =====================================================
  // GET VIDEO THUMBNAIL
  // =====================================================

  const getVideoThumbnail = (video) => {

    const type =
      getVideoType(video);

    const rawUrl =
      getVideoRawUrl(video);

    if (
      type === "youtube"
    ) {

      const youtubeId =
        getYouTubeId(rawUrl);

      if (youtubeId) {

        return (
          `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        );

      }

    }

    if (
      typeof video === "object"
    ) {

      if (
        video.thumbnail
      ) {

        return video.thumbnail;

      }

      if (
        video.thumbnailUrl
      ) {

        return video.thumbnailUrl;

      }

    }

    return "";

  };


  // =====================================================
  // OPEN VIDEO POPUP
  // =====================================================

  const openVideo = (index) => {

    const video =
      videos[index];

    const embedUrl =
      getVideoEmbedUrl(video);

    const type =
      getVideoType(video);

    if (!embedUrl) {
      return;
    }

    setSelectedVideoIndex(
      index
    );

    setSelectedVideo({

      url: embedUrl,

      type: type

    });

  };


  // =====================================================
  // CLOSE VIDEO POPUP
  // =====================================================

  const closeVideo = () => {

    setSelectedVideo(null);

  };


  // =====================================================
  // NEXT VIDEO
  // =====================================================

  const nextVideo = (e) => {

    if (e) {
      e.stopPropagation();
    }

    if (!videos.length) {
      return;
    }

    const nextIndex =
      (
        selectedVideoIndex +
        1
      )
      %
      videos.length;

    openVideo(nextIndex);

  };


  // =====================================================
  // PREVIOUS VIDEO
  // =====================================================

  const previousVideo = (e) => {

    if (e) {
      e.stopPropagation();
    }

    if (!videos.length) {
      return;
    }

    const previousIndex =
      (
        selectedVideoIndex -
        1 +
        videos.length
      )
      %
      videos.length;

    openVideo(previousIndex);

  };


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
  // POPUP SCROLL LOCK + KEYBOARD CONTROLS
  // =====================================================

  useEffect(() => {

    const popupOpen =
      Boolean(
        selectedImage ||
        selectedVideo
      );

    if (!popupOpen) {
      return;
    }

    const body =
      document.body;

    const html =
      document.documentElement;

    const previousBodyOverflow =
      body.style.overflow;

    const previousHtmlOverflow =
      html.style.overflow;

    const previousBodyPaddingRight =
      body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    body.style.overflow =
      "hidden";

    html.style.overflow =
      "hidden";

    if (scrollbarWidth > 0) {

      body.style.paddingRight =
        `${scrollbarWidth}px`;

    }


    // ---------------------------------------------------
    // KEYBOARD
    // ---------------------------------------------------

    const handleKeyDown = (e) => {

      if (
        e.key ===
        "Escape"
      ) {

        if (selectedImage) {
          closeImage();
        }

        if (selectedVideo) {
          closeVideo();
        }

        return;

      }


      if (
        selectedImage
      ) {

        if (
          e.key ===
          "ArrowRight"
        ) {

          e.preventDefault();

          nextPhoto();

          return;

        }

        if (
          e.key ===
          "ArrowLeft"
        ) {

          e.preventDefault();

          previousPhoto();

          return;

        }

        if (
          e.key ===
          "+"
          ||
          e.key ===
          "="
        ) {

          e.preventDefault();

          zoomImage(0.25);

          return;

        }

        if (
          e.key ===
          "-"
        ) {

          e.preventDefault();

          zoomImage(-0.25);

          return;

        }

        if (
          e.key ===
          "0"
        ) {

          e.preventDefault();

          resetImageZoom();

          return;

        }

      }


      if (
        selectedVideo
      ) {

        if (
          e.key ===
          "ArrowRight"
        ) {

          e.preventDefault();

          nextVideo();

          return;

        }

        if (
          e.key ===
          "ArrowLeft"
        ) {

          e.preventDefault();

          previousVideo();

          return;

        }

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      body.style.overflow =
        previousBodyOverflow;

      html.style.overflow =
        previousHtmlOverflow;

      body.style.paddingRight =
        previousBodyPaddingRight;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    selectedImage,
    selectedVideo,
    selectedPhotoIndex,
    selectedVideoIndex,
    imageZoom,
    imagePan
  ]);


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
  // RETURN
  // =====================================================

  return (

    <section className="member-profile">


      {/* =================================================
          PROFILE CARD
      ================================================= */}

      <div className="profile-card">


        <div className="profile-top">


          {/* PROFILE PHOTO */}

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


          {/* REGISTERED BADGE */}

          <div className="registered-member-badge">

            ✓ Registered OCMA Member

          </div>


          <h1>

            {member.name}

          </h1>


          <h3 className="profile-id">

            {member.memberId}

          </h3>


          {/* JOINING DATE */}

          <div className="member-joining-date">

            📅 <b>Joined OCMA:</b>{" "}

            {formatJoiningDate(
              joiningDate
            )}

          </div>


          {/* GOOGLE RATING */}

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
            {member.city || "Not Added"}
          </p>


          <p>
            🎥 <b>Profession:</b>{" "}
            {member.specialty || "Not Added"}
          </p>


          <p>
            👨‍👦 <b>Father Name:</b>{" "}
            {member.fatherName || "Not Added"}
          </p>


          <p>
            🏢 <b>Studio:</b>{" "}
            {member.studio || "Not Added"}
          </p>


          <p>
            ⭐ <b>Experience:</b>{" "}
            {member.experience || "Not Added"}
          </p>


          <p>
            📷 <b>Camera:</b>{" "}
            {member.cameraDetails || "Not Added"}
          </p>


          <p>
            🩸 <b>Blood:</b>{" "}
            {member.bloodGroup || "Not Added"}
          </p>


          <p>
            🏠 <b>Address:</b>{" "}
            {member.address || "Not Added"}
          </p>


          <p>
            💬 <b>Message:</b>{" "}
            {member.message || "Not Added"}
          </p>

        </div>


        {/* WHATSAPP */}

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


          <div className="video-gallery">

            {videos.map(
              (video, index) => {

                const type =
                  getVideoType(video);

                const embedUrl =
                  getVideoEmbedUrl(video);

                const thumbnail =
                  getVideoThumbnail(video);


                return (

                  <div
                    className={
                      `video-item video-card-${type}`
                    }
                    key={index}
                  >

                    {embedUrl ? (

                      <button
                        type="button"
                        className={
                          `video-preview-button video-preview-${type}`
                        }
                        onClick={() =>
                          openVideo(index)
                        }
                      >

                        {thumbnail ? (

                          <div className="video-thumbnail">

                            <img
                              src={thumbnail}
                              alt="Video Thumbnail"
                            />


                            <div className="video-thumbnail-overlay">

                              <div className="video-play-icon">

                                ▶

                              </div>

                            </div>

                          </div>

                        ) : type === "instagram" ? (

                          <div className="instagram-preview-wrapper">

                            <iframe
                              src={embedUrl}
                              title={
                                `Instagram Preview ${index + 1}`
                              }
                              className="instagram-preview-iframe"
                              scrolling="no"
                              frameBorder="0"
                            />


                            <div className="instagram-preview-overlay">

                              <div className="video-play-icon">

                                ▶

                              </div>

                            </div>

                          </div>

                        ) : (

                          <div className="video-thumbnail video-generic-thumbnail">

                            <div className="video-play-icon">

                              ▶

                            </div>

                          </div>

                        )}


                        <div className="video-card-info">

                          <span>

                            {type === "instagram"
                              ? "Instagram Reel"
                              : type === "youtube"
                              ? "YouTube Video"
                              : type === "facebook"
                              ? "Facebook Video"
                              : "Video Portfolio"}

                          </span>


                          <strong>

                            ▶ Watch Video

                          </strong>

                        </div>


                      </button>

                    ) : (

                      <p className="video-error">

                        Video Preview Available نہیں ہے

                      </p>

                    )}

                  </div>

                );

              }
            )}

          </div>

        </div>

      )}


      {/* =================================================
          IMAGE POPUP
      ================================================= */}

      {selectedImage && (

        <div
          className="image-popup"
          ref={imagePopupRef}
          onClick={closeImage}
          onWheel={handleImageWheel}
        >


          {/* CLOSE */}

          <button
            type="button"
            className="popup-close"
            onClick={(e) => {

              e.stopPropagation();

              closeImage();

            }}
            aria-label="Close"
          >

            ✕

          </button>


          {/* ZOOM CONTROLS */}

          <div
            className="image-zoom-controls"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              onClick={() =>
                zoomImage(-0.25)
              }
              disabled={imageZoom <= 1}
              aria-label="Zoom Out"
            >

              −

            </button>


            <span>

              {Math.round(
                imageZoom * 100
              )}%

            </span>


            <button
              type="button"
              onClick={() =>
                zoomImage(0.25)
              }
              disabled={imageZoom >= 5}
              aria-label="Zoom In"
            >

              +

            </button>


            <button
              type="button"
              className="zoom-reset-btn"
              onClick={resetImageZoom}
              aria-label="Reset Zoom"
            >

              ↻

            </button>

          </div>


          {/* PREVIOUS */}

          {portfolioPhotos.length > 1 && (

            <button
              type="button"
              className="popup-prev"
              onClick={previousPhoto}
              aria-label="Previous Photo"
            >

              ❮

            </button>

          )}


          {/* IMAGE */}

          <div
            className="popup-image-stage"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <img
              ref={imageRef}
              src={selectedImage}
              alt="Large Preview"
              className={
                imageZoom > 1
                  ? "popup-image zoomed"
                  : "popup-image"
              }
              style={{
                transform:
                  `translate3d(${imagePan.x}px, ${imagePan.y}px, 0) scale(${imageZoom})`
              }}
              onMouseDown={
                handleImageMouseDown
              }
              onMouseMove={
                handleImageMouseMove
              }
              onMouseUp={
                handleImageMouseUp
              }
              onMouseLeave={
                handleImageMouseUp
              }
              onTouchStart={
                handleImageTouchStart
              }
              onTouchMove={
                handleImageTouchMove
              }
              onTouchEnd={
                handleImageTouchEnd
              }
              onDoubleClick={(e) => {

                e.stopPropagation();

                if (imageZoom > 1) {

                  resetImageZoom();

                }
                else {

                  setImageZoom(2);

                }

              }}
              draggable={false}
            />

          </div>


          {/* NEXT */}

          {portfolioPhotos.length > 1 && (

            <button
              type="button"
              className="popup-next"
              onClick={nextPhoto}
              aria-label="Next Photo"
            >

              ❯

            </button>

          )}


          {/* COUNTER */}

          {portfolioPhotos.length > 1 && (

            <div className="popup-counter">

              {selectedPhotoIndex + 1}
              {" / "}
              {portfolioPhotos.length}

            </div>

          )}


          {/* ZOOM HELP */}

          <div className="zoom-help">

            Scroll / Pinch to Zoom • Drag to Move • Double Click to Zoom

          </div>

        </div>

      )}


      {/* =================================================
          VIDEO POPUP
      ================================================= */}

      {selectedVideo && (

        <div
          className="video-popup"
          onClick={closeVideo}
        >


          {/* CLOSE */}

          <button
            type="button"
            className="video-popup-close"
            onClick={(e) => {

              e.stopPropagation();

              closeVideo();

            }}
            aria-label="Close Video"
          >

            ✕

          </button>


          {/* PREVIOUS */}

          {videos.length > 1 && (

            <button
              type="button"
              className="video-popup-prev"
              onClick={previousVideo}
              aria-label="Previous Video"
            >

              ❮

            </button>

          )}


          {/* VIDEO */}

          <div
            className={
              `video-popup-container video-popup-${selectedVideo.type}`
            }
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <iframe
              src={selectedVideo.url}
              title="OCMA Member Video"
              className="video-popup-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

          </div>


          {/* NEXT */}

          {videos.length > 1 && (

            <button
              type="button"
              className="video-popup-next"
              onClick={nextVideo}
              aria-label="Next Video"
            >

              ❯

            </button>

          )}


          {/* COUNTER */}

          {videos.length > 1 && (

            <div className="video-popup-counter">

              {selectedVideoIndex + 1}
              {" / "}
              {videos.length}

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
          QR CODE
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