
import { useEffect, useState } from "react";

import {
  addData,
  getData,
  updateData,
  deleteData
} from "../../services/firestoreService";

import { uploadImage } from "../../services/cloudinary";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

import "./SeniorMembers.css";


function SeniorMembers() {

  const collectionName = "seniorMembers";

  const [members, setMembers] = useState([]);

  const [websiteLogo, setWebsiteLogo] = useState("");

  const [name, setName] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [designation, setDesignation] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");
  const [phone, setPhone] = useState("");
  const [stars, setStars] = useState(5);
  const [image, setImage] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);


  // ==========================================
  // LOAD SENIOR MEMBERS
  // ==========================================

  const loadMembers = async () => {

    const data = await getData(collectionName);

    setMembers(data);

  };


  // ==========================================
  // LOAD WEBSITE LOGO
  // ==========================================

  const loadWebsiteLogo = async () => {

    try {

      const settingsRef = doc(
        db,
        "websiteSettings",
        "main"
      );

      const snap = await getDoc(settingsRef);

      if (snap.exists()) {

        const data = snap.data();

        setWebsiteLogo(
          data.website?.logo || ""
        );

      }

    } catch (error) {

      console.log(
        "Website Logo Load Error:",
        error
      );

    }

  };


  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {

    loadMembers();
    loadWebsiteLogo();

  }, []);


  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {

    setName("");
    setMemberCode("");
    setDesignation("");
    setCity("");
    setProfession("");
    setPhone("");
    setStars(5);
    setImage(null);
    setEditingId(null);

  };


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !name.trim() ||
      !designation.trim()
    ) {
      return;
    }


    try {

      setLoading(true);


      // Existing image while editing

      let imageUrl = editingId
        ? members.find(
            (m) => m.id === editingId
          )?.image || ""
        : "";


      // New uploaded image

      if (image) {

        imageUrl = await uploadImage(image);

      }


      // Settings logo as fallback

      if (!imageUrl) {

        imageUrl =
          websiteLogo ||
          "";

      }


      const memberData = {

        name:
          name.trim(),

        memberCode:
          memberCode.trim(),

        designation:
          designation.trim(),

        city:
          city.trim(),

        profession:
          profession.trim(),

        phone:
          phone.trim(),

        stars:
          Number(stars),

        image:
          imageUrl

      };


      if (editingId) {

        await updateData(
          collectionName,
          editingId,
          memberData
        );

      } else {

        await addData(
          collectionName,
          {
            ...memberData,
            createdAt:
              new Date().toISOString()
          }
        );

      }


      resetForm();

      await loadMembers();

    } catch (error) {

      console.log(
        "Senior Member Save Error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (member) => {

    setEditingId(member.id);

    setName(
      member.name || ""
    );

    setMemberCode(
      member.memberCode || ""
    );

    setDesignation(
      member.designation || ""
    );

    setCity(
      member.city || ""
    );

    setProfession(
      member.profession || ""
    );

    setPhone(
      member.phone || ""
    );

    setStars(
      member.stars || 5
    );

    setImage(null);


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };


  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this member?"
      )
    ) {
      return;
    }


    await deleteData(
      collectionName,
      id
    );


    await loadMembers();

  };


  return (

    <div className="senior-container">

      <h1>
        Senior Members Management
      </h1>


      <form
        className="senior-form"
        onSubmit={handleSubmit}
      >

        <div className="form-title">

          {editingId
            ? "Edit Senior Member"
            : "Add Senior Member"}

        </div>


        {/* MEMBER NAME */}

        <input
          placeholder="Member Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />


        {/* MEMBER CODE */}

        <input
          placeholder="Member Code e.g. OCMA 1122"
          value={memberCode}
          onChange={(e) =>
            setMemberCode(e.target.value)
          }
        />


        {/* DESIGNATION */}

        <input
          placeholder="Designation"
          value={designation}
          onChange={(e) =>
            setDesignation(e.target.value)
          }
        />


        {/* CITY */}

        <input
          placeholder="City"
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
        />


        {/* PROFESSION */}

        <input
          placeholder="Profession"
          value={profession}
          onChange={(e) =>
            setProfession(e.target.value)
          }
        />


        {/* PHONE */}

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
        />


        {/* RATING */}

        <div className="rating-input">

          <span>
            Rating
          </span>

          <div className="rating-stars">

            {[1, 2, 3, 4, 5].map(
              (star) => (

                <button
                  type="button"
                  key={star}
                  className={
                    star <= stars
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStars(star)
                  }
                >
                  ★
                </button>

              )
            )}

          </div>

        </div>


        {/* PHOTO */}

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(
              e.target.files?.[0] || null
            )
          }
        />


        {/* BUTTONS */}

        <div className="form-buttons">

          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >

            {loading
              ? "Saving..."
              : editingId
              ? "Update Senior Member"
              : "Add Senior Member"}

          </button>


          {editingId && (

            <button
              type="button"
              className="cancel-btn"
              onClick={resetForm}
            >
              Cancel
            </button>

          )}

        </div>

      </form>


      {/* ======================================
          SENIOR MEMBERS
      ====================================== */}

      <div className="senior-grid">

        {members.map((member) => (

          <div
            className="senior-card"
            key={member.id}
          >

            {/* PHOTO */}

            <div className="senior-photo">

              <img
                src={
                  member.image ||
                  websiteLogo ||
                  "/assets/ocma-logo.png"
                }
                alt={
                  member.name ||
                  "Senior Member"
                }
              />


              {/* MEMBER CODE */}

              {member.memberCode && (

                <div className="senior-member-code">

                  {member.memberCode}

                </div>

              )}

            </div>


            {/* INFO */}

            <div className="senior-info">

              <h2>
                {member.name}
              </h2>


              {/* RATING */}

              <div className="senior-rating">

                <span className="stars">

                  {"★".repeat(
                    member.stars || 5
                  )}

                </span>

                <span className="rating-number">

                  {(member.stars || 5).toFixed(1)}

                </span>

              </div>


              {/* DESIGNATION */}

              <p className="designation">

                {member.designation}

              </p>


              {/* PROFESSION */}

              {member.profession && (

                <p>

                  <strong>
                    Profession:
                  </strong>{" "}

                  {member.profession}

                </p>

              )}


              {/* CITY */}

              {member.city && (

                <p>

                  <strong>
                    City:
                  </strong>{" "}

                  {member.city}

                </p>

              )}


              {/* PHONE */}

              {member.phone && (

                <p>

                  <strong>
                    Phone:
                  </strong>{" "}

                  {member.phone}

                </p>

              )}


              {/* ACTIONS */}

              <div className="senior-actions">

                {member.phone && (

                  <a
                    className="whatsapp-btn"
                    href={`https://wa.me/${member.phone
                      .replace(/\D/g, "")
                      .replace(/^0/, "92")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>

                )}


                <button
                  className="edit-btn"
                  onClick={() =>
                    handleEdit(member)
                  }
                >
                  Edit
                </button>


                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(
                      member.id
                    )
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}


export default SeniorMembers;
