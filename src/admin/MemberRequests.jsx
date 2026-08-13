import { useEffect, useState } from "react";

import {
  getData,
  addData,
  deleteData
} from "../services/firestoreService";

import "./MemberRequests.css";

function MemberRequests() {
  const requestCollection = "membership_requests";
  const memberCollection = "members";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // ==============================
  // LOAD PENDING REQUESTS
  // ==============================

  const loadRequests = async () => {
    try {
      setLoading(true);

      const data = await getData(requestCollection);

      const pendingRequests = data.filter(
        (member) =>
          !member.status ||
          member.status === "PENDING"
      );

      setRequests(pendingRequests);
    } catch (error) {
      console.log("Load Requests Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ==============================
  // GENERATE OCMA MEMBER ID
  // ==============================

  const generateMemberId = async () => {
    const members = await getData(memberCollection);

    const usedNumbers = members
      .map((member) => {
        if (!member.memberId) return null;

        const number = Number(
          member.memberId.replace("OCMA-", "")
        );

        return Number.isNaN(number)
          ? null
          : number;
      })
      .filter(
        (number) => number !== null
      );

    let number = 1111;

    while (usedNumbers.includes(number)) {
      number++;
    }

    return `OCMA-${number}`;
  };

  // ==============================
  // APPROVE MEMBER
  // ==============================

  const approveMember = async (member) => {
    const confirmApprove = window.confirm(
      `Approve ${member.name || "this member"}?`
    );

    if (!confirmApprove) return;

    try {

      // =========================================
      // GENERATE OCMA MEMBER ID
      // =========================================

      const memberId =
        await generateMemberId();


      // =========================================
      // APPROVAL DATE & TIME
      // =========================================

      const approvalDate =
        new Date();


      // ISO timestamp
      const joiningDate =
        approvalDate.toISOString();


      // =========================================
      // ADD MEMBER TO MEMBERS COLLECTION
      // =========================================

      await addData(
        memberCollection,
        {
          // =====================================
          // OCMA ID
          // =====================================

          memberId,


          // =====================================
          // MEMBER INFORMATION
          // =====================================

          name:
            member.name || "",

          fatherName:
            member.fatherName || "",

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


          // =====================================
          // MEMBER IMAGE
          // =====================================

          image:
            member.image || "",


          // =====================================
          // PORTFOLIO
          // =====================================

          portfolio: {
            photos:
              member.portfolio?.photos || [],

            videos:
              member.portfolio?.videos || []
          },


          // =====================================
          // CERTIFICATE
          // =====================================

          certificate:
            member.certificate || "",


          // =====================================
          // MEMBER STATUS
          // =====================================

          status:
            "ACTIVE",


          // =====================================
          // JOINING DATE
          // =====================================

         joiningDate:
  new Date().toISOString(),

          // =====================================
          // CREATED DATE
          // =====================================

          createdAt:
           new Date().toISOString()
        }
      );


      // =========================================
      // DELETE REQUEST AFTER APPROVAL
      // =========================================

      await deleteData(
        requestCollection,
        member.id
      );


      // =========================================
      // SUCCESS MESSAGE
      // =========================================

      alert(
        `Member Approved Successfully!\n\n` +
        `Member ID: ${memberId}\n` +
        `Joining Date: ${approvalDate.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "long",
            year: "numeric"
          }
        )}`
      );


      setSelectedMember(null);

      loadRequests();

    } catch (error) {

      console.log(
        "Member Approval Error:",
        error
      );

      alert(
        "Approval Failed"
      );

    }
  };

  // ==============================
  // REJECT MEMBER
  // ==============================

  const rejectMember = async (member) => {

    const confirmReject =
      window.confirm(
        `Reject ${
          member.name ||
          "this membership request"
        }?`
      );

    if (!confirmReject) return;

    try {

      await deleteData(
        requestCollection,
        member.id
      );

      setSelectedMember(null);

      alert(
        "Request Rejected"
      );

      loadRequests();

    } catch (error) {

      console.log(
        "Reject Request Error:",
        error
      );

      alert(
        "Request could not be rejected"
      );

    }
  };

  // ==============================
  // DELETE REQUEST
  // ==============================

  const deleteRequest = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this request permanently?"
      );

    if (!confirmDelete) return;

    try {

      await deleteData(
        requestCollection,
        id
      );

      setSelectedMember(null);

      alert(
        "Request Deleted"
      );

      loadRequests();

    } catch (error) {

      console.log(
        "Delete Request Error:",
        error
      );

      alert(
        "Request could not be deleted"
      );

    }
  };

  // ==============================
  // RETURN
  // ==============================

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
            No Pending Requests Found
          </h2>
        )}


      <div className="request-grid">

        {requests.map((member) => (

          <div
            className="request-card"
            key={member.id}
          >

            <img
              src={
                member.image ||
                "/assets/ocma-logo.png"
              }
              alt={
                member.name ||
                "Member"
              }
            />


            <h3>
              {member.name ||
                "No Name"}
            </h3>


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
              <b>Status:</b> PENDING
            </p>


            <button
              onClick={() =>
                setSelectedMember(member)
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


              <button
                className="reject"
                onClick={() =>
                  rejectMember(member)
                }
              >
                Reject
              </button>


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


      {/* ==========================================
          MEMBER DETAILS POPUP
      ========================================== */}

      {selectedMember && (

        <div className="member-popup">

          <div className="popup-box">

            <h2>
              Member Details
            </h2>


            {selectedMember.image && (

              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className="popup-member-image"
              />

            )}


            <p>
              <b>Member Name:</b>{" "}
              {selectedMember.name || "-"}
            </p>


            <p>
              <b>Father Name:</b>{" "}
              {selectedMember.fatherName || "-"}
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


            <div className="popup-actions">

              <button
                onClick={() =>
                  approveMember(
                    selectedMember
                  )
                }
              >
                Approve Member
              </button>


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


              <button
                onClick={() =>
                  setSelectedMember(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}

export default MemberRequests;