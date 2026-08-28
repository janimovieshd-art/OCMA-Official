
import { useEffect, useMemo, useState } from "react";

import {
  addData,
  getData,
  updateData,
  deleteData
} from "../../services/firestoreService";

import { uploadImage } from "../../services/cloudinary";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

import "./SeniorMembers.css";

function SeniorMembers() {
  const collectionName = "seniorMembers";

  const [members, setMembers] = useState([]);
  const [websiteLogo, setWebsiteLogo] = useState("");

  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [designation, setDesignation] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");
  const [phone, setPhone] = useState("");
  const [stars, setStars] = useState(5);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMembers = async () => {
    try {
      const data = await getData(collectionName);
      setMembers(data);
    } catch (error) {
      console.log("Senior Members Load Error:", error);
    }
  };

  const loadWebsiteLogo = async () => {
    try {
      const settingsRef = doc(db, "websiteSettings", "main");
      const snap = await getDoc(settingsRef);

      if (snap.exists()) {
        setWebsiteLogo(snap.data().website?.logo || "");
      }
    } catch (error) {
      console.log("Website Logo Load Error:", error);
    }
  };

  useEffect(() => {
    loadMembers();
    loadWebsiteLogo();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetForm = () => {
    setName("");
    setMemberCode("");
    setDesignation("");
    setCity("");
    setProfession("");
    setPhone("");
    setStars(5);
    setImage(null);
    setImagePreview("");
    setEditingId(null);
  };

  const handleImageChange = (file) => {
    if (!file) {
      setImage(null);
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !designation.trim()) return;

    try {
      setLoading(true);

      let imageUrl = editingId
        ? members.find((m) => m.id === editingId)?.image || ""
        : "";

      if (image) {
        imageUrl = await uploadImage(image);
      }

      if (!imageUrl) {
        imageUrl = websiteLogo || "";
      }

      const memberData = {
        name: name.trim(),
        memberCode: memberCode.trim(),
        designation: designation.trim(),
        city: city.trim(),
        profession: profession.trim(),
        phone: phone.trim(),
        stars: Number(stars),
        image: imageUrl
      };

      if (editingId) {
        await updateData(
          collectionName,
          editingId,
          memberData
        );
      } else {
        await addData(collectionName, {
          ...memberData,
          createdAt: new Date().toISOString()
        });
      }

      resetForm();
      await loadMembers();
    } catch (error) {
      console.log("Senior Member Save Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);

    setName(member.name || "");
    setMemberCode(member.memberCode || "");
    setDesignation(member.designation || "");
    setCity(member.city || "");
    setProfession(member.profession || "");
    setPhone(member.phone || "");
    setStars(member.stars || 5);

    setImage(null);
    setImagePreview(member.image || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this member?"
      )
    ) {
      return;
    }

    try {
      await deleteData(collectionName, id);
      await loadMembers();
    } catch (error) {
      console.log("Senior Member Delete Error:", error);
    }
  };

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return members;

    return members.filter((member) =>
      [
        member.name,
        member.memberCode,
        member.city,
        member.designation,
        member.profession,
        member.phone
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [members, search]);

  const cityCounts = useMemo(() => {
    return filteredMembers.reduce((acc, member) => {
      const value = member.city?.trim();

      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }

      return acc;
    }, {});
  }, [filteredMembers]);

  const designationCounts = useMemo(() => {
    return filteredMembers.reduce((acc, member) => {
      const value = member.designation?.trim();

      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }

      return acc;
    }, {});
  }, [filteredMembers]);

  return (
    <div className="senior-container">

      {/* HEADER */}
      <div className="senior-header">
        <div>
          <h1>Senior Members</h1>
          <p>Manage senior members and profiles</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="senior-search-wrap">

        <div className="senior-search">

          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search name, code, city, designation, profession or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>

        <div className="senior-result">
          <strong>{filteredMembers.length}</strong>
          <span>
            {search.trim() ? "Results" : "Members"}
          </span>
        </div>

      </div>

      {/* COMPACT FILTER INFO */}
      <div className="senior-overview">

        <details className="senior-drop">
          <summary>
            <span>City</span>
            <b>{Object.keys(cityCounts).length}</b>
          </summary>

          <div className="senior-drop-content">
            {Object.entries(cityCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([value, count]) => (
                <div
                  className="senior-drop-item"
                  key={value}
                >
                  <span>{value}</span>
                  <strong>{count}</strong>
                </div>
              ))}
          </div>
        </details>

        <details className="senior-drop">
          <summary>
            <span>Designation</span>
            <b>{Object.keys(designationCounts).length}</b>
          </summary>

          <div className="senior-drop-content">
            {Object.entries(designationCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([value, count]) => (
                <div
                  className="senior-drop-item"
                  key={value}
                >
                  <span>{value}</span>
                  <strong>{count}</strong>
                </div>
              ))}
          </div>
        </details>

      </div>

      {/* FORM */}
      <form
        className="senior-form"
        onSubmit={handleSubmit}
      >

        <div className="form-heading">
          <div>
            <span className="form-kicker">
              SENIOR MEMBERS
            </span>

            <h2>
              {editingId
                ? "Edit Senior Member"
                : "Add Senior Member"}
            </h2>
          </div>

          {editingId && (
            <span className="editing-badge">
              Editing
            </span>
          )}
        </div>

        <div className="form-fields">

          <input
            placeholder="Member Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Member Code e.g. OCMA 1122"
            value={memberCode}
            onChange={(e) =>
              setMemberCode(e.target.value)
            }
          />

          <input
            placeholder="Designation"
            value={designation}
            onChange={(e) =>
              setDesignation(e.target.value)
            }
          />

          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            placeholder="Profession"
            value={profession}
            onChange={(e) =>
              setProfession(e.target.value)
            }
          />

          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

        </div>

        <div className="form-bottom">

          <div className="rating-input">
            <span>Rating</span>

            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={
                    star <= stars ? "active" : ""
                  }
                  onClick={() => setStars(star)}
                >
                  ★
                </button>
              ))}
            </div>

            <small>
              {Number(stars).toFixed(1)}
            </small>
          </div>

          <div className="upload-box">
            <label htmlFor="senior-photo">
              Profile Photo
            </label>

            <input
              id="senior-photo"
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange(
                  e.target.files?.[0] || null
                )
              }
            />
          </div>

        </div>

        {imagePreview && (
          <div className="senior-image-preview">

            <span className="preview-label">
              Profile Preview
            </span>

            <div className="senior-preview-card">

              <div className="senior-preview-photo">

                <img
                  src={imagePreview}
                  alt="Profile Preview"
                />

                {memberCode.trim() && (
                  <div className="senior-preview-code">
                    {memberCode.trim()}
                  </div>
                )}

              </div>

              <div className="senior-preview-info">

                <h3>
                  {name.trim() || "Member Name"}
                </h3>

                <div className="senior-preview-rating">

                  <span>
                    {"★".repeat(stars)}
                  </span>

                  <small>
                    {Number(stars).toFixed(1)}
                  </small>

                </div>

                <p className="senior-preview-designation">
                  {designation.trim() || "Designation"}
                </p>

                {profession.trim() && (
                  <p>
                    <strong>Profession:</strong>{" "}
                    {profession.trim()}
                  </p>
                )}

                {city.trim() && (
                  <p>
                    <strong>City:</strong>{" "}
                    {city.trim()}
                  </p>
                )}

                {phone.trim() && (
                  <p>
                    <strong>Phone:</strong>{" "}
                    {phone.trim()}
                  </p>
                )}

              </div>

            </div>

          </div>
        )}

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

      {/* MEMBERS */}
      <div className="senior-grid">

        {filteredMembers.length === 0 ? (
          <div className="senior-no-results">
            <strong>No members found</strong>

            <span>
              Try another name, code, city or designation.
            </span>
          </div>
        ) : (
          filteredMembers.map((member) => {

            const memberStars = Math.min(
              Math.max(
                Number(member.stars) || 5,
                1
              ),
              5
            );

            return (
              <div
                className="senior-card"
                key={member.id}
              >

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

                  {member.memberCode && (
                    <div className="senior-member-code">
                      {member.memberCode}
                    </div>
                  )}

                </div>

                <div className="senior-info">

                  <div className="member-top">

                    <h2>{member.name}</h2>

                    <div className="senior-rating">

                      <span className="stars">
                        {"★".repeat(memberStars)}
                      </span>

                      <span className="rating-number">
                        {memberStars.toFixed(1)}
                      </span>

                    </div>

                  </div>

                  <p className="designation">
                    {member.designation}
                  </p>

                  {member.profession && (
                    <p>
                      <strong>Profession</strong>
                      <span>{member.profession}</span>
                    </p>
                  )}

                  {member.city && (
                    <p>
                      <strong>City</strong>
                      <span>{member.city}</span>
                    </p>
                  )}

                  {member.phone && (
                    <p>
                      <strong>Phone</strong>
                      <span>{member.phone}</span>
                    </p>
                  )}

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
                        handleDelete(member.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}

export default SeniorMembers;

