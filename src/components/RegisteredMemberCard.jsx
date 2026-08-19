import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import "./RegisteredMemberCard.css";

function RegisteredMemberCard({ member }) {
  const navigate = useNavigate();
  const [ocmaRating, setOcmaRating] = useState(0);
  const [ocmaReviewCount, setOcmaReviewCount] = useState(0);

  useEffect(() => {
    if (!member?.memberId) {
      setOcmaRating(0);
      setOcmaReviewCount(0);
      return;
    }

    const ratingQuery = query(
      collection(db, "member_ratings"),
      where("memberId", "==", member.memberId)
    );

    const unsubscribe = onSnapshot(
      ratingQuery,
      snapshot => {
        const ratings = snapshot.docs.map(doc =>
          Number(doc.data().rating || 0)
        );

        if (!ratings.length) {
          setOcmaRating(0);
          setOcmaReviewCount(0);
          return;
        }

        const average =
          ratings.reduce((sum, rating) => sum + rating, 0) /
          ratings.length;

        setOcmaRating(Number(average.toFixed(1)));
        setOcmaReviewCount(ratings.length);
      },
      error => {
        console.log("Registered Member Card Rating Error:", error);
        setOcmaRating(0);
        setOcmaReviewCount(0);
      }
    );

    return unsubscribe;
  }, [member?.memberId]);

  const whatsappNumber = () => {
    let number = (member.phone || "").replace(/[^0-9]/g, "");

    if (number.startsWith("00")) number = number.substring(2);
    if (number.startsWith("0")) number = "92" + number.substring(1);
    if (!number.startsWith("92") && number) number = "92" + number;

    return number;
  };

  const joiningDate = member.joiningDate
    ? new Date(member.joiningDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "Not Added";

  return (
    <div
      className="office-member-card"
      onClick={() => navigate(`/member/${member.memberId}`)}
    >
      <div className="office-member-left">
        <div className="office-photo">
          <img
            src={member.image || "/assets/ocma-logo.png"}
            alt={member.name || "OCMA Member"}
          />
        </div>

        <div className="registered-badge">
          ✓ Registered Member
        </div>

        <div className="joining-date">
          <span>Joining Date</span>
          <strong>{joiningDate}</strong>
        </div>

        <div className="office-id">
          {member.memberId || "OCMA Member"}
        </div>
      </div>

      <div className="office-info">
        <h3>{member.name || "OCMA Member"}</h3>

        <div className="member-card-rating">
          <div className="member-card-rating-stars">
            {ocmaRating > 0 ? (
              [1, 2, 3, 4, 5].map(star => {
                const fill = Math.max(
                  0,
                  Math.min(1, ocmaRating - star + 1)
                );

                return (
                  <span
                    key={star}
                    className={
                      fill >= 1
                        ? "member-rating-star filled"
                        : fill > 0
                        ? "member-rating-star half"
                        : "member-rating-star empty"
                    }
                  >
                    ★
                  </span>
                );
              })
            ) : (
              <span className="member-rating-no-stars">
                ☆☆☆☆☆
              </span>
            )}
          </div>

          {ocmaRating > 0 ? (
            <>
              <span className="member-card-rating-number">
                {ocmaRating.toFixed(1)}
              </span>

              <span className="member-card-review-count">
                ({ocmaReviewCount}{" "}
                {ocmaReviewCount === 1 ? "Review" : "Reviews"})
              </span>
            </>
          ) : (
            <span className="member-card-no-rating">
              No Rating Yet
            </span>
          )}
        </div>

        <div className="member-detail profession">
          <span className="detail-label">Profession</span>
          <span className="detail-value">
            {member.specialty || "Not Added"}
          </span>
        </div>

        <div className="member-detail">
          <span className="detail-label">Experience</span>
          <span className="detail-value">
            {member.experience || "Not Added"}
          </span>
        </div>

        <div className="member-detail">
          <span className="detail-label">City</span>
          <span className="detail-value">
            📍 {member.city || "Not Added"}
          </span>
        </div>

        <div className="member-card-actions">
          {member.googleAddress && (
            <a
              href={member.googleAddress}
              target="_blank"
              rel="noopener noreferrer"
              className="office-location"
              onClick={e => e.stopPropagation()}
            >
              📍 Google Location
            </a>
          )}

          {member.phone && (
            <a
              href={`https://wa.me/${whatsappNumber()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="office-whatsapp"
              onClick={e => e.stopPropagation()}
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