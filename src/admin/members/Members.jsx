import { useEffect, useState } from "react";

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

import { db } from "../../firebase/firebase";

import "./Members.css";


function Members() {

  const collectionName = "members";

  const [members, setMembers] = useState([]);

  const [editMember, setEditMember] = useState(null);

  const [search, setSearch] = useState("");


  /* =====================================================
     LOAD MEMBERS
  ===================================================== */

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

        const numA =
          Number(
            a.memberId?.replace(
              "OCMA-",
              ""
            ) || 999999
          );

        const numB =
          Number(
            b.memberId?.replace(
              "OCMA-",
              ""
            ) || 999999
          );

        return numA - numB;

      });

      setMembers(activeMembers);

    } catch (error) {

      console.log(
        "Load Members Error:",
        error
      );

    }

  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    loadMembers();

  }, []);


  /* =====================================================
     DELETE ALL MEMBER RATINGS / REVIEWS
  ===================================================== */

  const deleteMemberRatings = async (
    memberId
  ) => {

    if (!memberId) return;

    const ratingCollections = [
      "ratings",
      "member_ratings"
    ];

    for (
      const collectionName
      of ratingCollections
    ) {

      const ratingsRef =
        collection(
          db,
          collectionName
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
                collectionName,
                ratingDoc.id
              )
            )
        )
      );

    }

  };


  /* =====================================================
     DELETE MEMBER
  ===================================================== */

  const handleDelete = async (
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

      /* DELETE ALL OLD RATINGS + REVIEWS FIRST */

      await deleteMemberRatings(
        memberId
      );


      /* DELETE MEMBER */

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


  /* =====================================================
     UPDATE MEMBER
  ===================================================== */

  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

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
            editMember.message || ""

        }

      );


      alert(
        "Member Updated Successfully"
      );


      setEditMember(null);

      loadMembers();

    } catch (error) {

      console.log(
        "Update Member Error:",
        error
      );

      alert(
        "Update Failed"
      );

    }

  };


  /* =====================================================
     FILTER MEMBERS
  ===================================================== */

  const filteredMembers =
    members.filter((member) => {

      const text =
        search.toLowerCase().trim();

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

      );

    });


  /* =====================================================
     OPEN MEMBER PROFILE
  ===================================================== */

  const handleView = (
    memberId
  ) => {

    window.open(
      `/member/${memberId}`,
      "_blank"
    );

  };


  /* =====================================================
     OPEN EDIT
  ===================================================== */

  const handleEdit = (
    member
  ) => {

    setEditMember({
      ...member
    });

  };


  /* =====================================================
     CLOSE EDIT
  ===================================================== */

  const closeEdit = () => {

    setEditMember(null);

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="members-admin">


      {/* PAGE TITLE */}

      <h1>
        Approved OCMA Members
      </h1>


      {/* SEARCH */}

      <input
        className="member-search"
        placeholder="Search Name, Phone, City or OCMA ID..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />


      {/* MEMBERS GRID */}

      <div className="members-grid">

        {filteredMembers.map(
          (member) => (

            <div
              className="member-card"
              key={member.id}
            >


              {/* MEMBER PHOTO */}

              <div className="member-photo">

                <img
                  src={
                    member.image
                      ? member.image
                      : "/assets/ocma-logo.png"
                  }
                  alt={
                    member.name ||
                    "OCMA Member"
                  }
                />

              </div>


              {/* MEMBER ID */}

              <div className="member-id">

                {member.memberId}

              </div>


              {/* MEMBER NAME */}

              <div className="member-name">

                {member.name}

              </div>


              {/* PROFESSION */}

              <div className="member-work">

                {member.specialty ||
                  "Not Added"}

              </div>


              {/* CITY */}

              <div className="member-city">

                {member.city ||
                  "Not Added"}

              </div>


              {/* PHONE + JOINING DATE */}

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


              {/* BUTTONS */}

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


      {/* NO SEARCH RESULT */}

      {filteredMembers.length === 0 && (

        <div className="no-members">

          No members found.

        </div>

      )}


      {/* EDIT MEMBER POPUP */}

      {editMember && (

        <div
          className="edit-popup"
          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {

              closeEdit();

            }

          }}
        >

          <form
            className="edit-box"
            onSubmit={
              handleUpdate
            }
          >


            {/* EDIT TITLE */}

            <h2>
              Edit Member
            </h2>


            <p className="edit-member-name">

              {editMember.name ||
                "OCMA Member"}

            </p>


            {/* NAME */}

            <div className="edit-field">

              <label>
                Name
              </label>

              <input
                type="text"
                value={
                  editMember.name || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    name:
                      e.target.value
                  })
                }
                placeholder="Enter Member Name"
              />

            </div>


            {/* PHONE NUMBER */}

            <div className="edit-field">

              <label>
                Phone Number
              </label>

              <input
                type="text"
                value={
                  editMember.phone || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    phone:
                      e.target.value
                  })
                }
                placeholder="Enter Phone Number"
              />

            </div>


            {/* FATHER NAME */}

            <div className="edit-field">

              <label>
                Father Name
              </label>

              <input
                type="text"
                value={
                  editMember.fatherName || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    fatherName:
                      e.target.value
                  })
                }
                placeholder="Enter Father Name"
              />

            </div>


            {/* STUDIO NAME */}

            <div className="edit-field">

              <label>
                Studio Name
              </label>

              <input
                type="text"
                value={
                  editMember.studio || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    studio:
                      e.target.value
                  })
                }
                placeholder="Enter Studio Name"
              />

            </div>


            {/* CITY */}

            <div className="edit-field">

              <label>
                City
              </label>

              <input
                type="text"
                value={
                  editMember.city || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    city:
                      e.target.value
                  })
                }
                placeholder="Enter City"
              />

            </div>


            {/* PROFESSION */}

            <div className="edit-field">

              <label>
                Profession
              </label>

              <input
                type="text"
                value={
                  editMember.specialty || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    specialty:
                      e.target.value
                  })
                }
                placeholder="Enter Profession"
              />

            </div>


            {/* EXPERIENCE */}

            <div className="edit-field">

              <label>
                Experience
              </label>

              <input
                type="text"
                value={
                  editMember.experience || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    experience:
                      e.target.value
                  })
                }
                placeholder="Enter Experience"
              />

            </div>


            {/* BLOOD GROUP */}

            <div className="edit-field">

              <label>
                Blood Group
              </label>

              <input
                type="text"
                value={
                  editMember.bloodGroup || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    bloodGroup:
                      e.target.value
                  })
                }
                placeholder="Enter Blood Group"
              />

            </div>


            {/* ADDRESS */}

            <div className="edit-field">

              <label>
                Address
              </label>

              <textarea
                value={
                  editMember.address || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    address:
                      e.target.value
                  })
                }
                placeholder="Enter Address"
              />

            </div>


            {/* CAMERA DETAILS */}

            <div className="edit-field">

              <label>
                Camera Details
              </label>

              <textarea
                value={
                  editMember.cameraDetails || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    cameraDetails:
                      e.target.value
                  })
                }
                placeholder="Enter Camera Details"
              />

            </div>


            {/* MEMBER MESSAGE */}

            <div className="edit-field">

              <label>
                Member Message
              </label>

              <textarea
                value={
                  editMember.message || ""
                }
                onChange={(e) =>
                  setEditMember({
                    ...editMember,
                    message:
                      e.target.value
                  })
                }
                placeholder="Enter Member Message"
              />

            </div>


            {/* ACTION BUTTONS */}

            <div className="edit-actions">

              <button
                type="submit"
              >
                Update Member
              </button>

              <button
                type="button"
                onClick={
                  closeEdit
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