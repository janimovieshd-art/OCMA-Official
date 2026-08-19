import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { getData, addData } from "../services/firestoreService";
import GoogleLogin from "../components/GoogleLogin";
import "./MemberProfile.css";

function MemberProfile() {
  const { memberId } = useParams();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [shareMessage, setShareMessage] = useState("");
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });

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

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const [ocmaRating, setOcmaRating] = useState(0);
  const [ocmaReviewCount, setOcmaReviewCount] = useState(0);
  const [ocmaReviews, setOcmaReviews] = useState([]);

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingUser, setRatingUser] = useState(null);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState("");
  const [editingReview, setEditingReview] = useState(false);
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);

  const loadMember = async () => {
    try {
      const data = await getData("members");
      setMember(data.find(item => item.memberId === memberId));
    } catch (error) {
      console.log("Member Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMember();
  }, [memberId]);

  const loadOCMARatings = async () => {
    try {
      const ref = collection(db, "member_ratings");
      const q = query(ref, where("memberId", "==", memberId));
      const snapshot = await getDocs(q);

      const ratings = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

      if (!ratings.length) {
        setOcmaRating(0);
        setOcmaReviewCount(0);
        setOcmaReviews([]);
        return;
      }

      const total = ratings.reduce(
        (sum, item) => sum + Number(item.rating || 0),
        0
      );

      setOcmaRating(Number((total / ratings.length).toFixed(1)));
      setOcmaReviewCount(ratings.length);

      setOcmaReviews(
        ratings.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0).getTime() -
            new Date(a.updatedAt || a.createdAt || 0).getTime()
        )
      );
    } catch (error) {
      console.log("OCMA Rating Load Error:", error);
    }
  };

  useEffect(() => {
    if (memberId) loadOCMARatings();
  }, [memberId]);

  const checkAlreadyRated = async user => {
    if (!user?.uid || !memberId) return false;

    try {
      const ref = collection(db, "member_ratings");
      const q = query(
        ref,
        where("memberId", "==", memberId),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setAlreadyRated(false);
        setExistingReviewId("");
        setEditingReview(false);
        return false;
      }

      const existing = snapshot.docs[0];

      setAlreadyRated(true);
      setExistingReviewId(existing.id);
      setSelectedRating(Number(existing.data().rating || 0));
      setReviewText(existing.data().review || "");

      return true;
    } catch (error) {
      console.log("Rating Check Error:", error);
      return false;
    }
  };

  const handleRatingGoogleLogin = async user => {
    setRatingMessage("");
    setRatingUser(user);
    setShowGoogleLogin(false);

    const hasRated = await checkAlreadyRated(user);

    if (hasRated) {
      setEditingReview(false);
      return;
    }

    setSelectedRating(0);
    setReviewText("");
    setExistingReviewId("");
    setAlreadyRated(false);
    setEditingReview(true);
  };

  const startEditingReview = () => {
    if (!existingReviewId) {
      setRatingMessage("Review not found.");
      return;
    }

    setEditingReview(true);
    setRatingMessage("");
  };

  const cancelEditingReview = async () => {
    setEditingReview(false);

    if (ratingUser && existingReviewId) {
      await checkAlreadyRated(ratingUser);
    }

    setRatingMessage("");
  };

  const submitOCMARating = async () => {
    if (!ratingUser) {
      setRatingMessage("Please sign in with Google first.");
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setRatingMessage("Please select a rating.");
      return;
    }

    const cleanReview = reviewText.trim();

    if (!cleanReview) {
      setRatingMessage("Please write your review.");
      return;
    }

    if (cleanReview.length > 500) {
      setRatingMessage("Review can contain maximum 500 characters.");
      return;
    }

    try {
      setRatingLoading(true);
      setRatingMessage("");

      if (editingReview && existingReviewId) {
        await updateDoc(doc(db, "member_ratings", existingReviewId), {
          rating: Number(selectedRating),
          review: cleanReview,
          updatedAt: new Date().toISOString()
        });

        setEditingReview(false);
        setAlreadyRated(true);
        setRatingMessage("Your review has been updated.");

        await loadOCMARatings();
        return;
      }

      const ref = collection(db, "member_ratings");
      const q = query(
        ref,
        where("memberId", "==", memberId),
        where("userId", "==", ratingUser.uid)
      );

      const duplicate = await getDocs(q);

      if (!duplicate.empty) {
        const existing = duplicate.docs[0];

        setAlreadyRated(true);
        setExistingReviewId(existing.id);
        setSelectedRating(Number(existing.data().rating || 0));
        setReviewText(existing.data().review || "");
        setEditingReview(false);
        setRatingMessage("You have already reviewed this member.");
        return;
      }

      await addData("member_ratings", {
        memberId,
        memberName: member?.name || "",
        userId: ratingUser.uid,
        userName: ratingUser.displayName || "",
        userEmail: ratingUser.email || "",
        userPhoto: ratingUser.photoURL || "",
        rating: Number(selectedRating),
        review: cleanReview,
        createdAt: new Date().toISOString()
      });

      setAlreadyRated(true);
      setEditingReview(false);
      setRatingMessage("Your review has been submitted.");

      await loadOCMARatings();
    } catch (error) {
      console.log("OCMA Rating Submit Error:", error);
      setRatingMessage("Review could not be saved. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  };

  const portfolioPhotos = member?.portfolio?.photos || [];
  const videos = member?.portfolio?.videos || [];

  const whatsappNumber = member?.phone
    ? member.phone.replace(/\D/g, "").replace(/^0/, "92")
    : "";

  const googleRating = Number(member?.googleRating || 0);
  const googleReviewCount = Number(member?.googleReviewCount || 0);
  const googleAddress = member?.googleAddress || "";
  const joiningDate = member?.joiningDate || "";

  const formatJoiningDate = date => {
    if (!date) return "Not Added";

    try {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return date;

      return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    } catch {
      return date;
    }
  };

  const resetImageZoom = () => {
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const zoomImage = amount => {
    setImageZoom(current => {
      const zoom = Math.min(
        5,
        Math.max(1, Number((current + amount).toFixed(2)))
      );

      if (zoom === 1) setImagePan({ x: 0, y: 0 });
      return zoom;
    });
  };

  const openProfileImage = () => {
    setSelectedPhotoIndex(0);
    setSelectedImage(member.image || "/assets/ocma-logo.png");
    resetImageZoom();
  };

  const openPortfolioImage = index => {
    setSelectedPhotoIndex(index);
    setSelectedImage(portfolioPhotos[index]);
    resetImageZoom();
  };

  const nextPhoto = e => {
    e?.stopPropagation();
    if (!portfolioPhotos.length) return;

    const index = (selectedPhotoIndex + 1) % portfolioPhotos.length;
    setSelectedPhotoIndex(index);
    setSelectedImage(portfolioPhotos[index]);
    resetImageZoom();
  };

  const previousPhoto = e => {
    e?.stopPropagation();
    if (!portfolioPhotos.length) return;

    const index =
      (selectedPhotoIndex - 1 + portfolioPhotos.length) %
      portfolioPhotos.length;

    setSelectedPhotoIndex(index);
    setSelectedImage(portfolioPhotos[index]);
    resetImageZoom();
  };

  const closeImage = () => {
    setSelectedImage("");
    resetImageZoom();
  };

  const handleImageMouseDown = e => {
    if (imageZoom <= 1) return;

    e.preventDefault();

    imageDragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: imagePan.x,
      startPanY: imagePan.y
    };
  };

  const handleImageMouseMove = e => {
    if (!imageDragRef.current.dragging || imageZoom <= 1) return;

    e.preventDefault();

    setImagePan({
      x:
        imageDragRef.current.startPanX +
        e.clientX -
        imageDragRef.current.startX,
      y:
        imageDragRef.current.startPanY +
        e.clientY -
        imageDragRef.current.startY
    });
  };

  const handleImageMouseUp = () => {
    imageDragRef.current.dragging = false;
  };

  const getTouchDistance = (a, b) => {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleImageTouchStart = e => {
    if (!e.touches.length) return;

    if (e.touches.length === 2) {
      imageTouchRef.current = {
        mode: "pinch",
        startDistance: getTouchDistance(e.touches[0], e.touches[1]),
        startZoom: imageZoom,
        startX: 0,
        startY: 0,
        startPanX: imagePan.x,
        startPanY: imagePan.y
      };
      return;
    }

    if (e.touches.length === 1 && imageZoom > 1) {
      const touch = e.touches[0];

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

  const handleImageTouchMove = e => {
    if (!e.touches.length) return;

    e.preventDefault();

    if (
      e.touches.length === 2 &&
      imageTouchRef.current.mode === "pinch"
    ) {
      const distance = getTouchDistance(
        e.touches[0],
        e.touches[1]
      );

      if (!imageTouchRef.current.startDistance) return;

      const zoom = Math.min(
        5,
        Math.max(
          1,
          Number(
            (
              imageTouchRef.current.startZoom *
              (distance / imageTouchRef.current.startDistance)
            ).toFixed(2)
          )
        )
      );

      setImageZoom(zoom);

      if (zoom <= 1) setImagePan({ x: 0, y: 0 });
      return;
    }

    if (
      e.touches.length === 1 &&
      imageTouchRef.current.mode === "drag" &&
      imageZoom > 1
    ) {
      const touch = e.touches[0];

      setImagePan({
        x:
          imageTouchRef.current.startPanX +
          touch.clientX -
          imageTouchRef.current.startX,
        y:
          imageTouchRef.current.startPanY +
          touch.clientY -
          imageTouchRef.current.startY
      });
    }
  };

  const handleImageTouchEnd = () => {
    imageTouchRef.current.mode = null;
  };

  const handleImageWheel = e => {
    e.preventDefault();
    e.stopPropagation();
    zoomImage(e.deltaY < 0 ? 0.25 : -0.25);
  };

  const getVideoRawUrl = video => {
    if (!video) return "";
    if (typeof video === "string") return video.trim();

    return (
      video.embed ||
      video.url ||
      video.link ||
      video.videoUrl ||
      ""
    ).trim();
  };

  const getVideoType = video => {
    const url = getVideoRawUrl(video).toLowerCase();

    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube";
    }
    if (url.includes("facebook.com")) return "facebook";

    return "other";
  };

  const getYouTubeId = url => {
    if (!url) return "";

    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes("youtube.com")) {
        const id = parsed.searchParams.get("v");
        if (id) return id;

        const shorts = parsed.pathname.match(/\/shorts\/([^/?#]+)/);
        if (shorts) return shorts[1];

        const embed = parsed.pathname.match(/\/embed\/([^/?#]+)/);
        if (embed) return embed[1];
      }

      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.replace("/", "").trim();
      }
    } catch (error) {
      console.log("YouTube ID Error:", error);
    }

    return "";
  };

  const getInstagramEmbedUrl = url => {
    if (!url) return "";

    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname;

      if (pathname.includes("/embed")) return url;

      const reel = pathname.match(/\/reel\/([^/?#]+)/);
      if (reel) {
        return `https://www.instagram.com/reel/${reel[1]}/embed/`;
      }

      const post = pathname.match(/\/p\/([^/?#]+)/);
      if (post) {
        return `https://www.instagram.com/p/${post[1]}/embed/`;
      }

      const tv = pathname.match(/\/tv\/([^/?#]+)/);
      if (tv) {
        return `https://www.instagram.com/tv/${tv[1]}/embed/`;
      }
    } catch (error) {
      console.log("Instagram URL Error:", error);
    }

    return "";
  };

  const getVideoEmbedUrl = video => {
    const rawUrl = getVideoRawUrl(video);
    if (!rawUrl) return "";

    const type = getVideoType(video);

    if (type === "instagram") {
      return getInstagramEmbedUrl(rawUrl);
    }

    if (type === "youtube") {
      const id = getYouTubeId(rawUrl);

      if (id) {
        return `https://www.youtube.com/embed/${id}?rel=0&autoplay=1`;
      }
    }

    if (type === "facebook") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        rawUrl
      )}&show_text=false&autoplay=true`;
    }

    return rawUrl;
  };

  const getVideoThumbnail = video => {
    const type = getVideoType(video);
    const rawUrl = getVideoRawUrl(video);

    if (type === "youtube") {
      const id = getYouTubeId(rawUrl);

      if (id) {
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }
    }

    if (typeof video === "object" && video) {
      return video.thumbnail || video.thumbnailUrl || "";
    }

    return "";
  };

  const openVideo = index => {
    const video = videos[index];
    if (!video) return;

    const embedUrl = getVideoEmbedUrl(video);
    if (!embedUrl) return;

    setSelectedVideoIndex(index);
    setSelectedVideo({
      url: embedUrl,
      type: getVideoType(video)
    });
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const nextVideo = e => {
    e?.stopPropagation();
    if (!videos.length) return;

    openVideo((selectedVideoIndex + 1) % videos.length);
  };

  const previousVideo = e => {
    e?.stopPropagation();
    if (!videos.length) return;

    openVideo(
      (selectedVideoIndex - 1 + videos.length) %
        videos.length
    );
  };

  const handleShare = async () => {
    const profileUrl = window.location.href;
    setShareMessage("");

    try {
      if (navigator.share) {
        await navigator.share({
          title: `OCMA Member - ${member.name}`,
          text: `OCMA Registered Member - ${member.name}`,
          url: profileUrl
        });

        setShareMessage("Profile successfully shared.");
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(profileUrl);
        setShareMessage("Profile link copied successfully.");
        return;
      }

      const textArea = document.createElement("textarea");
      textArea.value = profileUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setShareMessage("Profile link copied successfully.");
    } catch (error) {
      console.log("Share Error:", error);

      if (error?.name === "AbortError") return;

      setShareMessage("Profile share failed. Please try again.");
    }
  };

  useEffect(() => {
    const popupOpen = Boolean(selectedImage || selectedVideo);
    if (!popupOpen) return;

    const body = document.body;
    const html = document.documentElement;

    const oldBodyOverflow = body.style.overflow;
    const oldHtmlOverflow = html.style.overflow;
    const oldPaddingRight = body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = e => {
      if (e.key === "Escape") {
        if (selectedImage) closeImage();
        if (selectedVideo) closeVideo();
        return;
      }

      if (selectedImage) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          nextPhoto();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          previousPhoto();
        } else if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          zoomImage(0.25);
        } else if (e.key === "-") {
          e.preventDefault();
          zoomImage(-0.25);
        } else if (e.key === "0") {
          e.preventDefault();
          resetImageZoom();
        }
      }

      if (selectedVideo) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          nextVideo();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          previousVideo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = oldBodyOverflow;
      html.style.overflow = oldHtmlOverflow;
      body.style.paddingRight = oldPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedImage,
    selectedVideo,
    selectedPhotoIndex,
    selectedVideoIndex,
    imageZoom,
    imagePan
  ]);

  if (loading) {
    return (
      <div className="profile-loading">
        Loading Member Profile...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="profile-loading">
        Member Not Found
      </div>
    );
  }

  return (
    <section className="member-profile">

      <div className="profile-card">

        <div className="profile-top">

          <div
            className="profile-image-wrapper"
            onClick={openProfileImage}
          >
            <img
              src={member.image || "/assets/ocma-logo.png"}
              alt={member.name}
              className="profile-image"
            />

            <div className="photo-click-hint">
              🔍 Click to View
            </div>
          </div>

          <div className="registered-member-badge">
            ✓ Registered OCMA Member
          </div>

          <h1>{member.name}</h1>

          <h3 className="profile-id">
            {member.memberId}
          </h3>

          <div className="member-joining-date">
            📅 <b>Joined OCMA:</b>{" "}
            {formatJoiningDate(joiningDate)}
          </div>

          {googleRating > 0 && (
            <div className="profile-google-rating">

              <div className="profile-rating-stars">
                {"★".repeat(Math.round(googleRating))}
                {"☆".repeat(5 - Math.round(googleRating))}
              </div>

              <span className="profile-rating-number">
                {googleRating.toFixed(1)}
              </span>

              {googleReviewCount > 0 && (
                <span className="profile-review-count">
                  ({googleReviewCount} reviews)
                </span>
              )}

            </div>
          )}

        </div>

        <div className="profile-info">

          <p>
            📍 <b>City:</b> {member.city || "Not Added"}
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

        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-whatsapp"
          >
            💬 WhatsApp Contact
          </a>
        )}

      </div>

      {videos.length > 0 && (
        <div className="member-videos">

          <h2>Video Portfolio</h2>

          <div className="video-gallery">

            {videos.map((video, index) => {
              const type = getVideoType(video);
              const embedUrl = getVideoEmbedUrl(video);
              const thumbnail = getVideoThumbnail(video);

              return (
                <div
                  className={`video-item video-card-${type}`}
                  key={index}
                >

                  {embedUrl ? (

                    <button
                      type="button"
                      className={`video-preview-button video-preview-${type}`}
                      onClick={() => openVideo(index)}
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
                            title={`Instagram Preview ${index + 1}`}
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
                      Video Preview Not Available
                    </p>

                  )}

                </div>
              );
            })}

          </div>

        </div>
      )}

      {member.certificate && (
        <div className="member-certificate">

          <h2>OCMA Certificate</h2>

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

      {googleAddress && (
        <div className="member-location">

          <h2>📍 Google Location</h2>

          <p>
            View this member's location, Google rating
            and latest reviews directly on Google Maps.
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

      <div className="share-profile">

        <h2>Share Member Profile</h2>

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

      {/* =====================================================
          OCMA RATING & REVIEWS
          LAST SECTION BEFORE QR
      ===================================================== */}

      <div className="profile-rating-section">

        <h2 className="profile-rating-title">
  {member.name} — Rating & Reviews
</h2>

        <div className="profile-rating-summary">

          <div className="profile-rating-main">

            <div className="profile-rating-stars-live">

              {[1, 2, 3, 4, 5].map(star => {
                const fill = Math.max(
                  0,
                  Math.min(1, ocmaRating - star + 1)
                );

                return (
                  <span
                    key={star}
                    className={
                      fill >= 1
                        ? "rating-display-star filled"
                        : fill > 0
                        ? "rating-display-star half"
                        : "rating-display-star empty"
                    }
                  >
                    ★
                  </span>
                );
              })}

            </div>

            <div className="profile-rating-score-row">

              <strong className="profile-rating-score-number">
                {ocmaRating > 0
                  ? ocmaRating.toFixed(1)
                  : "0.0"}
              </strong>

              <span className="profile-rating-reviews-count">
                {ocmaReviewCount}{" "}
                {ocmaReviewCount === 1
                  ? "review"
                  : "reviews"}
              </span>

            </div>

          </div>

        </div>

        {ocmaReviews.length > 0 ? (

          <div className="profile-reviews-list">

            {ocmaReviews.map(review => (

              <div
                className="profile-review-card"
                key={review.id}
              >

                <div className="profile-review-user">

                  <img
                    src={
                      review.userPhoto ||
                      "/assets/ocma-logo.png"
                    }
                    alt={
                      review.userName ||
                      "Google Account"
                    }
                    className="profile-review-user-image"
                  />

                  <div className="profile-review-user-details">

                    <h4 className="profile-review-user-name">
                      {review.userName || "Google Account"}
                    </h4>

                    <span className="profile-review-verified">
                      Google Account
                    </span>

                  </div>

                </div>

                <div className="profile-review-stars">
                  {"★".repeat(
                    Math.min(
                      5,
                      Number(review.rating || 0)
                    )
                  )}
                  {"☆".repeat(
                    Math.max(
                      0,
                      5 - Number(review.rating || 0)
                    )
                  )}
                </div>

                <p className="profile-review-text">
                  {review.review}
                </p>

                <div className="profile-review-date">
                  {new Date(
                    review.updatedAt ||
                    review.createdAt
                  ).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    }
                  )}
                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="profile-no-reviews">
            No reviews yet.
          </div>

        )}

        {!ratingUser ? (

          <div className="profile-review-action">

            {!showGoogleLogin ? (

              <button
                type="button"
                className="profile-write-review-btn"
                onClick={() => {
                  setRatingMessage("");
                  setShowGoogleLogin(true);
                }}
              >
                Write a Review
              </button>

            ) : (

              <div className="profile-google-login-box">

                <GoogleLogin
                  onLogin={handleRatingGoogleLogin}
                />

              </div>

            )}

          </div>

        ) : alreadyRated && !editingReview ? (

          <div className="profile-review-action">

            <button
              type="button"
              className="profile-write-review-btn"
              onClick={startEditingReview}
            >
              Edit Your Review
            </button>

          </div>

        ) : (

          <div className="profile-rating-form">

            <div className="rating-user-info">

              <img
                src={
                  ratingUser.photoURL ||
                  "/assets/ocma-logo.png"
                }
                alt={
                  ratingUser.displayName ||
                  "Google Account"
                }
              />

              <div>

                <strong>
                  {ratingUser.displayName ||
                    "Google Account"}
                </strong>

                <span>
                  Google Account
                </span>

              </div>

            </div>

            <div className="rating-stars-selector">

              {[1, 2, 3, 4, 5].map(star => (

                <button
                  type="button"
                  key={star}
                  className={
                    star <= selectedRating
                      ? "rating-star active"
                      : "rating-star"
                  }
                  onClick={() =>
                    setSelectedRating(star)
                  }
                  disabled={ratingLoading}
                  aria-label={`${star} Star`}
                >
                  ★
                </button>

              ))}

            </div>

            <div className="review-input-wrapper">

              <label htmlFor="member-review">
                {editingReview
                  ? "Edit Your Review"
                  : "Write Your Review"}
              </label>

              <textarea
                id="member-review"
                value={reviewText}
                onChange={e =>
                  setReviewText(e.target.value)
                }
                placeholder="Write your review..."
                maxLength={500}
                disabled={ratingLoading}
              />

              <div className="review-character-count">
                {reviewText.length} / 500
              </div>

            </div>

            <button
              type="button"
              className="submit-rating-button"
              onClick={submitOCMARating}
              disabled={
                ratingLoading ||
                selectedRating === 0 ||
                !reviewText.trim()
              }
            >
              {ratingLoading
                ? "Saving..."
                : editingReview
                ? "Save Changes"
                : "Submit Review"}
            </button>

            {editingReview && (

              <button
                type="button"
                className="cancel-edit-review-button"
                onClick={cancelEditingReview}
                disabled={ratingLoading}
              >
                Cancel
              </button>

            )}

          </div>

        )}

        {ratingMessage && (
          <p className="rating-message">
            {ratingMessage}
          </p>
        )}

      </div>

      {/* QR - REVIEWS KE BILKUL BAAD */}

      <div className="member-qr">

        <h2>OCMA Profile QR</h2>

        <div className="qr-wrapper">

          <QRCodeCanvas
            value={window.location.href}
            size={220}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={true}
          />

        </div>

        <p>
          Scan to open Member Profile
        </p>

      </div>

      {/* IMAGE POPUP */}

      {selectedImage && (
        <div
          className="image-popup"
          ref={imagePopupRef}
          onClick={closeImage}
          onWheel={handleImageWheel}
        >

          <button
            type="button"
            className="popup-close"
            onClick={e => {
              e.stopPropagation();
              closeImage();
            }}
            aria-label="Close"
          >
            ✕
          </button>

          <div
            className="image-zoom-controls"
            onClick={e => e.stopPropagation()}
          >

            <button
              type="button"
              onClick={() => zoomImage(-0.25)}
              disabled={imageZoom <= 1}
            >
              −
            </button>

            <span>
              {Math.round(imageZoom * 100)}%
            </span>

            <button
              type="button"
              onClick={() => zoomImage(0.25)}
              disabled={imageZoom >= 5}
            >
              +
            </button>

            <button
              type="button"
              className="zoom-reset-btn"
              onClick={resetImageZoom}
            >
              ↻
            </button>

          </div>

          {portfolioPhotos.length > 1 && (
            <button
              type="button"
              className="popup-prev"
              onClick={previousPhoto}
            >
              ❮
            </button>
          )}

          <div
            className="popup-image-stage"
            onClick={e => e.stopPropagation()}
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
                transform: `translate3d(${imagePan.x}px, ${imagePan.y}px, 0) scale(${imageZoom})`
              }}
              onMouseDown={handleImageMouseDown}
              onMouseMove={handleImageMouseMove}
              onMouseUp={handleImageMouseUp}
              onMouseLeave={handleImageMouseUp}
              onTouchStart={handleImageTouchStart}
              onTouchMove={handleImageTouchMove}
              onTouchEnd={handleImageTouchEnd}
              onDoubleClick={e => {
                e.stopPropagation();
                imageZoom > 1
                  ? resetImageZoom()
                  : setImageZoom(2);
              }}
              draggable={false}
            />

          </div>

          {portfolioPhotos.length > 1 && (
            <button
              type="button"
              className="popup-next"
              onClick={nextPhoto}
            >
              ❯
            </button>
          )}

          {portfolioPhotos.length > 1 && (
            <div className="popup-counter">
              {selectedPhotoIndex + 1} /{" "}
              {portfolioPhotos.length}
            </div>
          )}

          <div className="zoom-help">
            Scroll / Pinch to Zoom • Drag to Move • Double Click to Zoom
          </div>

        </div>
      )}

      {/* VIDEO POPUP */}

      {selectedVideo && (
        <div
          className="video-popup"
          onClick={closeVideo}
        >

          <button
            type="button"
            className="video-popup-close"
            onClick={e => {
              e.stopPropagation();
              closeVideo();
            }}
          >
            ✕
          </button>

          {videos.length > 1 && (
            <button
              type="button"
              className="video-popup-prev"
              onClick={previousVideo}
            >
              ❮
            </button>
          )}

          <div
            className={`video-popup-container video-popup-${selectedVideo.type}`}
            onClick={e => e.stopPropagation()}
          >

            <iframe
              src={selectedVideo.url}
              title="OCMA Member Video"
              className="video-popup-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

          </div>

          {videos.length > 1 && (
            <button
              type="button"
              className="video-popup-next"
              onClick={nextVideo}
            >
              ❯
            </button>
          )}

          {videos.length > 1 && (
            <div className="video-popup-counter">
              {selectedVideoIndex + 1} / {videos.length}
            </div>
          )}

        </div>
      )}

    </section>
  );
}

export default MemberProfile;