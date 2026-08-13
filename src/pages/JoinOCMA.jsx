import { useState } from "react";

import { addData } from "../services/firestoreService";

import {
  uploadImage,
  uploadImages
} from "../services/cloudinary";

import "./JoinOCMA.css";

function JoinOCMA() {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    phone: "",
    city: "",
    studio: "",
    googleAddress: "",
    specialty: "",
    experience: "",
    bloodGroup: "",
    address: "",
    cameraDetails: "",
    message: ""
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [portfolioPreview, setPortfolioPreview] = useState([]);

  const [videos, setVideos] = useState([
    "",
    "",
    "",
    "",
    ""
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const checkSize = (file) => {
    return file.size <= 5 * 1024 * 1024;
  };

  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("صرف تصویر فائل اپلوڈ کریں۔");
      return;
    }

    if (!checkSize(file)) {
      setError(
        "پروفائل تصویر 5MB سے زیادہ نہیں ہونی چاہیے۔"
      );
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));

    setError("");
    setSuccess("");
  };

  const handlePortfolio = (e) => {
    const files = Array.from(e.target.files);

    let newFiles = [...portfolioPhotos];
    let newPreview = [...portfolioPreview];

    for (const file of files) {
      if (newFiles.length >= 10) {
        setError(
          "زیادہ سے زیادہ 10 Portfolio Photos شامل کی جا سکتی ہیں۔"
        );
        break;
      }

      if (!file.type.startsWith("image/")) {
        setError(
          `${file.name} تصویر فائل نہیں ہے۔`
        );
        continue;
      }

      if (!checkSize(file)) {
        setError(
          `${file.name} کا سائز 5MB سے زیادہ ہے۔`
        );
        continue;
      }

      newFiles.push(file);
      newPreview.push(URL.createObjectURL(file));
    }

    setPortfolioPhotos(newFiles);
    setPortfolioPreview(newPreview);

    setSuccess("");
  };

  const removePortfolioPhoto = (index) => {
    const files = [...portfolioPhotos];
    const previews = [...portfolioPreview];

    files.splice(index, 1);
    previews.splice(index, 1);

    setPortfolioPhotos(files);
    setPortfolioPreview(previews);
  };

  const handleVideoChange = (index, value) => {
    const updated = [...videos];

    updated[index] = value;

    setVideos(updated);
    setSuccess("");
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";

    try {
      if (url.includes("youtube.com/watch")) {
        const id = new URL(url).searchParams.get("v");

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }

      if (url.includes("youtu.be")) {
        const id = url
          .split("/")
          .pop()
          .split("?")[0];

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }

      if (url.includes("youtube.com/shorts/")) {
        const id = url
          .split("/shorts/")[1]
          .split("?")[0];

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }

      if (url.includes("vimeo.com")) {
        const id = url
          .split("/")
          .pop()
          .split("?")[0];

        if (id) {
          return `https://player.vimeo.com/video/${id}`;
        }
      }

      if (url.includes("facebook.com")) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
          url
        )}&show_text=false`;
      }
    } catch (error) {
      return "";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      let imageUrl = "";
      let workImages = [];

      if (photo) {
        imageUrl = await uploadImage(photo);
      }

      if (portfolioPhotos.length > 0) {
        workImages = await uploadImages(
          portfolioPhotos
        );
      }

      const videoData = videos
        .filter((video) => video.trim() !== "")
        .map((video) => ({
          url: video,
          embed: getEmbedUrl(video)
        }));

      await addData(
        "membership_requests",
        {
          ...formData,

          image: imageUrl,

          portfolio: {
            photos: workImages,
            videos: videoData
          },

          googleRating: 0,
          googleReviewCount: 0,

          status: "PENDING",

          createdAt: new Date().toISOString()
        }
      );

      setSuccess(
        "آپ کی ممبرشپ درخواست کامیابی سے جمع ہوگئی ہے۔"
      );

      setFormData({
        name: "",
        fatherName: "",
        phone: "",
        city: "",
        studio: "",
        googleAddress: "",
        specialty: "",
        experience: "",
        bloodGroup: "",
        address: "",
        cameraDetails: "",
        message: ""
      });

      setPhoto(null);
      setPhotoPreview("");

      setPortfolioPhotos([]);
      setPortfolioPreview([]);

      setVideos([
        "",
        "",
        "",
        "",
        ""
      ]);

      const fileInputs =
        document.querySelectorAll(
          '.join-box input[type="file"]'
        );

      fileInputs.forEach((input) => {
        input.value = "";
      });

    } catch (error) {
      console.log(
        "Join OCMA Error:",
        error
      );

      setError(
        "درخواست جمع نہیں ہو سکی، دوبارہ کوشش کریں۔"
      );

      setSuccess("");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-page">

      <div className="join-box">

        <h1>
          Join OCMA
        </h1>

        <p>
          Become an official registered member
          of Okara Cameramen Association.
          <br />
          اوکاڑہ کیمرہ مین ایسوسی ایشن کے
          آفیشل رجسٹرڈ ممبر بنیں۔
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <input
            name="name"
            placeholder="Full Name (پورا نام)"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            name="fatherName"
            placeholder="Father Name (والد کا نام)"
            value={formData.fatherName}
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="WhatsApp Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            name="city"
            placeholder="City (شہر)"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <input
            name="studio"
            placeholder="Studio Name (اسٹوڈیو نام)"
            value={formData.studio}
            onChange={handleChange}
          />

          <input
            name="googleAddress"
            placeholder="Google Business / Google Maps Address"
            value={formData.googleAddress}
            onChange={handleChange}
          />

          <select
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Profession
            </option>

            <option value="Photographer">
              Photographer
            </option>

            <option value="Videographer">
              Videographer
            </option>

            <option value="Cinematographer">
              Cinematographer
            </option>

            <option value="Editor">
              Editor
            </option>

            <option value="Drone Operator">
              Drone Operator
            </option>

            <option value="Graphic Designer">
              Graphic Designer
            </option>

            <option value="Social Media Manager">
              Social Media Manager
            </option>

            <option value="Other">
              Other
            </option>
          </select>

          <select
            name="experience"
            value={formData.experience}
            onChange={handleChange}
          >
            <option value="">
              Experience
            </option>

            {Array.from(
              { length: 50 },
              (_, i) => (
                <option
                  key={i}
                  value={`${i + 1} Years`}
                >
                  {i + 1} Years
                </option>
              )
            )}
          </select>

          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
          >
            <option value="">
              Blood Group
            </option>

            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>

          <h3>
            Profile Photo (1×1)
          </h3>

          <p>
            Recommended: 1000 × 1000 Pixels
            <br />
            Maximum Size: 5MB
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePhoto}
          />

          {photoPreview && (
            <img
              src={photoPreview}
              className="profile-preview"
              alt="profile"
            />
          )}

          <textarea
            name="address"
            placeholder="Complete Address"
            value={formData.address}
            onChange={handleChange}
          />

          <textarea
            name="cameraDetails"
            placeholder="Camera & Equipment Details"
            value={formData.cameraDetails}
            onChange={handleChange}
          />

          <textarea
            name="message"
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
          />

          <div className="portfolio-box">

            <h2>
              Professional Portfolio
            </h2>

            <p>
              Portrait Size: 5×7 inch
              <br />
              Landscape Size: 7×5 inch
              <br />
              Maximum 10 Photos
              <br />
              Maximum 5MB Each Photo
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePortfolio}
            />

            <div className="portfolio-preview">

              {portfolioPreview.map(
                (img, index) => (
                  <div
                    className="portfolio-item"
                    key={index}
                  >

                    <img
                      src={img}
                      alt="portfolio"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removePortfolioPhoto(index)
                      }
                    >
                      ×
                    </button>

                  </div>
                )
              )}

            </div>

            <h2>
              Video Portfolio
            </h2>

            <p>
              YouTube / Facebook / Vimeo Links
            </p>

            {videos.map(
              (video, index) => (
                <div
                  className="video-box"
                  key={index}
                >

                  <input
                    type="text"
                    placeholder={`Video Link ${index + 1}`}
                    value={video}
                    onChange={(e) =>
                      handleVideoChange(
                        index,
                        e.target.value
                      )
                    }
                  />

                  {video &&
                    getEmbedUrl(video) && (
                      <iframe
                        title={`video-${index}`}
                        src={getEmbedUrl(video)}
                        width="100%"
                        height="250"
                        frameBorder="0"
                        allowFullScreen
                      />
                    )}

                </div>
              )
            )}

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : "Submit Membership Request"}
          </button>

          {success && (
            <div className="success-message">
              ✓ {success}
            </div>
          )}

        </form>

      </div>

    </div>
  );
}

export default JoinOCMA;