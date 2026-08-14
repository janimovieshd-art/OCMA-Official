import { useEffect, useRef, useState } from "react";

import { getData } from "../services/firestoreService";

import "./MemberGallery.css";


function MemberGallery() {

  const [members, setMembers] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedVideo, setSelectedVideo] = useState(null);


  // =====================================================
  // IMAGE ZOOM
  // =====================================================

  const [imageZoom, setImageZoom] = useState(1);

  const [imagePosition, setImagePosition] = useState({
    x: 0,
    y: 0
  });

  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
    positionX: 0,
    positionY: 0
  });


  // =====================================================
  // LOAD MEMBERS
  // =====================================================

  const loadGallery = async () => {

    try {

      const data = await getData("members");

      const activeMembers =
        data.filter(
          (member) =>
            member.status === "ACTIVE" &&
            member.portfolio
        );

      setMembers(activeMembers);

    }

    catch (error) {

      console.log(
        "Gallery Error:",
        error
      );

    }

  };


  useEffect(() => {

    loadGallery();

  }, []);


  // =====================================================
  // GET MEMBER CODE
  // =====================================================

  const getMemberCode = (member) => {

    return (
      member.memberId
        ?.replace("OCMA-", "") ||
      member.memberId ||
      "N/A"
    );

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
      getVideoRawUrl(video)
        .toLowerCase();

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
      ) ||
      rawUrl.includes(
        "fb.watch"
      )
    ) {

      return "facebook";

    }

    if (
      rawUrl.includes(
        "vimeo.com"
      )
    ) {

      return "vimeo";

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


    // INSTAGRAM

    if (
      type === "instagram"
    ) {

      return getInstagramEmbedUrl(
        rawUrl
      );

    }


    // YOUTUBE

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


    // FACEBOOK

    if (
      type === "facebook"
    ) {

      return (
        `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
          rawUrl
        )}&show_text=false`
      );

    }


    // VIMEO

    if (
      type === "vimeo"
    ) {

      try {

        const parsedUrl =
          new URL(rawUrl);

        const pathParts =
          parsedUrl.pathname
            .split("/")
            .filter(Boolean);

        const videoId =
          pathParts.find(
            (part) =>
              /^\d+$/.test(part)
          );

        if (videoId) {

          return (
            `https://player.vimeo.com/video/${videoId}`
          );

        }

      }

      catch {

        return rawUrl;

      }

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


    // YOUTUBE THUMBNAIL

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


    // CUSTOM THUMBNAIL

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
  // CHECK IF VIDEO IS REEL / PORTRAIT
  // =====================================================

  const isReelVideo = (video) => {

    const rawUrl =
      getVideoRawUrl(video)
        .toLowerCase();


    if (
      rawUrl.includes(
        "instagram.com/reel"
      )
    ) {

      return true;

    }


    if (
      rawUrl.includes(
        "youtube.com/shorts"
      )
    ) {

      return true;

    }


    if (
      rawUrl.includes(
        "tiktok.com"
      )
    ) {

      return true;

    }


    if (
      typeof video === "object"
    ) {

      if (
        video.type === "reel" ||
        video.format === "portrait" ||
        video.orientation === "portrait" ||
        video.isReel === true
      ) {

        return true;

      }

    }

    return false;

  };


  // =====================================================
  // RESET IMAGE VIEW
  // =====================================================

  const resetImageView = () => {

    setImageZoom(1);

    setImagePosition({
      x: 0,
      y: 0
    });

    setIsDragging(false);

  };


  // =====================================================
  // OPEN PHOTO
  // =====================================================

  const openPhoto = (
    member,
    photoIndex
  ) => {

    const photos =
      member.portfolio?.photos || [];

    if (!photos.length) {
      return;
    }

    setSelectedImage({

      member,

      photos,

      index: photoIndex

    });

    resetImageView();

  };


  // =====================================================
  // NEXT PHOTO
  // =====================================================

  const nextPhoto = (e) => {

    if (e) {
      e.stopPropagation();
    }

    if (!selectedImage) {
      return;
    }

    const total =
      selectedImage.photos.length;

    setSelectedImage((current) => ({

      ...current,

      index:
        (
          current.index + 1
        ) %
        total

    }));

    resetImageView();

  };


  // =====================================================
  // PREVIOUS PHOTO
  // =====================================================

  const previousPhoto = (e) => {

    if (e) {
      e.stopPropagation();
    }

    if (!selectedImage) {
      return;
    }

    const total =
      selectedImage.photos.length;

    setSelectedImage((current) => ({

      ...current,

      index:
        (
          current.index -
          1 +
          total
        )
        %
        total

    }));

    resetImageView();

  };


  // =====================================================
  // PHOTO WHEEL ZOOM
  // =====================================================

  const handleImageWheel = (e) => {

    e.preventDefault();

    e.stopPropagation();

    setImageZoom((currentZoom) => {

      const zoomStep =
        0.15;

      let newZoom;


      if (
        e.deltaY < 0
      ) {

        newZoom =
          Math.min(
            currentZoom +
            zoomStep,
            4
          );

      }

      else {

        newZoom =
          Math.max(
            currentZoom -
            zoomStep,
            1
          );

      }


      if (
        newZoom === 1
      ) {

        setImagePosition({
          x: 0,
          y: 0
        });

      }


      return Number(
        newZoom.toFixed(2)
      );

    });

  };


  // =====================================================
  // DOUBLE CLICK ZOOM
  // =====================================================

  const handleImageDoubleClick = (e) => {

    e.preventDefault();

    e.stopPropagation();


    if (
      imageZoom === 1
    ) {

      setImageZoom(2);

    }

    else {

      resetImageView();

    }

  };


  // =====================================================
  // START DRAG
  // =====================================================

  const handleImageMouseDown = (e) => {

    if (
      imageZoom <= 1
    ) {
      return;
    }

    e.preventDefault();

    e.stopPropagation();

    setIsDragging(true);

    dragStartRef.current = {

      x:
        e.clientX,

      y:
        e.clientY,

      positionX:
        imagePosition.x,

      positionY:
        imagePosition.y

    };

  };


  // =====================================================
  // DRAG PHOTO
  // =====================================================

  const handleImageMouseMove = (e) => {

    if (
      !isDragging
    ) {
      return;
    }

    e.preventDefault();


    const deltaX =
      e.clientX -
      dragStartRef.current.x;

    const deltaY =
      e.clientY -
      dragStartRef.current.y;


    setImagePosition({

      x:
        dragStartRef.current.positionX +
        deltaX,

      y:
        dragStartRef.current.positionY +
        deltaY

    });

  };


  // =====================================================
  // STOP IMAGE DRAG
  // =====================================================

  const stopImageDrag = () => {

    setIsDragging(false);

  };


  // =====================================================
  // OPEN VIDEO
  // =====================================================

  const openVideo = (
    videoList,
    index
  ) => {

    const video =
      videoList[index];

    const embedUrl =
      getVideoEmbedUrl(video);

    if (!embedUrl) {
      return;
    }

    setSelectedVideo({

      videos:
        videoList,

      index,

      url:
        embedUrl,

      type:
        getVideoType(video)

    });

  };


  // =====================================================
  // CLOSE IMAGE
  // =====================================================

  const closeImage = () => {

    setSelectedImage(null);

    resetImageView();

  };


  // =====================================================
  // CLOSE VIDEO
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

    if (!selectedVideo) {
      return;
    }

    const total =
      selectedVideo.videos.length;

    const nextIndex =
      (
        selectedVideo.index +
        1
      )
      %
      total;

    const next =
      selectedVideo.videos[nextIndex];


    setSelectedVideo({

      videos:
        selectedVideo.videos,

      index:
        nextIndex,

      url:
        getVideoEmbedUrl(next),

      type:
        getVideoType(next)

    });

  };


  // =====================================================
  // PREVIOUS VIDEO
  // =====================================================

  const previousVideo = (e) => {

    if (e) {
      e.stopPropagation();
    }

    if (!selectedVideo) {
      return;
    }

    const total =
      selectedVideo.videos.length;

    const previousIndex =
      (
        selectedVideo.index -
        1 +
        total
      )
      %
      total;

    const previous =
      selectedVideo.videos[
        previousIndex
      ];


    setSelectedVideo({

      videos:
        selectedVideo.videos,

      index:
        previousIndex,

      url:
        getVideoEmbedUrl(previous),

      type:
        getVideoType(previous)

    });

  };


  // =====================================================
  // KEYBOARD CONTROLS
  // =====================================================

  useEffect(() => {

    if (
      !selectedImage &&
      !selectedVideo
    ) {
      return;
    }


    const handleKeyDown = (e) => {

      if (
        e.key === "Escape"
      ) {

        if (selectedImage) {
          closeImage();
        }

        if (selectedVideo) {
          closeVideo();
        }

      }


      if (
        selectedImage
      ) {

        if (
          e.key === "ArrowRight"
        ) {

          nextPhoto();

        }

        if (
          e.key === "ArrowLeft"
        ) {

          previousPhoto();

        }

      }


      if (
        selectedVideo
      ) {

        if (
          e.key === "ArrowRight"
        ) {

          nextVideo();

        }

        if (
          e.key === "ArrowLeft"
        ) {

          previousVideo();

        }

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

  }, [
    selectedImage,
    selectedVideo
  ]);


  // =====================================================
  // PHOTO ITEMS
  // ONLY FIRST TWO PHOTOS
  // =====================================================

  const photoItems = [];

  members.forEach((member) => {

    const photos =
      member.portfolio?.photos || [];


    photos
      .slice(0, 2)
      .forEach(
        (photo, index) => {

          photoItems.push({

            member,

            photo,

            index

          });

        }
      );

  });


  // =====================================================
  // VIDEO ITEMS
  // ONLY ONE VIDEO PER MEMBER
  // =====================================================

  const reelVideos = [];

  const wideVideos = [];


  members.forEach((member) => {

    const videos =
      member.portfolio?.videos || [];


    if (
      !videos.length
    ) {
      return;
    }


    const video =
      videos[0];


    const videoItem = {

      member,

      video

    };


    if (
      isReelVideo(video)
    ) {

      reelVideos.push(
        videoItem
      );

    }

    else {

      wideVideos.push(
        videoItem
      );

    }

  });


  // =====================================================
  // CREATE VIDEO LISTS FOR POPUP
  // =====================================================

  const reelVideoList =
    reelVideos.map(
      (item) => item.video
    );


  const wideVideoList =
    wideVideos.map(
      (item) => item.video
    );


  // =====================================================
  // VIDEO CARD
  // =====================================================

  const renderVideoCard = (
    item,
    index,
    videoList,
    isReel = false
  ) => {

    const video =
      item.video;

    const type =
      getVideoType(video);

    const embedUrl =
      getVideoEmbedUrl(video);

    const thumbnail =
      getVideoThumbnail(video);


    if (!embedUrl) {
      return null;
    }


    return (

      <div
        className={
          isReel
            ? `video-card reel-video-card video-card-${type}`
            : `video-card wide-video-card video-card-${type}`
        }
        key={
          `${item.member.memberId || item.member.id}-video-${index}`
        }
      >

        <div
          className="video-preview"
          onClick={() =>
            openVideo(
              videoList,
              index
            )
          }
        >


          {/* YOUTUBE THUMBNAIL */}

          {thumbnail ? (

            <>

              <img
                src={thumbnail}
                alt="Video Thumbnail"
              />


              <div className="video-preview-overlay">

                <div className="video-play-icon">

                  ▶

                </div>

              </div>

            </>

          ) : type === "instagram" ? (

            <div className="instagram-gallery-preview">

              <iframe
                src={embedUrl}
                title={
                  `Instagram Preview ${index + 1}`
                }
                scrolling="no"
                frameBorder="0"
              />


              <div className="video-preview-overlay">

                <div className="video-play-icon">

                  ▶

                </div>

              </div>

            </div>

          ) : (

            <div className="video-generic-preview">

              <div className="video-play-icon">

                ▶

              </div>

            </div>

          )}

        </div>


        <div className="video-card-info">

          <span>

            {type === "instagram"
              ? "Instagram Reel"
              : type === "youtube"
              ? isReel
                ? "YouTube Short"
                : "YouTube Video"
              : type === "facebook"
              ? "Facebook Video"
              : type === "vimeo"
              ? "Vimeo Video"
              : "Video Portfolio"}

          </span>


          <strong>

            #{getMemberCode(
              item.member
            )}

          </strong>

        </div>

      </div>

    );

  };


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <section className="member-gallery-section">


      {/* =================================================
          PHOTO SECTION
      ================================================= */}

      <div className="gallery-heading">

        <h2>

          Professional Portfolio Gallery

        </h2>


        <p>

          Photography • Videography • Drone • Cinematography

        </p>

      </div>


      <div className="gallery-grid">

        {photoItems.map(
          (item, index) => (

            <div
              className="gallery-card"
              key={
                `${item.member.memberId || item.member.id}-photo-${index}`
              }
            >

              <div
                className="gallery-photo"
                onClick={() =>
                  openPhoto(
                    item.member,
                    item.index
                  )
                }
              >

                <img
                  src={item.photo}
                  alt={
                    `${item.member.name} Portfolio`
                  }
                />


                <div className="photo-overlay">

                  🔍

                </div>

              </div>


              <div className="gallery-card-info">

                <span>

                  Work by

                </span>


                <strong>

                  #{getMemberCode(
                    item.member
                  )}

                </strong>

              </div>

            </div>

          )
        )}

      </div>


      {/* =================================================
          REELS SECTION
      ================================================= */}

      {reelVideos.length > 0 && (

        <div className="video-section reels-section">


          <div className="gallery-heading video-heading">

            <h2>

              Reels & Short Videos

            </h2>


            <p>

              Short Professional Videos by OCMA Members

            </p>

          </div>


          <div className="reels-grid">

            {reelVideos.map(
              (item, index) =>

                renderVideoCard(
                  item,
                  index,
                  reelVideoList,
                  true
                )
            )}

          </div>

        </div>

      )}


      {/* =================================================
          WIDE VIDEOS SECTION
      ================================================= */}

      {wideVideos.length > 0 && (

        <div className="video-section wide-videos-section">


          <div className="gallery-heading video-heading">

            <h2>

              Professional Videos

            </h2>


            <p>

              Professional Wide Screen Videos by OCMA Members

            </p>

          </div>


          <div className="video-grid">

            {wideVideos.map(
              (item, index) =>

                renderVideoCard(
                  item,
                  index,
                  wideVideoList,
                  false
                )
            )}

          </div>

        </div>

      )}


      {/* =================================================
          PHOTO POPUP
      ================================================= */}

      {selectedImage && (

        <div
          className="image-popup"
          onClick={closeImage}
        >

          <div
            className="photo-popup-stage"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="photo-view-row">


              {selectedImage.photos.length > 1 && (

                <button
                  type="button"
                  className="popup-prev"
                  onClick={previousPhoto}
                  aria-label="Previous Photo"
                >

                  ❮

                </button>

              )}


              <div
                className={
                  isDragging
                    ? "popup-image-container dragging"
                    : "popup-image-container"
                }
                onWheel={
                  handleImageWheel
                }
                onDoubleClick={
                  handleImageDoubleClick
                }
                onMouseDown={
                  handleImageMouseDown
                }
                onMouseMove={
                  handleImageMouseMove
                }
                onMouseUp={
                  stopImageDrag
                }
                onMouseLeave={
                  stopImageDrag
                }
              >

                <img
                  src={
                    selectedImage.photos[
                      selectedImage.index
                    ]
                  }
                  alt="Portfolio Preview"
                  className="popup-zoom-image"
                  draggable="false"
                  style={{
                    transform:
                      `translate3d(${imagePosition.x}px, ${imagePosition.y}px, 0) scale(${imageZoom})`
                  }}
                />

              </div>


              {selectedImage.photos.length > 1 && (

                <button
                  type="button"
                  className="popup-next"
                  onClick={nextPhoto}
                  aria-label="Next Photo"
                >

                  ❯

                </button>

              )}

            </div>


            <button
              type="button"
              className="popup-close"
              onClick={closeImage}
              aria-label="Close"
            >

              ✕

            </button>


            <div className="popup-code">

              Work by #

              {getMemberCode(
                selectedImage.member
              )}


              <span>

                Photo{" "}

                {selectedImage.index + 1}

                {" / "}

                {selectedImage.photos.length}

              </span>


              {imageZoom > 1 && (

                <span className="zoom-info">

                  Zoom{" "}

                  {Math.round(
                    imageZoom * 100
                  )}%

                </span>

              )}

            </div>

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


          {selectedVideo.videos.length > 1 && (

            <button
              type="button"
              className="video-popup-prev"
              onClick={previousVideo}
              aria-label="Previous Video"
            >

              ❮

            </button>

          )}


          <div
            className={
              selectedVideo.type ===
              "instagram"
                ? "video-popup-container video-popup-reel"
                : "video-popup-container"
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


          {selectedVideo.videos.length > 1 && (

            <button
              type="button"
              className="video-popup-next"
              onClick={nextVideo}
              aria-label="Next Video"
            >

              ❯

            </button>

          )}


          {selectedVideo.videos.length > 1 && (

            <div className="video-popup-counter">

              {selectedVideo.index + 1}

              {" / "}

              {selectedVideo.videos.length}

            </div>

          )}

        </div>

      )}

    </section>

  );

}


export default MemberGallery;