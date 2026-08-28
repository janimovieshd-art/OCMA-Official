
import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";
import { getData } from "../services/firestoreService";
import RegisteredMemberCard from "./RegisteredMemberCard";
import "./RegisteredMembers.css";

function RegisteredMembers() {
  const [members, setMembers] = useState([]);
  const [shuffledMembers, setShuffledMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [profession, setProfession] = useState("All");
  const [city, setCity] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const recognitionRef = useRef(null);
  const voiceTimerRef = useRef(null);
  const voiceTextRef = useRef("");
  const membersRef = useRef([]);
  const rotationTimerRef = useRef(null);

  const [autoPageRotation, setAutoPageRotation] = useState(true);

  const membersPerPage = 12;

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
     TEXT NORMALIZATION
  ===================================================== */

  const normalizeText = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  /* =====================================================
     LEVENSHTEIN
  ===================================================== */

  const levenshtein = (a, b) => {
    a = normalizeText(a);
    b = normalizeText(b);

    if (!a) return b.length;
    if (!b) return a.length;

    const matrix = Array.from(
      { length: a.length + 1 },
      () => Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;

        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[a.length][b.length];
  };

  const similarity = (a, b) => {
    a = normalizeText(a);
    b = normalizeText(b);

    if (!a || !b) return 0;
    if (a === b) return 1;

    if (a.includes(b) || b.includes(a)) {
      return 0.95;
    }

    const distance = levenshtein(a, b);
    const length = Math.max(a.length, b.length);

    return length ? 1 - distance / length : 0;
  };

  /* =====================================================
     BEST MATCH
  ===================================================== */

  const findBestMatch = (word, values, threshold = 0.58) => {
    const cleanWord = normalizeText(word);

    if (!cleanWord) return null;

    let bestValue = null;
    let bestScore = 0;

    values.forEach((value) => {
      const score = similarity(cleanWord, value);

      if (score > bestScore) {
        bestScore = score;
        bestValue = value;
      }
    });

    return bestScore >= threshold ? bestValue : null;
  };

  /* =====================================================
     PROFESSION ALIASES
  ===================================================== */

  const professionAliases = {
    Photographer: [
      "photographer",
      "photografer",
      "fotographer",
      "fotografer",
      "photography",
      "photo",
      "photos",
      "photography man",
      "photo man",
      "photo wala",
      "photographer wala",
    ],

    Videographer: [
      "videographer",
      "videografer",
      "videography",
      "video",
      "video man",
      "video wala",
      "videographer wala",
    ],

    Cinematographer: [
      "cinematographer",
      "cinematografer",
      "cinema",
      "cinematography",
      "cinema man",
      "cinema wala",
    ],

    Editor: [
      "editor",
      "editing",
      "video editor",
      "photo editor",
      "edit",
      "editing man",
      "editor wala",
    ],

    "Drone Operator": [
      "drone",
      "dron",
      "drones",
      "operator",
      "pilot",
      "drone operator",
      "dron operator",
      "drone pilot",
      "dron pilot",
      "drone wala",
      "dron wala",
    ],
  };

  /* =====================================================
     FEMALE
  ===================================================== */

  const femaleWords = [
    "female",
    "femal",
    "ladies",
    "lady",
    "ladie",
    "women",
    "woman",
    "girl",
  ];

  const isFemaleWord = (word) => {
    const clean = normalizeText(word);

    return femaleWords.some(
      (item) =>
        clean === item || similarity(clean, item) >= 0.72
    );
  };

  /* =====================================================
     DETECT PROFESSION
  ===================================================== */

  const detectProfession = (text) => {
    const cleanText = normalizeText(text);

    if (!cleanText) return null;

    const dataProfessions = [
      ...new Set(
        membersRef.current
          .map((member) => member.specialty?.trim())
          .filter(Boolean)
      ),
    ];

    let bestDataProfession = null;
    let bestDataScore = 0;

    dataProfessions.forEach((realProfession) => {
      const score = similarity(cleanText, realProfession);

      if (score > bestDataScore) {
        bestDataScore = score;
        bestDataProfession = realProfession;
      }
    });

    if (bestDataScore >= 0.62) {
      return bestDataProfession;
    }

    let bestProfession = null;
    let bestScore = 0;

    Object.entries(professionAliases).forEach(
      ([professionName, aliases]) => {
        aliases.forEach((alias) => {
          const score = similarity(cleanText, alias);

          if (score > bestScore) {
            bestScore = score;
            bestProfession = professionName;
          }
        });
      }
    );

    if (bestScore < 0.55) return null;

    const realProfession = findBestMatch(
      bestProfession,
      dataProfessions,
      0.5
    );

    return realProfession || bestProfession;
  };

  /* =====================================================
     DETECT CITY
  ===================================================== */

  const detectCity = (text) => {
    const cleanText = normalizeText(text);

    if (!cleanText) return null;

    const cityValues = [
      ...new Set(
        membersRef.current
          .map((member) => member.city?.trim())
          .filter(Boolean)
      ),
    ];

    let bestCity = null;
    let bestScore = 0;

    cityValues.forEach((realCity) => {
      const cleanCity = normalizeText(realCity);

      if (cleanText.includes(cleanCity)) {
        if (cleanCity.length > bestScore) {
          bestCity = realCity;
          bestScore = cleanCity.length;
        }
      }

      cleanText.split(" ").forEach((word) => {
        const score = similarity(word, cleanCity);

        if (score >= 0.58 && score > bestScore) {
          bestCity = realCity;
          bestScore = score;
        }
      });
    });

    return bestCity;
  };

  /* =====================================================
     ANALYZE SEARCH
  ===================================================== */

  const analyzeSearch = (input) => {
    const original = normalizeText(input);

    if (!original) {
      return {
        city: null,
        profession: null,
        female: false,
        usefulWords: [],
      };
    }

    const words = original.split(" ");
    const detectedCity = detectCity(original);

    let detectedProfession = null;

    for (let size = 3; size >= 1; size--) {
      for (let i = 0; i <= words.length - size; i++) {
        const phrase = words
          .slice(i, i + size)
          .join(" ");

        const match = detectProfession(phrase);

        if (match) {
          detectedProfession = match;
          break;
        }
      }

      if (detectedProfession) break;
    }

    const female = words.some(isFemaleWord);

    const usefulWords = words.filter((word) => {
      if (
        detectedCity &&
        similarity(word, detectedCity) >= 0.58
      ) {
        return false;
      }

      if (isFemaleWord(word)) {
        return false;
      }

      if (detectedProfession) {
        if (
          similarity(word, detectedProfession) >= 0.55
        ) {
          return false;
        }

        const aliases =
          Object.entries(professionAliases).find(
            ([name]) =>
              normalizeText(name) ===
              normalizeText(detectedProfession)
          )?.[1] || [];

        if (
          aliases.some(
            (alias) =>
              similarity(word, alias) >= 0.65
          )
        ) {
          return false;
        }
      }

      return true;
    });

    return {
      city: detectedCity,
      profession: detectedProfession,
      female,
      usefulWords,
    };
  };

  /* =====================================================
     STOP ROTATION
  ===================================================== */

  const stopAutoRotation = () => {
    clearInterval(rotationTimerRef.current);
    rotationTimerRef.current = null;
    setAutoPageRotation(false);
  };

  /* =====================================================
     SMART SEARCH
  ===================================================== */

  const processSmartSearch = (input) => {
    const original = normalizeText(input);

    stopAutoRotation();

    if (!original) {
      setSearch("");
      setProfession("All");
      setCity("All");
      setCurrentPage(1);
      setAutoPageRotation(true);
      return;
    }

    const result = analyzeSearch(original);

    setCity(result.city || "All");

    if (result.profession) {
      setProfession(result.profession);
    } else if (result.female) {
      setProfession("Female Cameramen");
    } else {
      setProfession("All");
    }

    setSearch(result.usefulWords.join(" "));
    setCurrentPage(1);
  };

  /* =====================================================
     LOAD MEMBERS
  ===================================================== */

  const loadMembers = async () => {
    try {
      const data = await getData("members");

      const activeMembers = data.filter(
        (member) => member.status === "ACTIVE"
      );

      membersRef.current = activeMembers;

      setMembers(activeMembers);

      // Original order becomes the permanent starting order.
      setShuffledMembers([...activeMembers]);
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

      if (!snap.exists()) return;

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
    } catch (error) {
      console.log(
        "Registered Section Settings Error:",
        error
      );
    }
  };

  /* =====================================================
     VOICE SEARCH
  ===================================================== */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      voiceTextRef.current = "";
    };

    recognition.onresult = (event) => {
      let newText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        newText +=
          event.results[i][0].transcript + " ";
      }

      newText = normalizeText(newText);

      if (!newText) return;

      voiceTextRef.current = newText;
      setSearch(newText);

      clearTimeout(voiceTimerRef.current);

      voiceTimerRef.current = setTimeout(() => {
        const finalText = voiceTextRef.current;

        if (finalText) {
          processSmartSearch(finalText);
        }

        try {
          recognition.stop();
        } catch {}
      }, 2000);
    };

    recognition.onerror = (event) => {
      console.log(
        "Voice Search Error:",
        event.error
      );

      clearTimeout(voiceTimerRef.current);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimeout(voiceTimerRef.current);

      try {
        recognition.stop();
      } catch {}

      recognitionRef.current = null;
    };
  }, [members]);

  /* =====================================================
     START / STOP VOICE
  ===================================================== */

  const startVoiceSearch = () => {
    if (
      !voiceSupported ||
      !recognitionRef.current
    ) {
      return;
    }

    stopAutoRotation();

    if (isListening) {
      clearTimeout(voiceTimerRef.current);

      const finalText = voiceTextRef.current;

      if (finalText) {
        processSmartSearch(finalText);
      }

      try {
        recognitionRef.current.stop();
      } catch {}

      setIsListening(false);
      return;
    }

    try {
      clearTimeout(voiceTimerRef.current);

      voiceTextRef.current = "";

      recognitionRef.current.lang = "en-US";
      recognitionRef.current.start();
    } catch (error) {
      console.log(
        "Voice Start Error:",
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
        normalizeText(member.gender) === "female";
    } else if (profession !== "All") {
      matchesProfession =
        normalizeText(member.specialty) ===
        normalizeText(profession);
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
     SMART MANUAL SEARCH
  ===================================================== */

  const smartTextMatch = (member, text) => {
    if (!text) return true;

    const memberText = [
      member.name,
      member.city,
      member.specialty,
      member.memberId,
      member.phone,
      member.gender,
    ]
      .filter(Boolean)
      .map(normalizeText)
      .join(" ");

    const memberWords = memberText.split(" ");
    const searchWords =
      normalizeText(text).split(" ");

    return searchWords.every((word) => {
      if (memberText.includes(word)) {
        return true;
      }

      return memberWords.some(
        (memberWord) =>
          similarity(word, memberWord) >= 0.62
      );
    });
  };

  /* =====================================================
     SEARCH ANALYSIS
  ===================================================== */

  const searchAnalysis = analyzeSearch(search);

  /* =====================================================
     FILTER MEMBERS
  ===================================================== */

  const filteredMembers = shuffledMembers.filter(
    (member) => {
      const detectedCity = searchAnalysis.city;

      const detectedProfession =
        searchAnalysis.profession;

      const femaleSearch =
        searchAnalysis.female;

      const femaleMatch =
        !femaleSearch ||
        normalizeText(member.gender) === "female";

      let professionMatch = true;

      if (detectedProfession) {
        professionMatch =
          normalizeText(member.specialty) ===
          normalizeText(detectedProfession);
      } else if (
        profession === "Female Cameramen"
      ) {
        professionMatch =
          normalizeText(member.gender) === "female";
      } else if (profession !== "All") {
        professionMatch =
          normalizeText(member.specialty) ===
          normalizeText(profession);
      }

      let cityMatch = true;

      if (detectedCity) {
        cityMatch =
          normalizeText(member.city) ===
          normalizeText(detectedCity);
      } else if (city !== "All") {
        cityMatch =
          normalizeText(member.city) ===
          normalizeText(city);
      }

      const usefulSearch =
        searchAnalysis.usefulWords.join(" ");

      const searchMatch = smartTextMatch(
        member,
        usefulSearch
      );

      return (
        searchMatch &&
        femaleMatch &&
        professionMatch &&
        cityMatch
      );
    }
  );

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
     PAGINATION
  ===================================================== */

  const totalPages = Math.ceil(
    filteredMembers.length / membersPerPage
  );

  const getPageData = (pageNumber) => {
    const start =
      (pageNumber - 1) * membersPerPage;

    return filteredMembers.slice(
      start,
      start + membersPerPage
    );
  };

  const paginatedMembers =
    getPageData(currentPage);

  /* =====================================================
     ALL MODE
  ===================================================== */

  const isAllMode =
    profession === "All" &&
    city === "All" &&
    !normalizeText(search);

  /* =====================================================
     REAL CARD ROTATION

     Page 1:
     [1] [2] [3] = FIXED

     [4] [5] [6] [7] [8] [9] [10] [11] [12]
     = ROTATABLE

     Every 5 seconds one Page-1 rotatable
     position exchanges with a card from
     another page.

     This is a REAL SWAP:
     No duplicate.
     No card disappears.
     No page is artificially replaced.

     Example:

     Before:
     Page 1: A B C D E F G H I J K L
     Page 2: M N O P Q R S T U V W X

     Swap D <-> O

     After:
     Page 1: A B C O E F G H I J K L
     Page 2: M N D P Q R S T U V W X
  ===================================================== */

  useEffect(() => {
    clearInterval(rotationTimerRef.current);
    rotationTimerRef.current = null;

    if (
      !autoPageRotation ||
      currentPage !== 1 ||
      !isAllMode ||
      shuffledMembers.length <= membersPerPage
    ) {
      return;
    }

    rotationTimerRef.current = setInterval(() => {
      setShuffledMembers((current) => {
        if (current.length <= membersPerPage) {
          return current;
        }

        const next = [...current];

        /*
          First 3 positions are NEVER touched.

          Rotatable Page 1 positions:
          index 3 to 11
        */

        const firstRotatableIndex = 3;
        const lastPageOneIndex =
          membersPerPage - 1;

        const pageOneIndex =
          firstRotatableIndex +
          Math.floor(
            Math.random() *
              (lastPageOneIndex -
                firstRotatableIndex +
                1)
          );

        /*
          Pick any position from Page 2 onward.
        */

        const outsideIndex =
          membersPerPage +
          Math.floor(
            Math.random() *
              (next.length - membersPerPage)
          );

        /*
          Real position exchange.
        */

        [
          next[pageOneIndex],
          next[outsideIndex],
        ] = [
          next[outsideIndex],
          next[pageOneIndex],
        ];

        return next;
      });
    }, 5000);

    return () => {
      clearInterval(rotationTimerRef.current);
    };
  }, [
    autoPageRotation,
    currentPage,
    isAllMode,
    shuffledMembers.length,
  ]);

  /* =====================================================
     RESET AFTER FILTER / SEARCH

     IMPORTANT:
     Does NOT reset shuffledMembers.

     Therefore when user returns to All,
     the current card arrangement remains.
  ===================================================== */

  useEffect(() => {
    setCurrentPage(1);

    if (isAllMode) {
      setAutoPageRotation(true);
    } else {
      setAutoPageRotation(false);
    }
  }, [
    search,
    profession,
    city,
  ]);

  /* =====================================================
     KEEP PAGE VALID
  ===================================================== */

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* =====================================================
     PAGE NUMBERS
  ===================================================== */

  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  /* =====================================================
     RESET ALL

     Only filters reset.
     Shuffled member order stays exactly where
     it currently is.
  ===================================================== */

  const resetAllFilters = () => {
    clearTimeout(voiceTimerRef.current);
    clearInterval(rotationTimerRef.current);

    rotationTimerRef.current = null;
    voiceTextRef.current = "";

    setSearch("");
    setProfession("All");
    setCity("All");
    setCurrentPage(1);

    /*
      IMPORTANT:
      shuffledMembers ko reset nahi karna.
    */

    setAutoPageRotation(true);
  };

  /* =====================================================
     MANUAL PAGE CHANGE

     Rotation stops.

     Current shuffled arrangement remains.
  ===================================================== */

  const changePageManually = (page) => {
    clearInterval(rotationTimerRef.current);

    rotationTimerRef.current = null;

    setAutoPageRotation(false);
    setCurrentPage(page);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="registered-members">
      <div className="registered-header">
        <h2>{sectionTitle}</h2>

        <p>{sectionDescription}</p>

        {/* SEARCH */}
        <div
          className={`registered-search ${
            isListening ? "voice-active" : ""
          }`}
        >
          <input
            type="text"
            placeholder={
              isListening
                ? "Listening..."
                : searchPlaceholder
            }
            value={search}
            onChange={(e) => {
              const value = e.target.value;

              stopAutoRotation();

              setSearch(value);
              setCurrentPage(1);
            }}
          />

          {voiceSupported && (
            <button
              type="button"
              className={`voice-search-btn ${
                isListening ? "listening" : ""
              }`}
              onClick={startVoiceSearch}
              aria-label={
                isListening
                  ? "Stop voice search"
                  : "Start voice search"
              }
              title={
                isListening
                  ? "Listening..."
                  : "Search by voice"
              }
            >
              {isListening ? (
                <span className="voice-bars">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </span>
              ) : (
                "🎤"
              )}
            </button>
          )}
        </div>

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
                if (item === "All") {
                  resetAllFilters();
                  return;
                }

                stopAutoRotation();

                setProfession(item);
                setCurrentPage(1);
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
          onChange={(e) => {
            const value = e.target.value;

            if (value === "All") {
              setCity("All");
              setCurrentPage(1);

              if (!normalizeText(search)) {
                setAutoPageRotation(true);
              }

              return;
            }

            stopAutoRotation();

            setCity(value);
            setCurrentPage(1);
          }}
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
            : "Members"}{" "}
          {city !== "All" ? (
            <>
              in <strong>{city}</strong> City
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
        {paginatedMembers.map((member) => (
          <RegisteredMemberCard
            key={member.id}
            member={member}
          />
        ))}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="members-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => {
                clearInterval(
                  rotationTimerRef.current
                );

                rotationTimerRef.current = null;

                setAutoPageRotation(false);

                setCurrentPage((page) =>
                  Math.max(page - 1, 1)
                );
              }}
            >
              Previous
            </button>

            <div className="pagination-numbers">
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  className={
                    currentPage === page
                      ? "active-page"
                      : ""
                  }
                  onClick={() =>
                    changePageManually(page)
                  }
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={
                currentPage === totalPages
              }
              onClick={() => {
                clearInterval(
                  rotationTimerRef.current
                );

                rotationTimerRef.current = null;

                setAutoPageRotation(false);

                setCurrentPage((page) =>
                  Math.min(
                    page + 1,
                    totalPages
                  )
                );
              }}
            >
              Next
            </button>
          </div>
        )}
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

