import cabinet from "../data/cabinet";
import MemberCard from "./MemberCard";
import "./Cabinet.css";

function Cabinet() {

  return (

    <section className="cabinet-section">

      <h2>OCMA Cabinet 2026-2028</h2>

      <div className="cabinet-grid">

        {cabinet.map((member) => (

          <MemberCard
            key={member.id}
            member={member}
          />

        ))}

      </div>

    </section>

  );
}

export default Cabinet;