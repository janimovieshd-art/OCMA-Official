import { useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";

import "./Training.css";


function Training() {

  // =========================================================
  // ADMIN WHATSAPP NUMBER
  // =========================================================

  const adminWhatsApp = "923126000551";


  // =========================================================
  // DEFAULT TRAINING PROGRAMS
  // =========================================================

  const defaultCourses = [

    {
      title: "Photography Training",

      text:
        "Professional photography techniques, camera settings, lighting, composition and practical shooting skills.",

      price: "10,000 PKR / Week",

      seats: 3
    },


    {
      title: "Video Editing Training",

      text:
        "Learn professional video editing, color grading, transitions, audio editing and complete cinematic workflow.",

      price: "30,000 PKR / 30 Days",

      seats: 5
    },


    {
      title: "Cinematography Training",

      text:
        "Learn camera movements, storytelling, framing, composition and professional filmmaking techniques.",

      price: "10,000 PKR / Week",

      seats: 2
    },


    {
      title: "Graphic Designing Training",

      text:
        "Learn professional graphic design, Photoshop, Illustrator, social media designs, posters and branding.",

      price: "10,000 PKR / Week",

      seats: 4
    },


    {
      title: "Social Media Management",

      text:
        "Learn professional social media management, content planning, page growth, audience engagement and digital marketing.",

      price: "10,000 PKR / Week",

      seats: 3
    },


    {
      title: "Drone Camera Training",

      text:
        "Learn safe drone operation, aerial photography, cinematic drone shots and professional drone videography.",

      price: "10,000 PKR / Week",

      seats: 5
    },


    {
      title: "Digital Marketing Training",

      text:
        "Learn digital marketing basics, online promotion, content strategy, audience targeting and business growth techniques.",

      price: "10,000 PKR / Week",

      seats: 2
    },


    {
      title: "Professional Camera & Lighting",

      text:
        "Learn professional camera operation, exposure, lenses, studio lighting, outdoor lighting and practical setup techniques.",

      price: "10,000 PKR / Week",

      seats: 4
    }

  ];


  // =========================================================
  // STATES
  // =========================================================

  const [courses, setCourses] = useState(
    defaultCourses
  );


  const [sectionTitle, setSectionTitle] = useState(
    "OCMA Training Programs"
  );


  const [sectionDescription, setSectionDescription] =
    useState(
      "Professional training programs for cameramen, photographers and creative professionals to improve their skills and grow professionally."
    );


  const [buttonText, setButtonText] = useState(
    "Join Training"
  );


  // =========================================================
  // LOAD TRAINING SETTINGS FROM FIRESTORE
  // =========================================================

  const loadTrainingSettings = async () => {

    try {

      const ref = doc(
        db,
        "websiteSettings",
        "main"
      );


      const snap = await getDoc(ref);


      if (snap.exists()) {

        const data = snap.data();


        const settings =
          data.homepage?.training;


        if (settings) {

          setSectionTitle(
            settings.title ||
            "OCMA Training Programs"
          );


          setSectionDescription(
            settings.description ||
            "Professional training programs for cameramen, photographers and creative professionals to improve their skills and grow professionally."
          );


          setButtonText(
            settings.buttonText ||
            "Join Training"
          );


          // =================================================
          // FIRESTORE COURSES
          // =================================================

          if (
            Array.isArray(settings.courses) &&
            settings.courses.length > 0
          ) {

            setCourses(
              settings.courses
            );

          }

        }

      }

    }

    catch (error) {

      console.log(
        "Training Settings Error:",
        error
      );

    }

  };


  // =========================================================
  // LOAD SETTINGS
  // =========================================================

  useEffect(() => {

    loadTrainingSettings();

  }, []);


  // =========================================================
  // JOIN TRAINING → WHATSAPP
  // =========================================================

  const joinTraining = (course) => {

    const message =
      `Assalam-o-Alaikum Jani,\n\n` +
      `I want to join an OCMA Training Program.\n\n` +
      `Course: ${course.title}\n` +
      `Fee: ${course.price || "Please confirm fee"}\n` +
      `Available Seats: ${course.seats || "Please confirm"}\n\n` +
      `Please provide complete registration details.`;


    const whatsappURL =
      `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
        message
      )}`;


    window.open(
      whatsappURL,
      "_blank",
      "noopener,noreferrer"
    );

  };


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <section
      className="training-section"
      id="training"
    >


      {/* =====================================================
          SECTION HEADING
      ===================================================== */}

      <div className="training-heading">

        <span className="training-section-label">
          OCMA PROFESSIONAL TRAINING
        </span>


        <h2>
          {sectionTitle}
        </h2>


        <p className="training-intro">
          {sectionDescription}
        </p>

      </div>


      {/* =====================================================
          TRAINING PROGRAM GRID
      ===================================================== */}

      <div className="training-grid">

        {courses.map(
          (course, index) => (

            <article
              className="training-card"
              key={index}
            >


              {/* COURSE ICON */}

              <div className="training-icon">
                🎓
              </div>


              {/* COURSE TITLE */}

              <h3>
                {course.title}
              </h3>


              {/* COURSE DESCRIPTION */}

              <p>
                {course.text}
              </p>


              {/* COURSE DETAILS */}

              <div className="training-details">


                {/* AVAILABLE SEATS */}

                <span className="training-seats">

                  {course.seats || 3}

                  {" "}

                  {Number(course.seats || 3) === 1
                    ? "Seat Available"
                    : "Seats Available"
                  }

                </span>


                {/* COURSE PRICE */}

                <span className="training-price">

                  {course.price ||
                    (
                      course.title
                        ?.toLowerCase()
                        .includes("editing")
                        ? "30,000 PKR / 30 Days"
                        : "10,000 PKR / Week"
                    )
                  }

                </span>

              </div>


              {/* JOIN BUTTON */}

              <button
                type="button"
                className="training-join-button"
                onClick={() =>
                  joinTraining(course)
                }
              >

                {buttonText}

              </button>


            </article>

          )
        )}

      </div>


    </section>

  );

}


export default Training;