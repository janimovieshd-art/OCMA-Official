import { useState } from "react";

import "./AuthorityCard.css";

function AuthorityCard({ member }) {
  const [open, setOpen] = useState(false);

  const whatsappNumber = member.phone
    ?.replace(/\D/g, "")
    .replace(/^0/, "92");

  const image =
    member.image || "/assets/ocma-logo.png";

  return (
    <>
      <div className="public-authority-card">

        <div className="public-authority-preview">
          <img
            src={image}
            alt={member.name || "Authority Member"}
          />
        </div>

        <h3 className="public-authority-name">
          {member.name || "Authority Member"}
        </h3>

        <p className="public-authority-designation">
          {member.designation || "Authority Member"}
        </p>

        <div className="public-authority-buttons">

          <button
            type="button"
            className="public-authority-view-btn"
            onClick={() => setOpen(true)}
          >
            View Image
          </button>

          {member.phone && (
            <a
              className="public-authority-whatsapp-btn"
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          )}

        </div>

      </div>

      {open && (
        <div
          className="public-authority-modal"
          onClick={() => setOpen(false)}
        >
          <div
            className="public-authority-modal-box"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="public-authority-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close image"
            >
              ✕
            </button>

            <img
              src={image}
              alt={member.name || "Authority Member"}
            />

          </div>
        </div>
      )}
    </>
  );
}

export default AuthorityCard;