import { useEffect, useState } from "react";

import { getData } from "../services/firestoreService";

import "./MemberGallery.css";


function MemberGallery() {

  const [members, setMembers] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedVideo, setSelectedVideo] = useState(null);


  // =====================================================
  // LOAD MEMBERS
  // =====================================================

  const loadGallery = async () => {

    try {

      const data = await getData("members");


      const activeMembers = data.filter(
        (member) =>
          member.status === "ACTIVE" &&
          member.portfolio
      );


      setMembers(activeMembers);

    }

    catch (error) {

      console.log("Gallery Error:", error);

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
      member.memberId?.replace("OCMA-", "") ||
      member.memberId ||
      "N/A"
    );

  };


  // =====================================================
  // GET VIDEO URL
  // =====================================================

  const getVideoUrl = (video) => {

    if (!video) return "";

    if (typeof video === "string") {
      return video;
    }

    return (
      video.url ||
      video.embed ||
      ""
    );

  };


  // =====================================================
  // YOUTUBE ID
  // =====================================================

  const getYouTubeId = (url) => {

    if (!url) return null;


    try {

      const parsed = new URL(url);


      if (
        parsed.hostname.includes("youtube.com")
      ) {

        const watchId =
          parsed.searchParams.get("v");

        if (watchId) {
          return watchId;
        }


        if (
          parsed.pathname.includes("/shorts/")
        ) {

          return parsed.pathname
            .split("/shorts/")[1]
            ?.split("/")[0];

        }


        if (
          parsed.pathname.includes("/embed/")
        ) {

          return parsed.pathname
            .split("/embed/")[1]
            ?.split("/")[0];

        }

      }


      if (
        parsed.hostname.includes("youtu.be")
      ) {

        return parsed.pathname
          .replace("/", "")
          .split("?")[0];

      }

    }

    catch (error) {

      console.log(
        "YouTube URL Error:",
        error
      );

    }


    return null;

  };


  // =====================================================
  // VIDEO DATA
  // =====================================================

  const getVideoData = (video) => {

    const url = getVideoUrl(video);

    if (!url) return null;


    // ==============================
    // YOUTUBE
    // ==============================

    const youtubeId =
      getYouTubeId(url);


    if (youtubeId) {

      return {

        type: "youtube",

        url,

        embed:
          `https://www.youtube.com/embed/${youtubeId}`,

        thumbnail:
          `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`

      };

    }


    // ==============================
    // FACEBOOK
    // ==============================

    if (
      url.includes("facebook.com") ||
      url.includes("fb.watch")
    ) {

      return {

        type: "external",

        platform: "Facebook",

        icon: "📘",

        url

      };

    }


    // ==============================
    // INSTAGRAM
    // ==============================

    if (
      url.includes("instagram.com")
    ) {

      return {

        type: "external",

        platform: "Instagram",

        icon: "📷",

        url

      };

    }


    // ==============================
    // TIKTOK
    // ==============================

    if (
      url.includes("tiktok.com")
    ) {

      return {

        type: "external",

        platform: "TikTok",

        icon: "🎵",

        url

      };

    }


    // ==============================
    // VIMEO
    // ==============================

    if (
      url.includes("vimeo.com")
    ) {

      const id =
        url
          .split("vimeo.com/")[1]
          ?.split("?")[0]
          ?.split("/")[0];


      if (id) {

        return {

          type: "vimeo",

          platform: "Vimeo",

          url,

          embed:
            `https://player.vimeo.com/video/${id}`

        };

      }

    }


    // ==============================
    // OTHER VIDEO
    // ==============================

    return {

      type: "external",

      platform: "Video",

      icon: "▶",

      url

    };

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


    if (!photos.length) return;


    setSelectedImage({

      member,

      photos,

      index: photoIndex

    });

  };


  // =====================================================
  // NEXT PHOTO
  // =====================================================

  const nextPhoto = (e) => {

    e.stopPropagation();


    if (!selectedImage) return;


    const total =
      selectedImage.photos.length;


    setSelectedImage({

      ...selectedImage,

      index:
        (
          selectedImage.index + 1
        ) % total

    });

  };


  // =====================================================
  // PREVIOUS PHOTO
  // =====================================================

  const previousPhoto = (e) => {

    e.stopPropagation();


    if (!selectedImage) return;


    const total =
      selectedImage.photos.length;


    setSelectedImage({

      ...selectedImage,

      index:
        (
          selectedImage.index -
          1 +
          total
        ) % total

    });

  };


  // =====================================================
  // OPEN VIDEO
  // =====================================================

  const openVideo = (video) => {

    const videoData =
      getVideoData(video);


    if (!videoData) return;


    setSelectedVideo(videoData);

  };


  // =====================================================
  // CLOSE POPUPS
  // =====================================================

  const closeImage = () => {

    setSelectedImage(null);

  };


  const closeVideo = () => {

    setSelectedVideo(null);

  };


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
      .forEach((photo, index) => {

        photoItems.push({

          member,

          photo,

          index

        });

      });

  });


  // =====================================================
  // VIDEO ITEMS
  // ONE VIDEO PER MEMBER
  // =====================================================

  const videoItems = [];


  members.forEach((member) => {

    const videos =
      member.portfolio?.videos || [];


    if (videos.length > 0) {

      videoItems.push({

        member,

        video: videos[0]

      });

    }

  });


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <section className="member-gallery-section">


      {/* =================================================
          PHOTOS
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
                `${item.member.id}-photo-${index}`
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
                  #{getMemberCode(item.member)}
                </strong>

              </div>


            </div>

          )
        )}


      </div>


      {/* =================================================
          VIDEOS
      ================================================= */}

      {videoItems.length > 0 && (

        <div className="video-section">


          <div className="gallery-heading video-heading">

            <h2>
              Video Portfolio
            </h2>

            <p>
              Professional Videos by OCMA Members
            </p>

          </div>


          <div className="video-grid">


            {videoItems.map(
              (item, index) => {

                const videoData =
                  getVideoData(
                    item.video
                  );


                if (!videoData) {
                  return null;
                }


                return (

                  <div
                    className="video-card"
                    key={
                      `${item.member.id}-video-${index}`
                    }
                  >


                    {/* =================================
                        YOUTUBE
                    ================================= */}

                    {videoData.type ===
                      "youtube" && (

                      <div
                        className="youtube-thumbnail"
                        onClick={() =>
                          openVideo(
                            item.video
                          )
                        }
                      >

                        <img
                          src={
                            videoData.thumbnail
                          }
                          alt="Video Thumbnail"
                        />


                        <div className="youtube-play">

                          ▶

                        </div>

                      </div>

                    )}


                    {/* =================================
                        VIMEO
                    ================================= */}

                    {videoData.type ===
                      "vimeo" && (

                      <button
                        type="button"
                        className="video-open-button"
                        onClick={() =>
                          openVideo(
                            item.video
                          )
                        }
                      >

                        ▶ Play Vimeo Video

                      </button>

                    )}


                    {/* =================================
                        FACEBOOK / INSTAGRAM / TIKTOK
                    ================================= */}

                    {videoData.type ===
                      "external" && (

                      <a
                        href={
                          videoData.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="video-external-button"
                      >

                        <span>
                          {videoData.icon}
                        </span>

                        Open {
                          videoData.platform
                        } Video

                      </a>

                    )}


                    {/* =================================
                        VIDEO CODE
                    ================================= */}

                    <div className="video-card-info">

                      <span>
                        Video by
                      </span>

                      <strong>
                        #{getMemberCode(
                          item.member
                        )}
                      </strong>

                    </div>


                  </div>

                );

              }
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


          {selectedImage.photos.length > 1 && (

            <button
              type="button"
              className="popup-prev"
              onClick={previousPhoto}
            >

              ❮

            </button>

          )}


          <div
            className="popup-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <img
              src={
                selectedImage.photos[
                  selectedImage.index
                ]
              }
              alt="Portfolio Preview"
            />


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

            </div>

          </div>


          {selectedImage.photos.length > 1 && (

            <button
              type="button"
              className="popup-next"
              onClick={nextPhoto}
            >

              ❯

            </button>

          )}


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


          <div
            className="video-popup-box"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <button
              type="button"
              className="close-video"
              onClick={closeVideo}
            >

              ✕

            </button>


            {selectedVideo.type ===
              "youtube" && (

              <iframe
                src={
                  selectedVideo.embed
                }
                title="OCMA Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

            )}


            {selectedVideo.type ===
              "vimeo" && (

              <iframe
                src={
                  selectedVideo.embed
                }
                title="OCMA Vimeo Video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />

            )}


          </div>

        </div>

      )}


    </section>

  );

}


export default MemberGallery;