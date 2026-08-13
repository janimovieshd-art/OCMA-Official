import { useNavigate } from "react-router-dom";

import "./RegisteredMemberCard.css";

function RegisteredMemberCard({ member }) {
  const navigate = useNavigate();

  // ==============================
  // WHATSAPP NUMBER
  // ==============================

  const whatsappNumber = () => {
    let number = member.phone || "";

    number = number.replace(/[^0-9]/g, "");

    if (number.startsWith("00")) {
      number = number.substring(2);
    }

    if (number.startsWith("0")) {
      number = "92" + number.substring(1);
    }

    if (!number.startsWith("92") && number.length > 0) {
      number = "92" + number;
    }

    return number;
  };

  // ==============================
  // JOINING DATE
  // ==============================

  const joiningDate = member.joiningDate
    ? new Date(member.joiningDate).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Not Added";

  return (
    <div
      className="office-member-card"
      onClick={() =>
        navigate(`/member/${member.memberId}`)
      }
    >

      {/* =========================================
          LEFT SIDE
      ========================================= */}

      <div className="office-member-left">

        <div className="office-photo">

          <img
            src={
              member.image ||
              "/assets/ocma-logo.png"
            }
            alt={member.name || "OCMA Member"}
          />

        </div>

        <div className="registered-badge">
          ✓ Registered Member
        </div>

        <div className="joining-date">

          <span>
            Joining Date
          </span>

          <strong>
            {joiningDate}
          </strong>

        </div>

        <div className="office-id">
          {member.memberId || "OCMA Member"}
        </div>

      </div>


      {/* =========================================
          RIGHT SIDE
      ========================================= */}

      <div className="office-info">

        {/* NAME */}

        <h3>
          {member.name || "OCMA Member"}
        </h3>


        {/* PROFESSION */}

        <div className="member-detail profession">

          <span className="detail-label">
            Profession
          </span>

          <span className="detail-value">
            {member.specialty || "Not Added"}
          </span>

        </div>


        {/* EXPERIENCE */}

        <div className="member-detail">

          <span className="detail-label">
            Experience
          </span>

          <span className="detail-value">
            {member.experience || "Not Added"}
          </span>

        </div>


        {/* CITY */}

        <div className="member-detail">

          <span className="detail-label">
            City
          </span>

          <span className="detail-value">
            📍 {member.city || "Not Added"}
          </span>

        </div>


        {/* =====================================
            BUTTONS
        ===================================== */}

        <div className="member-card-actions">

          {/* GOOGLE LOCATION */}

          {member.googleAddress && (
            <a
              href={member.googleAddress}
              target="_blank"
              rel="noopener noreferrer"
              className="office-location"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              📍 Google Location
            </a>
          )}


          {/* WHATSAPP */}

          {member.phone && (
            <a
              href={`https://wa.me/${whatsappNumber()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="office-whatsapp"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              WhatsApp
            </a>
          )}

        </div>

      </div>

    </div>
  );
}

export default RegisteredMemberCard;