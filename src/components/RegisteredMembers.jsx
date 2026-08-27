
import { useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";

import { getData } from "../services/firestoreService";

import RegisteredMemberCard from "./RegisteredMemberCard";

import "./RegisteredMembers.css";

function RegisteredMembers() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [profession, setProfession] = useState("All");
  const [city, setCity] = useState("All");

  const [sectionTitle, setSectionTitle] = useState(
    "Registered Professional Members"
  );

  const [sectionDescription, setSectionDescription] = useState(
    "Verified photographers, videographers and media professionals."
  );

  const [searchPlaceholder, setSearchPlaceholder] = useState(
    "Search Name, Number, Profession or OCMA ID..."
  );

  const professions = [
    "All",
    "Photographer",
    "Videographer",
    "Cinematographer",
    "Editor",
    "Drone Operator",
    "Female Cameramen",
  ];

  /* =====================================================
     LOAD MEMBERS
  ===================================================== */

  const loadMembers = async () => {
    try {
      const data = await getData("members");

      const activeMembers = data.filter(
        (member) => member.status === "ACTIVE"
      );

      setMembers(activeMembers);
    } catch (error) {
      console.log("Members Load Error:", error);
    }
  };

  /* =====================================================
     LOAD SECTION SETTINGS
  ===================================================== */

  const loadSectionSettings = async () => {
    try {
      const ref = doc(db, "websiteSettings", "main");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        const settings =
          data.homepage?.registeredMembers;

        const shortName =
          data.website?.shortName?.trim() || "OCMA";

        if (settings) {
          setSectionTitle(
            settings.title ||
              "Registered Professional Members"
          );

          setSectionDescription(
            settings.description ||
              `Verified photographers, videographers and media professionals of ${shortName}.`
          );

          setSearchPlaceholder(
            settings.searchPlaceholder ||
              "Search Name, Number, Profession or OCMA ID..."
          );
        } else {
          setSectionDescription(
            `Verified photographers, videographers and media professionals of ${shortName}.`
          );
        }
      }
    } catch (error) {
      console.log(
        "Registered Section Settings Error:",
        error
      );
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadMembers();
    loadSectionSettings();
  }, []);

  /* =====================================================
     CITY COUNTS
  ===================================================== */

  const cityCounts = {};

  members.forEach((member) => {
    const memberCity = member.city?.trim();

    if (!memberCity) return;

    let matchesProfession = true;

    if (profession === "Female Cameramen") {
      matchesProfession =
        member.gender?.toLowerCase() === "female";
    } else if (profession !== "All") {
      matchesProfession =
        member.specialty?.toLowerCase() ===
        profession.toLowerCase();
    }

    if (matchesProfession) {
      cityCounts[memberCity] =
        (cityCounts[memberCity] || 0) + 1;
    }
  });

  const cities = [
    "All",
    ...Object.keys(cityCounts).sort(),
  ];

  /* =====================================================
     FILTER MEMBERS
  ===================================================== */

  const filteredMembers = members.filter((member) => {
    const text = search.trim().toLowerCase();

    const searchMatch =
      !text ||
      member.name?.toLowerCase().includes(text) ||
      member.city?.toLowerCase().includes(text) ||
      member.specialty?.toLowerCase().includes(text) ||
      member.memberId?.toLowerCase().includes(text) ||
      member.phone?.toLowerCase().includes(text) ||
      member.gender?.toLowerCase().includes(text);

    let professionMatch = true;

    if (profession === "Female Cameramen") {
      professionMatch =
        member.gender?.toLowerCase() === "female";
    } else {
      professionMatch =
        profession === "All" ||
        member.specialty?.toLowerCase() ===
          profession.toLowerCase();
    }

    const cityMatch =
      city === "All" ||
      member.city === city;

    return (
      searchMatch &&
      professionMatch &&
      cityMatch
    );
  });

  /* =====================================================
     RESULT CITY COUNT
  ===================================================== */

  const resultCities = new Set(
    filteredMembers
      .map((member) => member.city?.trim())
      .filter(Boolean)
  );

  const resultCityCount = resultCities.size;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="registered-members">

      <div className="registered-header">

        <h2>{sectionTitle}</h2>

        <p>{sectionDescription}</p>


        {/* MAIN SEARCH */}

        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />


        {/* PROFESSION FILTER */}

        <div className="profession-filter">

          {professions.map((item) => (
            <button
              key={item}
              type="button"
              className={
                profession === item
                  ? "active-filter"
                  : ""
              }
              onClick={() => {
                setProfession(item);
                setCity("All");
              }}
            >
              {item}
            </button>
          ))}

        </div>


        {/* CITY FILTER */}

        <select
          className="city-filter"
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
        >

          <option value="All">
            🔍 Search City
          </option>

          {cities
            .filter((item) => item !== "All")
            .map((item) => (
              <option
                key={item}
                value={item}
              >
                📍 {item} — {cityCounts[item]} Members
              </option>
            ))}

        </select>


        {/* RESULT COUNT */}

        <div className="registered-result-count">

          Total{" "}

          <strong>
            {filteredMembers.length}
          </strong>{" "}

          {filteredMembers.length === 1
            ? "Member"
            : "Members"}

          {" "}

          {city !== "All" ? (
            <>
              in{" "}

              <strong>
                {city}
              </strong>{" "}

              City
            </>
          ) : (
            <>
              in{" "}

              <strong>
                {resultCityCount}
              </strong>{" "}

              {resultCityCount === 1
                ? "City"
                : "Cities"}
            </>
          )}

        </div>

      </div>


      {/* MEMBERS */}

      <div className="registered-grid">

        {filteredMembers.map((member) => (
          <RegisteredMemberCard
            key={member.id}
            member={member}
          />
        ))}

      </div>


      {/* NO RESULT */}

      {filteredMembers.length === 0 && (
        <h3 className="no-members">
          No Member Found
        </h3>
      )}

    </section>
  );
}

export default RegisteredMembers;

