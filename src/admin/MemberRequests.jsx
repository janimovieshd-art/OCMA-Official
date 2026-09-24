import { useEffect, useState } from "react";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  getData,
  addData,
  deleteData,
  updateData
} from "../services/firestoreService";

import {
  uploadImage,
  uploadImages
} from "../services/cloudinary";

import { db } from "../firebase/firebase";

import "./MemberRequests.css";


function MemberRequests() {

  const requestCollection = "membership_requests";
  const memberCollection = "members";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [largePhoto, setLargePhoto] = useState(null);


  /* LOAD REQUESTS */

  const loadRequests = async () => {

    try {

      setLoading(true);

      const data = await getData(requestCollection);

      const visibleRequests = (data || []).filter(
        (member) =>
          !member.status ||
          member.status === "PENDING" ||
          member.status === "REJECTED"
      );

      setRequests(visibleRequests);

    } catch (error) {

      console.log("Load Requests Error:", error);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadRequests();

  }, []);


  /* WEBSITE SHORT NAME */

  const getWebsiteShortName = async () => {

    try {

      const snap = await getDoc(
        doc(db, "websiteSettings", "main")
      );

      if (!snap.exists()) {
        return "OCMA";
      }

      const data = snap.data();

      return (
        data?.website?.shortName
          ?.trim()
          .replace(/\s+/g, "-") ||
        "OCMA"
      );

    } catch (error) {

      console.log("Website Settings Error:", error);

      return "OCMA";

    }

  };


  /* GENERATE MEMBER ID */

  const generateMemberId = async () => {

    const [members, shortName] = await Promise.all([
      getData(memberCollection),
      getWebsiteShortName()
    ]);

    const usedNumbers = (members || [])
      .map((member) => {

        if (!member.memberId) {
          return null;
        }

        const match = member.memberId.match(/-(\d+)$/);

        return match
          ? Number(match[1])
          : null;

      })
      .filter(
        (number) =>
          number !== null &&
          !Number.isNaN(number)
      );

    let number = 1111;

    while (usedNumbers.includes(number)) {
      number++;
    }

    return `${shortName}-${number}`;

  };


  /* OPEN MEMBER */

  const openMember = (member) => {

    const copy = {
      ...member,
      portfolio: {
        photos: [
          ...(member.portfolio?.photos || [])
        ],
        videos: [
          ...(member.portfolio?.videos || [])
        ]
      },
      newProfilePhoto: null,
      profilePhotoPreview: "",
      newPortfolioPhotos: [],
      newPortfolioPreviews: []
    };

    setSelectedMember(member);
    setEditMember(copy);
    setIsEditing(false);

  };


  /* CLOSE POPUP */

  const closePopup = () => {

    if (saving) {
      return;
    }

    setSelectedMember(null);
    setEditMember(null);
    setIsEditing(false);

  };


  /* EDIT INPUT */

  const handleEditChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setEditMember((prev) => ({
      ...prev,
      [name]: value
    }));

  };


  /* START EDIT */

  const startEditing = () => {

    if (!selectedMember) {
      return;
    }

    const copy = {
      ...selectedMember,
      portfolio: {
        photos: [
          ...(selectedMember.portfolio?.photos || [])
        ],
        videos: [
          ...(selectedMember.portfolio?.videos || [])
        ]
      },
      newProfilePhoto: null,
      profilePhotoPreview: "",
      newPortfolioPhotos: [],
      newPortfolioPreviews: []
    };

    setEditMember(copy);
    setIsEditing(true);

  };


  /* CANCEL EDIT */

  const cancelEditing = () => {

    setEditMember(null);
    setIsEditing(false);

  };


  /* PROFILE PHOTO */

  const handleEditProfilePhoto = (e) => {

    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {

      alert("صرف تصویر فائل منتخب کریں۔");
      return;

    }

    if (file.size > 5 * 1024 * 1024) {

      alert(
        "پروفائل تصویر 5MB سے زیادہ نہیں ہونی چاہیے۔"
      );

      return;

    }

    setEditMember((prev) => ({
      ...prev,
      newProfilePhoto: file,
      profilePhotoPreview: URL.createObjectURL(file)
    }));

  };


  /* DELETE PROFILE PHOTO */

  const removeProfilePhoto = () => {

    setEditMember((prev) => ({
      ...prev,
      image: "",
      newProfilePhoto: null,
      profilePhotoPreview: ""
    }));

  };


  /* PORTFOLIO PHOTO ADD */

  const handleEditPortfolio = (e) => {

    const files = Array.from(
      e.target.files || []
    );

    const currentPhotos =
      editMember?.portfolio?.photos || [];

    const currentNewPhotos =
      editMember?.newPortfolioPhotos || [];

    const total =
      currentPhotos.length +
      currentNewPhotos.length;

    const available = 10 - total;

    if (available <= 0) {

      alert(
        "زیادہ سے زیادہ 10 Portfolio Photos رکھی جا سکتی ہیں۔"
      );

      return;

    }

    const validFiles = [];

    for (
      const file of files.slice(0, available)
    ) {

      if (!file.type.startsWith("image/")) {
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {

        alert(
          `${file.name} کا سائز 5MB سے زیادہ ہے۔`
        );

        continue;

      }

      validFiles.push(file);

    }

    setEditMember((prev) => ({
      ...prev,
      newPortfolioPhotos: [
        ...(prev.newPortfolioPhotos || []),
        ...validFiles
      ],
      newPortfolioPreviews: [
        ...(prev.newPortfolioPreviews || []),
        ...validFiles.map((file) =>
          URL.createObjectURL(file)
        )
      ]
    }));

    e.target.value = "";

  };


  /* DELETE OLD PORTFOLIO PHOTO */

  const removeOldPortfolioPhoto = (index) => {

    setEditMember((prev) => {

      const photos = [
        ...(prev.portfolio?.photos || [])
      ];

      photos.splice(index, 1);

      return {
        ...prev,
        portfolio: {
          ...(prev.portfolio || {}),
          photos
        }
      };

    });

  };


  /* DELETE NEW PORTFOLIO PHOTO */

  const removeNewPortfolioPhoto = (index) => {

    setEditMember((prev) => {

      const files = [
        ...(prev.newPortfolioPhotos || [])
      ];

      const previews = [
        ...(prev.newPortfolioPreviews || [])
      ];

      files.splice(index, 1);
      previews.splice(index, 1);

      return {
        ...prev,
        newPortfolioPhotos: files,
        newPortfolioPreviews: previews
      };

    });

  };


  /* VIDEO EMBED URL */

  const getEmbedUrl = (url) => {

    if (!url) {
      return "";
    }

    try {

      if (url.includes("youtube.com/watch")) {

        const id = new URL(url)
          .searchParams
          .get("v");

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

        return (
          `https://www.facebook.com/plugins/video.php?href=` +
          `${encodeURIComponent(url)}` +
          `&show_text=false`
        );

      }

    } catch (error) {

      return "";

    }

    return "";

  };


  /* VIDEO CHANGE */

  const changeVideo = (index, value) => {

    setEditMember((prev) => {

      const videos = [
        ...(prev.portfolio?.videos || [])
      ];

      videos[index] = {
        url: value,
        embed: getEmbedUrl(value)
      };

      return {
        ...prev,
        portfolio: {
          ...(prev.portfolio || {}),
          videos
        }
      };

    });

  };


  /* ADD VIDEO */

  const addVideo = () => {

    const videos =
      editMember?.portfolio?.videos || [];

    if (videos.length >= 5) {

      alert(
        "زیادہ سے زیادہ 5 ویڈیوز رکھی جا سکتی ہیں۔"
      );

      return;

    }

    setEditMember((prev) => ({
      ...prev,
      portfolio: {
        ...(prev.portfolio || {}),
        videos: [
          ...(prev.portfolio?.videos || []),
          {
            url: "",
            embed: ""
          }
        ]
      }
    }));

  };


  /* DELETE VIDEO */

  const removeVideo = (index) => {

    setEditMember((prev) => {

      const videos = [
        ...(prev.portfolio?.videos || [])
      ];

      videos.splice(index, 1);

      return {
        ...prev,
        portfolio: {
          ...(prev.portfolio || {}),
          videos
        }
      };

    });

  };


  /* SAVE EDIT */

  const saveRequestEdit = async (e) => {

    e.preventDefault();

    if (!editMember) {
      return;
    }

    try {

      setSaving(true);

      let image =
        editMember.image || "";

      if (editMember.newProfilePhoto) {

        image = await uploadImage(
          editMember.newProfilePhoto
        );

      }

      const oldPhotos =
        editMember.portfolio?.photos || [];

      let newPhotos = [];

      if (
        editMember.newPortfolioPhotos?.length
      ) {

        newPhotos = await uploadImages(
          editMember.newPortfolioPhotos
        );

      }

      const finalPhotos = [
        ...oldPhotos,
        ...newPhotos
      ].slice(0, 10);


      const finalVideos = (
        editMember.portfolio?.videos || []
      )
        .filter(
          (video) =>
            video?.url?.trim()
        )
        .slice(0, 5)
        .map((video) => ({
          url: video.url.trim(),
          embed: getEmbedUrl(
            video.url.trim()
          )
        }));


      await updateData(
        requestCollection,
        editMember.id,
        {

          name:
            editMember.name || "",

          fatherName:
            editMember.fatherName || "",

          phone:
            editMember.phone || "",

          city:
            editMember.city || "",

          studio:
            editMember.studio || "",

          googleAddress:
            editMember.googleAddress || "",

          gender:
            editMember.gender || "",

          specialty:
            editMember.specialty || "",

          experience:
            editMember.experience || "",

          bloodGroup:
            editMember.bloodGroup || "",

          address:
            editMember.address || "",

          cameraDetails:
            editMember.cameraDetails || "",

          message:
            editMember.message || "",

          image,

          portfolio: {
            photos: finalPhotos,
            videos: finalVideos
          }

        }
      );

      alert(
        "درخواست کی معلومات کامیابی سے تبدیل ہوگئیں۔"
      );

      setSelectedMember({
        ...editMember,
        image,
        portfolio: {
          photos: finalPhotos,
          videos: finalVideos
        }
      });

      setEditMember(null);
      setIsEditing(false);

      loadRequests();

    } catch (error) {

      console.log(
        "Edit Request Error:",
        error
      );

      alert(
        "معلومات تبدیل نہیں ہو سکیں۔ دوبارہ کوشش کریں۔"
      );

    } finally {

      setSaving(false);

    }

  };


  /* APPROVE */

  const approveMember = async (member) => {

    const confirmApprove =
      window.confirm(
        `کیا آپ ${
          member.name ||
          "اس ممبر"
        } کو منظور کرنا چاہتے ہیں؟`
      );

    if (!confirmApprove) {
      return;
    }

    try {

      const memberId =
        await generateMemberId();

      const approvalDate =
        new Date();

      const joiningDate =
        approvalDate.toISOString();

      await addData(
        memberCollection,
        {

          memberId,

          name:
            member.name || "",

          fatherName:
            member.fatherName || "",

          gender:
            member.gender || "",

          phone:
            member.phone || "",

          city:
            member.city || "",

          studio:
            member.studio || "",

          specialty:
            member.specialty || "",

          experience:
            member.experience || "",

          bloodGroup:
            member.bloodGroup || "",

          address:
            member.address || "",

          googleAddress:
            member.googleAddress || "",

          cameraDetails:
            member.cameraDetails || "",

          message:
            member.message || "",

          image:
            member.image || "",

          portfolio: {
            photos:
              member.portfolio?.photos || [],

            videos:
              member.portfolio?.videos || []
          },

          certificate:
            member.certificate || "",

          /* GOOGLE ACCOUNT OWNERSHIP */

          googleUid:
            member.googleUid || "",

          googleEmail:
            member.googleEmail || "",

          googleName:
            member.googleName || "",

          googlePhoto:
            member.googlePhoto || "",

          googleRating:
            member.googleRating || 0,

          googleReviewCount:
            member.googleReviewCount || 0,

          status:
            "ACTIVE",

          joiningDate,

          createdAt:
            joiningDate

        }
      );

      await deleteData(
        requestCollection,
        member.id
      );

      alert(
        `ممبر کامیابی سے منظور ہوگیا۔\n\nMember Code: ${memberId}\nJoining Date: ${approvalDate.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "long",
            year: "numeric"
          }
        )}`
      );

      closePopup();
      loadRequests();

    } catch (error) {

      console.log(
        "Member Approval Error:",
        error
      );

      alert("Approval Failed");

    }

  };


  /* REJECT */

  const rejectMember = async (member) => {

    const confirmReject =
      window.confirm(
        `کیا آپ ${
          member.name ||
          "اس درخواست"
        } کو مسترد کرنا چاہتے ہیں؟`
      );

    if (!confirmReject) {
      return;
    }

    try {

      await updateData(
        requestCollection,
        member.id,
        {
          status: "REJECTED"
        }
      );

      closePopup();

      alert(
        "درخواست مسترد کر دی گئی۔"
      );

      loadRequests();

    } catch (error) {

      console.log(
        "Reject Request Error:",
        error
      );

      alert(
        "درخواست مسترد نہیں ہو سکی۔"
      );

    }

  };


  /* DELETE REQUEST */

  const deleteRequest = async (id) => {

    const confirmDelete =
      window.confirm(
        "کیا آپ یہ درخواست مستقل طور پر حذف کرنا چاہتے ہیں؟"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteData(
        requestCollection,
        id
      );

      closePopup();

      alert(
        "درخواست حذف کر دی گئی۔"
      );

      loadRequests();

    } catch (error) {

      console.log(
        "Delete Request Error:",
        error
      );

      alert(
        "درخواست حذف نہیں ہو سکی۔"
      );

    }

  };


  return (

    <div className="member-request-admin">

      <h1>
        OCMA Membership Requests
      </h1>


      {loading && (
        <h2>
          Loading...
        </h2>
      )}


      {!loading &&
        requests.length === 0 && (
          <h2>
            No Membership Requests Found
          </h2>
        )}


      <div className="request-grid">

        {requests.map((member) => (

          <div
            className="request-card"
            key={member.id}
          >

            <img
              className="request-card-photo"
              src={
                member.image ||
                "/assets/ocma-logo.png"
              }
              alt={
                member.name ||
                "Member"
              }
              onClick={() =>
                member.image &&
                setLargePhoto(member.image)
              }
            />


            <h3>
              {member.name || "No Name"}
            </h3>


            <p>
              <b>Gender:</b>{" "}
              {member.gender || "-"}
            </p>


            <p>
              <b>Work:</b>{" "}
              {member.specialty || "-"}
            </p>


            <p>
              <b>City:</b>{" "}
              {member.city || "-"}
            </p>


            <p>
              <b>Phone:</b>{" "}
              {member.phone || "-"}
            </p>


            <p>
              <b>Status:</b>{" "}
              {member.status === "REJECTED"
                ? "REJECTED"
                : "PENDING"}
            </p>


            <button
              onClick={() =>
                openMember(member)
              }
            >
              View Details
            </button>


            <div className="request-buttons">

              <button
                onClick={() =>
                  approveMember(member)
                }
              >
                Approve
              </button>


              {member.status !== "REJECTED" && (

                <button
                  className="reject"
                  onClick={() =>
                    rejectMember(member)
                  }
                >
                  Reject
                </button>

              )}


              <button
                className="delete"
                onClick={() =>
                  deleteRequest(member.id)
                }
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>


      {/* SINGLE MEMBER POPUP */}

      {selectedMember && (

        <div
          className="member-popup"
          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {

              closePopup();

            }

          }}
        >

          <div className="popup-box">

            <div className="popup-header">

              <h2>
                {isEditing
                  ? "Edit Membership Request"
                  : "Member Details"}
              </h2>

              <button
                type="button"
                className="popup-close"
                onClick={closePopup}
              >
                ×
              </button>

            </div>


            {/* EDIT MODE */}

            {isEditing && editMember ? (

              <form
                className="edit-request-form"
                onSubmit={saveRequestEdit}
              >

                <div className="edit-field">

                  <label>
                    Member Name
                  </label>

                  <input
                    name="name"
                    value={
                      editMember.name || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>


                <div className="edit-field">

                  <label>
                    Father Name
                  </label>

                  <input
                    name="fatherName"
                    value={
                      editMember.fatherName || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>


                <div className="edit-field">

                  <label>
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={
                      editMember.gender || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  >

                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                  </select>

                </div>


                <div className="edit-field">

                  <label>
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={
                      editMember.phone || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>


                <div className="edit-field">

                  <label>
                    City
                  </label>

                  <input
                    name="city"
                    value={
                      editMember.city || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>


                <div className="edit-field">

                  <label>
                    Studio
                  </label>

                  <input
                    name="studio"
                    value={
                      editMember.studio || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>


                <div className="edit-field">

                  <label>
                    Work / Profession
                  </label>

                  <select
                    name="specialty"
                    value={
                      editMember.specialty || ""
                    }
                    onChange={
                      handleEditChange
                    }
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

                  </select>

                </div>


                <div className="edit-field">

                  <label>
                    Experience
                  </label>

                  <select
                    name="experience"
                    value={
                      editMember.experience || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  >

                    <option value="">
                      Select Experience
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

                </div>


                <div className="edit-field">

                  <label>
                    Blood Group
                  </label>

                  <select
                    name="bloodGroup"
                    value={
                      editMember.bloodGroup || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  >

                    <option value="">
                      Select Blood Group
                    </option>

                    <option value="A+">
                      A+
                    </option>

                    <option value="A-">
                      A-
                    </option>

                    <option value="B+">
                      B+
                    </option>

                    <option value="B-">
                      B-
                    </option>

                    <option value="AB+">
                      AB+
                    </option>

                    <option value="AB-">
                      AB-
                    </option>

                    <option value="O+">
                      O+
                    </option>

                    <option value="O-">
                      O-
                    </option>

                  </select>

                </div>


                <div className="edit-field">

                  <label>
                    Camera & Equipment
                  </label>

                  <textarea
                    name="cameraDetails"
                    value={
                      editMember.cameraDetails || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>


                <div className="edit-field">

                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={
                      editMember.address || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>


                <div className="edit-field">

                  <label>
                    Google Address
                  </label>

                  <input
                    name="googleAddress"
                    value={
                      editMember.googleAddress || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>


                <div className="edit-field">

                  <label>
                    Message
                  </label>

                  <textarea
                    name="message"
                    value={
                      editMember.message || ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>


                {/* PROFILE PHOTO */}

                <div className="edit-section">

                  <h3>
                    Profile Photo
                  </h3>

                  <div className="admin-edit-photo">

                    <img
                      src={
                        editMember.profilePhotoPreview ||
                        editMember.image ||
                        "/assets/ocma-logo.png"
                      }
                      alt="profile"
                      onClick={() =>
                        (
                          editMember.profilePhotoPreview ||
                          editMember.image
                        ) &&
                        setLargePhoto(
                          editMember.profilePhotoPreview ||
                          editMember.image
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={
                        removeProfilePhoto
                      }
                    >
                      Delete Photo
                    </button>

                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleEditProfilePhoto
                    }
                  />

                </div>


                {/* PORTFOLIO */}

                <div className="edit-section">

                  <h3>
                    Portfolio Photos
                  </h3>

                  <p>
                    موجودہ اور نئی ملا کر زیادہ سے زیادہ 10 تصاویر۔
                  </p>


                  <div className="admin-portfolio-preview">

                    {(
                      editMember.portfolio?.photos ||
                      []
                    ).map((photo, index) => (

                      <div
                        className="admin-portfolio-item"
                        key={`old-${index}`}
                      >

                        <img
                          src={photo}
                          alt={`portfolio-${index}`}
                          onClick={() =>
                            setLargePhoto(photo)
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeOldPortfolioPhoto(index)
                          }
                        >
                          ×
                        </button>

                      </div>

                    ))}


                    {(
                      editMember.newPortfolioPreviews ||
                      []
                    ).map((photo, index) => (

                      <div
                        className="admin-portfolio-item"
                        key={`new-${index}`}
                      >

                        <img
                          src={photo}
                          alt={`new-portfolio-${index}`}
                          onClick={() =>
                            setLargePhoto(photo)
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewPortfolioPhoto(index)
                          }
                        >
                          ×
                        </button>

                      </div>

                    ))}

                  </div>


                  {(
                    (editMember.portfolio?.photos || []).length +
                    (editMember.newPortfolioPhotos || []).length
                  ) < 10 && (

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={
                        handleEditPortfolio
                      }
                    />

                  )}

                </div>


                {/* VIDEOS */}

                <div className="edit-section">

                  <h3>
                    Video Portfolio
                  </h3>

                  <p>
                    زیادہ سے زیادہ 5 ویڈیو لنکس۔
                  </p>


                  {(
                    editMember.portfolio?.videos ||
                    []
                  ).map((video, index) => (

                    <div
                      className="admin-edit-video"
                      key={index}
                    >

                      <label>
                        Video {index + 1}
                      </label>

                      <input
                        type="text"
                        value={
                          video.url || ""
                        }
                        onChange={(e) =>
                          changeVideo(
                            index,
                            e.target.value
                          )
                        }
                        placeholder="Video Link"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeVideo(index)
                        }
                      >
                        Delete
                      </button>


                      {video.url &&
                        getEmbedUrl(video.url) && (

                        <iframe
                          title={`edit-video-${index}`}
                          src={getEmbedUrl(video.url)}
                          width="100%"
                          height="220"
                          frameBorder="0"
                          allowFullScreen
                        />

                      )}

                    </div>

                  ))}


                  {(
                    editMember.portfolio?.videos ||
                    []
                  ).length < 5 && (

                    <button
                      type="button"
                      onClick={addVideo}
                    >
                      + Add Video
                    </button>

                  )}

                </div>


                {/* EDIT ACTIONS */}

                <div className="popup-actions">

                  <button
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      cancelEditing
                    }
                  >
                    Cancel
                  </button>

                </div>

              </form>

            ) : (

              /* VIEW MODE */

              <>

                {selectedMember.image && (

                  <img
                    src={
                      selectedMember.image
                    }
                    alt={
                      selectedMember.name
                    }
                    className="popup-member-image"
                    onClick={() =>
                      setLargePhoto(
                        selectedMember.image
                      )
                    }
                  />

                )}


                <div className="member-details">

                  <p>
                    <b>Status:</b>{" "}
                    {selectedMember.status ===
                    "REJECTED"
                      ? "REJECTED"
                      : "PENDING"}
                  </p>

                  <p>
                    <b>Member Name:</b>{" "}
                    {selectedMember.name || "-"}
                  </p>

                  <p>
                    <b>Father Name:</b>{" "}
                    {selectedMember.fatherName || "-"}
                  </p>

                  <p>
                    <b>Gender:</b>{" "}
                    {selectedMember.gender || "-"}
                  </p>

                  <p>
                    <b>Phone:</b>{" "}
                    {selectedMember.phone || "-"}
                  </p>

                  <p>
                    <b>City:</b>{" "}
                    {selectedMember.city || "-"}
                  </p>

                  <p>
                    <b>Studio:</b>{" "}
                    {selectedMember.studio || "-"}
                  </p>

                  <p>
                    <b>Work:</b>{" "}
                    {selectedMember.specialty || "-"}
                  </p>

                  <p>
                    <b>Experience:</b>{" "}
                    {selectedMember.experience || "-"}
                  </p>

                  <p>
                    <b>Blood Group:</b>{" "}
                    {selectedMember.bloodGroup || "-"}
                  </p>

                  <p>
                    <b>Camera & Equipment:</b>{" "}
                    {selectedMember.cameraDetails || "-"}
                  </p>

                  <p>
                    <b>Address:</b>{" "}
                    {selectedMember.address || "-"}
                  </p>

                  <p>
                    <b>Google Address:</b>{" "}
                    {selectedMember.googleAddress || "-"}
                  </p>

                  <p>
                    <b>Message:</b>{" "}
                    {selectedMember.message || "-"}
                  </p>

                </div>


                {/* PORTFOLIO PHOTOS */}

                <h3>
                  Portfolio Photos
                </h3>

                <div className="admin-portfolio-preview">

                  {(
                    selectedMember.portfolio?.photos ||
                    []
                  ).map((photo, index) => (

                    <img
                      key={index}
                      src={photo}
                      alt={`portfolio-${index}`}
                      onClick={() =>
                        setLargePhoto(photo)
                      }
                    />

                  ))}

                </div>


                {(
                  selectedMember.portfolio?.photos ||
                  []
                ).length === 0 && (

                  <p className="no-portfolio">
                    No Portfolio Photos
                  </p>

                )}


                {/* VIDEOS */}

                <h3>
                  Video Portfolio
                </h3>

                {(
                  selectedMember.portfolio?.videos ||
                  []
                ).map((video, index) => (

                  <div
                    key={index}
                    className="admin-view-video"
                  >

                    <p>
                      <b>
                        Video {index + 1}:
                      </b>{" "}
                      {video.url}
                    </p>

                    {video.embed && (

                      <iframe
                        title={`request-video-${index}`}
                        src={video.embed}
                        width="100%"
                        height="220"
                        frameBorder="0"
                        allowFullScreen
                      />

                    )}

                  </div>

                ))}


                {/* ACTIONS */}

                <div className="popup-actions">

                  <button
                    onClick={
                      startEditing
                    }
                  >
                    Edit Details
                  </button>


                  <button
                    onClick={() =>
                      approveMember(
                        selectedMember
                      )
                    }
                  >
                    Approve Member
                  </button>


                  {selectedMember.status !==
                    "REJECTED" && (

                    <button
                      className="reject"
                      onClick={() =>
                        rejectMember(
                          selectedMember
                        )
                      }
                    >
                      Reject
                    </button>

                  )}


                  <button
                    className="delete"
                    onClick={() =>
                      deleteRequest(
                        selectedMember.id
                      )
                    }
                  >
                    Delete
                  </button>


                  <button
                    onClick={closePopup}
                  >
                    Close
                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}


      {/* LARGE PHOTO */}

      {largePhoto && (

        <div
          className="large-photo-overlay"
          onClick={() =>
            setLargePhoto(null)
          }
        >

          <button
            className="large-photo-close"
            onClick={() =>
              setLargePhoto(null)
            }
            type="button"
          >
            ×
          </button>

          <img
            className="large-photo"
            src={largePhoto}
            alt="Large Preview"
            onClick={(e) =>
              e.stopPropagation()
            }
          />

        </div>

      )}

    </div>

  );

}


export default MemberRequests;