import { useEffect, useRef, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from "firebase/firestore";

import {
  getData,
  deleteData,
  updateData
} from "../../services/firestoreService";

import {
  uploadImage,
  uploadImages
} from "../../services/cloudinary";

import { db } from "../../firebase/firebase";

import "./Members.css";


function Members() {

  const collectionName = "members";

  const [members, setMembers] =
    useState([]);

  const [editMember, setEditMember] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [openStat, setOpenStat] =
    useState(null);

  const [editPhoto, setEditPhoto] =
    useState(null);

  const [editPhotoPreview, setEditPhotoPreview] =
    useState("");

  const [newPortfolioPhotos, setNewPortfolioPhotos] =
    useState([]);

  const [newPortfolioPreview, setNewPortfolioPreview] =
    useState([]);

  const [saving, setSaving] =
    useState(false);

  const statRef =
    useRef(null);


  // =====================================================
  // LOAD MEMBERS
  // =====================================================

  const loadMembers = async () => {

    try {

      const data =
        await getData(collectionName);

      const activeMembers =
        (data || []).filter(
          (member) =>
            member.status === "ACTIVE"
        );

      activeMembers.sort((a, b) => {

        const matchA =
          a.memberId?.match(
            /-(\d+)$/
          );

        const matchB =
          b.memberId?.match(
            /-(\d+)$/
          );

        const numA =
          matchA
            ? Number(matchA[1])
            : 999999;

        const numB =
          matchB
            ? Number(matchB[1])
            : 999999;

        return numA - numB;

      });

      setMembers(
        activeMembers
      );

    } catch (error) {

      console.log(
        "Load Members Error:",
        error
      );

    }

  };


  useEffect(() => {

    loadMembers();

  }, []);


  // =====================================================
  // CLOSE DROPDOWN
  // =====================================================

  useEffect(() => {

    const handleOutsideClick = (e) => {

      if (
        statRef.current &&
        !statRef.current.contains(
          e.target
        )
      ) {

        setOpenStat(null);

      }

    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalMembers =
    members.length;


  const cityCounts = {};

  members.forEach((member) => {

    const city =
      member.city?.trim();

    if (!city) return;

    cityCounts[city] =
      (cityCounts[city] || 0) + 1;

  });


  const totalCities =
    Object.keys(
      cityCounts
    ).length;


  const professionCounts = {};

  members.forEach((member) => {

    const profession =
      member.specialty?.trim();

    if (!profession) return;

    professionCounts[profession] =
      (professionCounts[profession] || 0) + 1;

  });


  const totalProfessions =
    Object.keys(
      professionCounts
    ).length;


  const totalMale =
    members.filter(
      (member) =>
        member.gender?.toLowerCase() ===
        "male"
    ).length;


  const totalFemale =
    members.filter(
      (member) =>
        member.gender?.toLowerCase() ===
        "female"
    ).length;


  const sortedCities =
    Object.entries(
      cityCounts
    ).sort(
      (a, b) =>
        a[0].localeCompare(
          b[0]
        )
    );


  const sortedProfessions =
    Object.entries(
      professionCounts
    ).sort(
      (a, b) =>
        a[0].localeCompare(
          b[0]
        )
    );


  // =====================================================
  // DELETE RATINGS
  // =====================================================

  const deleteMemberRatings =
    async (memberId) => {

      if (!memberId) return;

      const ratingCollections = [
        "ratings",
        "member_ratings"
      ];

      for (
        const ratingCollection
        of ratingCollections
      ) {

        const ratingsRef =
          collection(
            db,
            ratingCollection
          );

        const ratingQuery =
          query(
            ratingsRef,
            where(
              "memberId",
              "==",
              memberId
            )
          );

        const snapshot =
          await getDocs(
            ratingQuery
          );

        await Promise.all(
          snapshot.docs.map(
            (ratingDoc) =>
              deleteDoc(
                doc(
                  db,
                  ratingCollection,
                  ratingDoc.id
                )
              )
          )
        );

      }

    };


  // =====================================================
  // DELETE MEMBER
  // =====================================================

  const handleDelete =
    async (
      id,
      memberId
    ) => {

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this member?\n\nAll reviews and ratings of this member will also be permanently deleted."
        );

      if (!confirmDelete) {
        return;
      }

      try {

        await deleteMemberRatings(
          memberId
        );

        await deleteData(
          collectionName,
          id
        );

        alert(
          "Member and all reviews deleted successfully."
        );

        loadMembers();

      } catch (error) {

        console.log(
          "Delete Member Error:",
          error
        );

        alert(
          "Delete failed. Please try again."
        );

      }

    };


  // =====================================================
  // OPEN EDIT
  // =====================================================

  const handleEdit =
    (member) => {

      setEditMember({
        ...member,

        portfolio: {
          photos:
            member.portfolio?.photos
              ? [
                  ...member.portfolio.photos
                ]
              : [],

          videos:
            member.portfolio?.videos
              ? member.portfolio.videos.map(
                  (video) => ({
                    ...video
                  })
                )
              : []
        }
      });

      setEditPhoto(null);
      setEditPhotoPreview("");

      setNewPortfolioPhotos([]);
      setNewPortfolioPreview([]);

    };


  // =====================================================
  // PROFILE PHOTO
  // =====================================================

  const handleEditProfilePhoto =
    (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "صرف تصویر فائل منتخب کریں۔"
        );

        return;

      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {

        alert(
          "تصویر 5MB سے زیادہ نہیں ہونی چاہیے۔"
        );

        return;

      }

      setEditPhoto(file);

      setEditPhotoPreview(
        URL.createObjectURL(
          file
        )
      );

    };


  // =====================================================
  // EDIT FIELD
  // =====================================================

  const handleEditChange =
    (e) => {

      const {
        name,
        value
      } = e.target;

      setEditMember(
        (prev) => ({
          ...prev,
          [name]: value
        })
      );

    };


  // =====================================================
  // DELETE EXISTING PHOTO
  // =====================================================

  const deleteExistingPhoto =
    (index) => {

      const photos =
        [
          ...(editMember.portfolio?.photos || [])
        ];

      photos.splice(
        index,
        1
      );

      setEditMember(
        (prev) => ({
          ...prev,

          portfolio: {
            ...(prev.portfolio || {}),
            photos
          }

        })
      );

    };


  // =====================================================
  // NEW PORTFOLIO PHOTOS
  // =====================================================

  const handleNewPortfolioPhotos =
    (e) => {

      const files =
        Array.from(
          e.target.files || []
        );

      const existingCount =
        editMember?.portfolio?.photos?.length || 0;

      const newCount =
        newPortfolioPhotos.length;

      const available =
        10 -
        existingCount -
        newCount;

      if (available <= 0) {

        alert(
          "زیادہ سے زیادہ 10 Portfolio Photos رکھی جا سکتی ہیں۔"
        );

        return;

      }

      const selected =
        files.slice(
          0,
          available
        );

      const validFiles = [];
      const validPreviews = [];

      selected.forEach(
        (file) => {

          if (
            !file.type.startsWith(
              "image/"
            )
          ) {
            return;
          }

          if (
            file.size >
            5 * 1024 * 1024
          ) {
            return;
          }

          validFiles.push(
            file
          );

          validPreviews.push(
            URL.createObjectURL(
              file
            )
          );

        }
      );

      setNewPortfolioPhotos(
        (prev) => [
          ...prev,
          ...validFiles
        ]
      );

      setNewPortfolioPreview(
        (prev) => [
          ...prev,
          ...validPreviews
        ]
      );

      e.target.value = "";

    };


  // =====================================================
  // DELETE NEW PHOTO
  // =====================================================

  const deleteNewPortfolioPhoto =
    (index) => {

      const files =
        [
          ...newPortfolioPhotos
        ];

      const previews =
        [
          ...newPortfolioPreview
        ];

      files.splice(
        index,
        1
      );

      previews.splice(
        index,
        1
      );

      setNewPortfolioPhotos(
        files
      );

      setNewPortfolioPreview(
        previews
      );

    };


  // =====================================================
  // VIDEO EMBED
  // =====================================================

  const getEmbedUrl =
    (url) => {

      if (!url) return "";

      try {

        if (
          url.includes(
            "youtube.com/watch"
          )
        ) {

          const id =
            new URL(url)
              .searchParams
              .get("v");

          if (id) {

            return `https://www.youtube.com/embed/${id}`;

          }

        }

        if (
          url.includes(
            "youtu.be"
          )
        ) {

          const id =
            url
              .split("/")
              .pop()
              .split("?")[0];

          if (id) {

            return `https://www.youtube.com/embed/${id}`;

          }

        }

        if (
          url.includes(
            "youtube.com/shorts/"
          )
        ) {

          const id =
            url
              .split("/shorts/")[1]
              .split("?")[0];

          if (id) {

            return `https://www.youtube.com/embed/${id}`;

          }

        }

        if (
          url.includes(
            "vimeo.com"
          )
        ) {

          const id =
            url
              .split("/")
              .pop()
              .split("?")[0];

          if (id) {

            return `https://player.vimeo.com/video/${id}`;

          }

        }

        if (
          url.includes(
            "facebook.com"
          )
        ) {

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


  // =====================================================
  // VIDEO CHANGE
  // =====================================================

  const handleVideoChange =
    (index, value) => {

      const videos =
        [
          ...(editMember.portfolio?.videos || [])
        ];

      videos[index] = {
        url: value,
        embed:
          getEmbedUrl(value)
      };

      setEditMember(
        (prev) => ({
          ...prev,

          portfolio: {
            ...(prev.portfolio || {}),
            videos
          }

        })
      );

    };


  // =====================================================
  // ADD VIDEO
  // =====================================================

  const addVideo = () => {

    const videos =
      [
        ...(editMember.portfolio?.videos || [])
      ];

    if (
      videos.length >= 5
    ) {

      alert(
        "زیادہ سے زیادہ 5 Video Links رکھی جا سکتی ہیں۔"
      );

      return;

    }

    videos.push({
      url: "",
      embed: ""
    });

    setEditMember(
      (prev) => ({
        ...prev,

        portfolio: {
          ...(prev.portfolio || {}),
          videos
        }

      })
    );

  };


  // =====================================================
  // DELETE VIDEO
  // =====================================================

  const deleteVideo =
    (index) => {

      const videos =
        [
          ...(editMember.portfolio?.videos || [])
        ];

      videos.splice(
        index,
        1
      );

      setEditMember(
        (prev) => ({
          ...prev,

          portfolio: {
            ...(prev.portfolio || {}),
            videos
          }

        })
      );

    };


  // =====================================================
  // SAVE MEMBER
  // =====================================================

  const handleUpdate =
    async (e) => {

      e.preventDefault();

      if (!editMember) {
        return;
      }

      try {

        setSaving(true);

        let image =
          editMember.image || "";

        if (editPhoto) {

          image =
            await uploadImage(
              editPhoto
            );

        }


        let photos =
          [
            ...(editMember.portfolio?.photos || [])
          ];


        if (
          newPortfolioPhotos.length > 0
        ) {

          const uploaded =
            await uploadImages(
              newPortfolioPhotos
            );

          photos = [
            ...photos,
            ...uploaded
          ];

        }


        if (
          photos.length > 10
        ) {

          alert(
            "Portfolio Photos زیادہ سے زیادہ 10 ہونی چاہئیں۔"
          );

          return;

        }


        let videos =
          [
            ...(editMember.portfolio?.videos || [])
          ];

        videos =
          videos
            .filter(
              (video) =>
                video?.url?.trim()
            )
            .slice(
              0,
              5
            )
            .map(
              (video) => ({
                url:
                  video.url.trim(),

                embed:
                  getEmbedUrl(
                    video.url.trim()
                  )
              })
            );


        await updateData(
          collectionName,
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

            specialty:
              editMember.specialty || "",

            gender:
              editMember.gender || "",

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
              photos,
              videos
            }

          }
        );


        alert(
          "Member Updated Successfully"
        );

        setEditMember(null);

        setEditPhoto(null);
        setEditPhotoPreview("");

        setNewPortfolioPhotos([]);
        setNewPortfolioPreview([]);

        loadMembers();

      } catch (error) {

        console.log(
          "Update Member Error:",
          error
        );

        alert(
          "Update Failed"
        );

      } finally {

        setSaving(false);

      }

    };


  // =====================================================
  // FILTER
  // =====================================================

  const filteredMembers =
    members.filter(
      (member) => {

        const text =
          search
            .toLowerCase()
            .trim();

        return (

          member.name
            ?.toLowerCase()
            .includes(text)

          ||

          member.phone
            ?.toLowerCase()
            .includes(text)

          ||

          member.city
            ?.toLowerCase()
            .includes(text)

          ||

          member.memberId
            ?.toLowerCase()
            .includes(text)

          ||

          member.specialty
            ?.toLowerCase()
            .includes(text)

          ||

          member.gender
            ?.toLowerCase()
            .includes(text)

        );

      }
    );


  // =====================================================
  // VIEW
  // =====================================================

  const handleView =
    (memberId) => {

      window.open(
        `/member/${memberId}`,
        "_blank"
      );

    };


  // =====================================================
  // STATS
  // =====================================================

  const toggleStat =
    (stat) => {

      setOpenStat(
        openStat === stat
          ? null
          : stat
      );

    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="members-admin">


      <div
        className="member-live-stats"
        ref={statRef}
      >

        <div className="member-stat-wrap">

          <button
            type="button"
            className="member-stat"
            onClick={() =>
              toggleStat(
                "members"
              )
            }
          >

            <span>
              Members
            </span>

            <strong>
              {totalMembers}
            </strong>

            <span className="stat-arrow">
              {openStat === "members"
                ? "▲"
                : "▼"}
            </span>

          </button>


          {openStat === "members" && (

            <div className="member-stat-dropdown">

              <div className="stat-dropdown-title">
                All Members
              </div>

              {members.length === 0 ? (

                <div className="stat-empty">
                  No members found
                </div>

              ) : (

                members.map(
                  (member) => (

                    <div
                      className="stat-member-item"
                      key={member.id}
                    >

                      <div>

                        <strong>
                          {member.name ||
                            "Unnamed Member"}
                        </strong>

                        <small>
                          {member.memberId ||
                            "No ID"}
                        </small>

                      </div>

                      <span>
                        {member.city ||
                          "No City"}
                      </span>

                    </div>

                  )
                )

              )}

            </div>

          )}

        </div>


        <div className="member-stat-wrap">

          <button
            type="button"
            className="member-stat"
            onClick={() =>
              toggleStat(
                "cities"
              )
            }
          >

            <span>
              Cities
            </span>

            <strong>
              {totalCities}
            </strong>

            <span className="stat-arrow">
              {openStat === "cities"
                ? "▲"
                : "▼"}
            </span>

          </button>


          {openStat === "cities" && (

            <div className="member-stat-dropdown">

              <div className="stat-dropdown-title">
                Cities & Members
              </div>

              {sortedCities.map(
                ([city, count]) => (

                  <div
                    className="stat-list-item"
                    key={city}
                  >

                    <span>
                      {city}
                    </span>

                    <strong>
                      {count}
                    </strong>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        <div className="member-stat-wrap">

          <button
            type="button"
            className="member-stat"
            onClick={() =>
              toggleStat(
                "professions"
              )
            }
          >

            <span>
              Professions
            </span>

            <strong>
              {totalProfessions}
            </strong>

            <span className="stat-arrow">
              {openStat === "professions"
                ? "▲"
                : "▼"}
            </span>

          </button>


          {openStat === "professions" && (

            <div className="member-stat-dropdown">

              <div className="stat-dropdown-title">
                Professions & Members
              </div>

              {sortedProfessions.map(
                ([profession, count]) => (

                  <div
                    className="stat-list-item"
                    key={profession}
                  >

                    <span>
                      {profession}
                    </span>

                    <strong>
                      {count}
                    </strong>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        <div className="member-stat-wrap">

          <div className="member-stat member-stat-static">

            <span>
              Male
            </span>

            <strong>
              {totalMale}
            </strong>

          </div>

        </div>


        <div className="member-stat-wrap">

          <div className="member-stat member-stat-static">

            <span>
              Female
            </span>

            <strong>
              {totalFemale}
            </strong>

          </div>

        </div>

      </div>


      <h1>
        Approved OCMA Members
      </h1>


      <input
        className="member-search"
        placeholder="Search Name, Phone, City or OCMA ID..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
      />


      <div className="members-grid">

        {filteredMembers.map(
          (member) => (

            <div
              className="member-card"
              key={member.id}
            >

              <div className="member-photo">

                <img
                  src={
                    member.image ||
                    "/assets/ocma-logo.png"
                  }
                  alt={
                    member.name ||
                    "OCMA Member"
                  }
                />

              </div>


              <div className="member-id">
                {member.memberId}
              </div>


              <div className="member-name">
                {member.name}
              </div>


              <div className="member-work">

                <div>
                  {member.specialty ||
                    "Not Added"}
                </div>

                {member.gender && (

                  <small className="member-gender">
                    {member.gender}
                  </small>

                )}

              </div>


              <div className="member-city">
                {member.city ||
                  "Not Added"}
              </div>


              <div className="member-phone">

                <div>
                  {member.phone ||
                    "Not Added"}
                </div>

                <small className="member-date">

                  Joining:{" "}

                  {member.joiningDate
                    ? new Date(
                        member.joiningDate
                      ).toLocaleDateString(
                        "en-GB"
                      )
                    : "Not Added"}

                </small>

              </div>


              <div className="member-buttons">

                <button
                  type="button"
                  onClick={() =>
                    handleEdit(
                      member
                    )
                  }
                >
                  Edit
                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleView(
                      member.memberId
                    )
                  }
                >
                  View
                </button>


                <button
                  type="button"
                  className="delete"
                  onClick={() =>
                    handleDelete(
                      member.id,
                      member.memberId
                    )
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          )
        )}

      </div>


      {filteredMembers.length === 0 && (

        <div className="no-members">
          No members found.
        </div>

      )}


      {/* =================================================
          EDIT MEMBER POPUP
      ================================================= */}

      {editMember && (

        <div
          className="edit-popup"
          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {

              setEditMember(null);

            }

          }}
        >

          <form
            className="edit-box"
            onSubmit={
              handleUpdate
            }
          >

            <h2>
              Edit Member
            </h2>


            <p className="edit-member-name">

              {editMember.name ||
                "OCMA Member"}

            </p>


            {/* PROFILE PHOTO */}

            <div className="edit-field">

              <label>
                Profile Photo
              </label>

              <img
                src={
                  editPhotoPreview ||
                  editMember.image ||
                  "/assets/ocma-logo.png"
                }
                alt="Profile"
                className="popup-member-image"
              />

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleEditProfilePhoto
                }
              />

            </div>


            <div className="edit-field">
              <label>Name</label>

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
              <label>Phone Number</label>

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
              <label>Father Name</label>

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
              <label>Studio Name</label>

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
              <label>City</label>

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
              <label>Google Business / Maps Address</label>

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
              <label>Profession</label>

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
              <label>Gender</label>

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
              <label>Experience</label>

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

            </div>


            <div className="edit-field">
              <label>Blood Group</label>

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

            </div>


            <div className="edit-field">
              <label>Complete Address</label>

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
              <label>Camera & Equipment Details</label>

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
              <label>Member Message</label>

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


            {/* =================================================
    PORTFOLIO PHOTOS
================================================= */}

<h3>
  Portfolio Photos
</h3>

<p>
  موجودہ تصاویر حذف کریں یا نئی شامل کریں۔
  زیادہ سے زیادہ 10 تصاویر۔
</p>


<div className="edit-portfolio-list">

  {(
    editMember.portfolio?.photos || []
  ).map(
    (photo, index) => (

      <div
        key={index}
        className="edit-portfolio-row"
      >

        <img
          src={photo}
          alt={`Portfolio ${index + 1}`}
          className="edit-portfolio-thumb"
          onClick={() =>
            window.open(
              photo,
              "_blank"
            )
          }
        />

        <div className="edit-portfolio-info">

          <strong>
            Photo {index + 1}
          </strong>

          <span>
            موجودہ Portfolio Photo
          </span>

        </div>

        <button
          type="button"
          className="edit-photo-delete"
          onClick={() =>
            deleteExistingPhoto(
              index
            )
          }
        >
          Delete
        </button>

      </div>

    )
  )}

</div>


<input
  type="file"
  multiple
  accept="image/*"
  onChange={
    handleNewPortfolioPhotos
  }
/>


{newPortfolioPreview.length > 0 && (

  <div className="edit-portfolio-list">

    {newPortfolioPreview.map(
      (photo, index) => (

        <div
          key={index}
          className="edit-portfolio-row new"
        >

          <img
            src={photo}
            alt={`New Portfolio ${index + 1}`}
            className="edit-portfolio-thumb"
          />

          <div className="edit-portfolio-info">

            <strong>
              New Photo {index + 1}
            </strong>

            <span>
              نئی شامل کی جانے والی تصویر
            </span>

          </div>

          <button
            type="button"
            className="edit-photo-delete"
            onClick={() =>
              deleteNewPortfolioPhoto(
                index
              )
            }
          >
            Delete
          </button>

        </div>

      )
    )}

  </div>

)}


            {/* =================================================
                VIDEOS
            ================================================= */}

            <h3>
              Video Portfolio
            </h3>

            {(
              editMember.portfolio?.videos || []
            ).map(
              (video, index) => (

                <div
                  className="video-box"
                  key={index}
                >

                  <input
                    type="text"
                    placeholder={`Video Link ${index + 1}`}
                    value={
                      video.url || ""
                    }
                    onChange={(e) =>
                      handleVideoChange(
                        index,
                        e.target.value
                      )
                    }
                  />

                  {video.url &&
                    getEmbedUrl(
                      video.url
                    ) && (

                      <iframe
                        title={`member-video-${index}`}
                        src={
                          getEmbedUrl(
                            video.url
                          )
                        }
                        width="100%"
                        height="250"
                        frameBorder="0"
                        allowFullScreen
                      />

                    )}

                  <button
                    type="button"
                    className="delete"
                    onClick={() =>
                      deleteVideo(
                        index
                      )
                    }
                  >
                    Delete Video
                  </button>

                </div>

              )
            )}


            {(
              editMember.portfolio?.videos?.length || 0
            ) < 5 && (

              <button
                type="button"
                onClick={addVideo}
              >
                + Add Video Link
              </button>

            )}


            {/* =================================================
                SAVE
            ================================================= */}

            <div className="edit-actions">

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Update Member"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditMember(null)
                }
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}

    </div>

  );

}


export default Members;