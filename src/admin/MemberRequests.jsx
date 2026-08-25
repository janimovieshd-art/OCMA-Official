import { useEffect, useState } from "react";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  getData,
  addData,
  deleteData
} from "../services/firestoreService";

import { db } from "../firebase/firebase";

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

      console.log(
        "Load Requests Error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadRequests();
  }, []);


  // ==============================
  // GET WEBSITE SHORT NAME
  // ==============================

  const getWebsiteShortName = async () => {
    try {

      const settingsRef = doc(
        db,
        "websiteSettings",
        "main"
      );

      const snap = await getDoc(
        settingsRef
      );

      if (!snap.exists()) {
        return "OCMA";
      }

      const data = snap.data();

      const shortName =
        data?.website?.shortName
          ?.trim()
          .replace(/\s+/g, "-");

      return shortName || "OCMA";

    } catch (error) {

      console.log(
        "Website Settings Error:",
        error
      );

      return "OCMA";

    }
  };


  // ==============================
  // GENERATE MEMBER CODE
  // ==============================

  const generateMemberId = async () => {

    const [
      members,
      shortName
    ] = await Promise.all([
      getData(memberCollection),
      getWebsiteShortName()
    ]);


    // ==============================
    // GET USED NUMBERS
    // ==============================

    const usedNumbers = (members || [])
      .map((member) => {

        if (!member.memberId) {
          return null;
        }

        const match =
          member.memberId.match(
            /-(\d+)$/
          );

        return match
          ? Number(match[1])
          : null;

      })
      .filter(
        (number) =>
          number !== null &&
          !Number.isNaN(number)
      );


    // ==============================
    // FIND FIRST AVAILABLE NUMBER
    // ==============================

    let number = 1111;

    while (
      usedNumbers.includes(number)
    ) {
      number++;
    }


    // ==============================
    // RETURN DYNAMIC CODE
    // ==============================

    return `${shortName}-${number}`;

  };


  // ==============================
  // APPROVE MEMBER
  // ==============================

  const approveMember = async (member) => {

    const confirmApprove =
      window.confirm(
        `Approve ${
          member.name ||
          "this member"
        }?`
      );

    if (!confirmApprove) {
      return;
    }

    try {

      // ==============================
      // GENERATE NEW MEMBER CODE
      // ==============================

      const memberId =
        await generateMemberId();


      // ==============================
      // APPROVAL DATE
      // ==============================

      const approvalDate =
        new Date();


      const joiningDate =
        approvalDate.toISOString();


      // ==============================
      // ADD MEMBER
      // ==============================

      await addData(
        memberCollection,
        {

          // MEMBER CODE

          memberId,


          // MEMBER INFORMATION

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


          // MEMBER IMAGE

          image:
            member.image || "",


          // PORTFOLIO

          portfolio: {
            photos:
              member.portfolio?.photos || [],

            videos:
              member.portfolio?.videos || []
          },


          // CERTIFICATE

          certificate:
            member.certificate || "",


          // STATUS

          status:
            "ACTIVE",


          // JOINING DATE

          joiningDate,


          // CREATED DATE

          createdAt:
            joiningDate

        }
      );


      // ==============================
      // DELETE OLD REQUEST
      // ==============================

      await deleteData(
        requestCollection,
        member.id
      );


      // ==============================
      // SUCCESS
      // ==============================

      alert(
        `Member Approved Successfully!\n\n` +
        `Member Code: ${memberId}\n` +
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

    if (!confirmReject) {
      return;
    }

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

    if (!confirmDelete) {
      return;
    }

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


      {/* MEMBER DETAILS POPUP */}

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