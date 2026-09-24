import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc
} from "firebase/firestore";

import {
  getData,
  deleteData,
  updateData
} from "../../services/firestoreService";

import {
  uploadImage,
  uploadImages
} from "../../services/cloudinary";

import { db } from "../../firebase/firebase";

import "./Members.css";

function Members() {
  const collectionName = "members";

  const [members, setMembers] = useState([]);
  const [editMember, setEditMember] = useState(null);
  const [search, setSearch] = useState("");
  const [openStat, setOpenStat] = useState(null);

  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState("");

  const [newPortfolioPhotos, setNewPortfolioPhotos] = useState([]);
  const [newPortfolioPreview, setNewPortfolioPreview] = useState([]);

  const [saving, setSaving] = useState(false);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfMemberId, setPdfMemberId] = useState(null);

  const [websiteName, setWebsiteName] = useState("OCMA");

  const statRef = useRef(null);

  // =====================================================
  // LOAD WEBSITE NAME
  // =====================================================

  const loadWebsiteName = async () => {
    try {
      const settingsRef = doc(
        db,
        "websiteSettings",
        "main"
      );

      const settingsSnap = await getDoc(
        settingsRef
      );

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();

        const name =
          data?.navbar?.name?.trim() ||
          data?.website?.siteName?.trim() ||
          data?.website?.shortName?.trim() ||
          "OCMA";

        setWebsiteName(
          String(name).trim() || "OCMA"
        );
      } else {
        setWebsiteName("OCMA");
      }
    } catch (error) {
      console.log(
        "Website Settings Error:",
        error
      );

      setWebsiteName("OCMA");
    }
  };

  // =====================================================
  // LOAD MEMBERS
  // =====================================================

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
        const matchA =
          a.memberId?.match(/-(\d+)$/);

        const matchB =
          b.memberId?.match(/-(\d+)$/);

        const numA =
          matchA
            ? Number(matchA[1])
            : 999999;

        const numB =
          matchB
            ? Number(matchB[1])
            : 999999;

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

  useEffect(() => {
    loadMembers();
    loadWebsiteName();
  }, []);

  // =====================================================
  // CLOSE DROPDOWN
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        statRef.current &&
        !statRef.current.contains(e.target)
      ) {
        setOpenStat(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalMembers =
    members.length;

  const cityCounts = {};

  members.forEach((member) => {
    const city =
      member.city?.trim();

    if (!city) return;

    cityCounts[city] =
      (cityCounts[city] || 0) + 1;
  });

  const totalCities =
    Object.keys(cityCounts).length;

  const professionCounts = {};

  members.forEach((member) => {
    const profession =
      member.specialty?.trim();

    if (!profession) return;

    professionCounts[profession] =
      (professionCounts[profession] || 0) + 1;
  });

  const totalProfessions =
    Object.keys(
      professionCounts
    ).length;

  const totalMale =
    members.filter(
      (member) =>
        member.gender?.toLowerCase() ===
        "male"
    ).length;

  const totalFemale =
    members.filter(
      (member) =>
        member.gender?.toLowerCase() ===
        "female"
    ).length;

  const sortedCities =
    Object.entries(cityCounts).sort(
      (a, b) =>
        a[0].localeCompare(b[0])
    );

  const sortedProfessions =
    Object.entries(
      professionCounts
    ).sort(
      (a, b) =>
        a[0].localeCompare(b[0])
    );

  // =====================================================
  // DELETE RATINGS
  // =====================================================

  const deleteMemberRatings =
    async (memberId) => {
      if (!memberId) return;

      const ratingCollections = [
        "ratings",
        "member_ratings"
      ];

      for (
        const ratingCollection
        of ratingCollections
      ) {
        const ratingsRef =
          collection(
            db,
            ratingCollection
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
                  ratingCollection,
                  ratingDoc.id
                )
              )
          )
        );
      }
    };

  // =====================================================
  // DELETE MEMBER
  // =====================================================

  const handleDelete =
    async (
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
        await deleteMemberRatings(
          memberId
        );

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

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const handleEdit =
    (member) => {
      setEditMember({
        ...member,

        portfolio: {
          photos:
            member.portfolio?.photos
              ? [
                  ...member.portfolio.photos
                ]
              : [],

          videos:
            member.portfolio?.videos
              ? member.portfolio.videos.map(
                  (video) => ({
                    ...video
                  })
                )
              : []
        }
      });

      setEditPhoto(null);
      setEditPhotoPreview("");
      setNewPortfolioPhotos([]);
      setNewPortfolioPreview([]);
    };

  // =====================================================
  // PROFILE PHOTO
  // =====================================================

  const handleEditProfilePhoto =
    (e) => {
      const file =
        e.target.files[0];

      if (!file) return;

      if (
        !file.type.startsWith("image/")
      ) {
        alert(
          "صرف تصویر فائل منتخب کریں۔"
        );
        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        alert(
          "تصویر 5MB سے زیادہ نہیں ہونی چاہیے۔"
        );
        return;
      }

      setEditPhoto(file);

      setEditPhotoPreview(
        URL.createObjectURL(file)
      );
    };

  // =====================================================
  // EDIT FIELD
  // =====================================================

  const handleEditChange =
    (e) => {
      const {
        name,
        value
      } = e.target;

      setEditMember(
        (prev) => ({
          ...prev,
          [name]: value
        })
      );
    };

  // =====================================================
  // DELETE EXISTING PHOTO
  // =====================================================

  const deleteExistingPhoto =
    (index) => {
      const photos = [
        ...(editMember.portfolio?.photos || [])
      ];

      photos.splice(index, 1);

      setEditMember(
        (prev) => ({
          ...prev,

          portfolio: {
            ...(prev.portfolio || {}),
            photos
          }
        })
      );
    };

  // =====================================================
  // NEW PORTFOLIO PHOTOS
  // =====================================================

  const handleNewPortfolioPhotos =
    (e) => {
      const files =
        Array.from(
          e.target.files || []
        );

      const existingCount =
        editMember?.portfolio?.photos?.length ||
        0;

      const newCount =
        newPortfolioPhotos.length;

      const available =
        10 -
        existingCount -
        newCount;

      if (available <= 0) {
        alert(
          "زیادہ سے زیادہ 10 Portfolio Photos رکھی جا سکتی ہیں۔"
        );
        return;
      }

      const selected =
        files.slice(
          0,
          available
        );

      const validFiles = [];
      const validPreviews = [];

      selected.forEach(
        (file) => {
          if (
            !file.type.startsWith(
              "image/"
            )
          ) {
            return;
          }

          if (
            file.size >
            5 * 1024 * 1024
          ) {
            return;
          }

          validFiles.push(file);

          validPreviews.push(
            URL.createObjectURL(file)
          );
        }
      );

      setNewPortfolioPhotos(
        (prev) => [
          ...prev,
          ...validFiles
        ]
      );

      setNewPortfolioPreview(
        (prev) => [
          ...prev,
          ...validPreviews
        ]
      );

      e.target.value = "";
    };

  // =====================================================
  // DELETE NEW PHOTO
  // =====================================================

  const deleteNewPortfolioPhoto =
    (index) => {
      const files = [
        ...newPortfolioPhotos
      ];

      const previews = [
        ...newPortfolioPreview
      ];

      files.splice(index, 1);
      previews.splice(index, 1);

      setNewPortfolioPhotos(files);
      setNewPortfolioPreview(previews);
    };

  // =====================================================
  // VIDEO EMBED
  // =====================================================

  const getEmbedUrl =
    (url) => {
      if (!url) return "";

      try {
        if (
          url.includes(
            "youtube.com/watch"
          )
        ) {
          const id =
            new URL(url)
              .searchParams
              .get("v");

          if (id) {
            return `https://www.youtube.com/embed/${id}`;
          }
        }

        if (
          url.includes("youtu.be")
        ) {
          const id =
            url
              .split("/")
              .pop()
              .split("?")[0];

          if (id) {
            return `https://www.youtube.com/embed/${id}`;
          }
        }

        if (
          url.includes(
            "youtube.com/shorts/"
          )
        ) {
          const id =
            url
              .split("/shorts/")[1]
              .split("?")[0];

          if (id) {
            return `https://www.youtube.com/embed/${id}`;
          }
        }

        if (
          url.includes("vimeo.com")
        ) {
          const id =
            url
              .split("/")
              .pop()
              .split("?")[0];

          if (id) {
            return `https://player.vimeo.com/video/${id}`;
          }
        }

        if (
          url.includes("facebook.com")
        ) {
          return (
            `https://www.facebook.com/plugins/video.php?href=` +
            `${encodeURIComponent(url)}` +
            `&show_text=false`
          );
        }
      } catch (error) {
        return "";
      }

      return "";
    };

  // =====================================================
  // VIDEO CHANGE
  // =====================================================

  const handleVideoChange =
    (index, value) => {
      const videos = [
        ...(editMember.portfolio?.videos || [])
      ];

      videos[index] = {
        url: value,
        embed: getEmbedUrl(value)
      };

      setEditMember(
        (prev) => ({
          ...prev,

          portfolio: {
            ...(prev.portfolio || {}),
            videos
          }
        })
      );
    };

  // =====================================================
  // ADD VIDEO
  // =====================================================

  const addVideo = () => {
    const videos = [
      ...(editMember.portfolio?.videos || [])
    ];

    if (videos.length >= 5) {
      alert(
        "زیادہ سے زیادہ 5 Video Links رکھی جا سکتی ہیں۔"
      );
      return;
    }

    videos.push({
      url: "",
      embed: ""
    });

    setEditMember(
      (prev) => ({
        ...prev,

        portfolio: {
          ...(prev.portfolio || {}),
          videos
        }
      })
    );
  };

  // =====================================================
  // DELETE VIDEO
  // =====================================================

  const deleteVideo =
    (index) => {
      const videos = [
        ...(editMember.portfolio?.videos || [])
      ];

      videos.splice(index, 1);

      setEditMember(
        (prev) => ({
          ...prev,

          portfolio: {
            ...(prev.portfolio || {}),
            videos
          }
        })
      );
    };

  // =====================================================
  // PDF HELPERS
  // =====================================================

  const pdfSafe =
    (value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      return String(value).trim();
    };

  const pdfDate =
    (value) => {
      if (!value) return "";

      try {
        const date =
          new Date(value);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return pdfSafe(value);
        }

        return date.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }
        );
      } catch {
        return pdfSafe(value);
      }
    };

  // =====================================================
  // MAP URL
  // =====================================================

  const getMapUrl =
    (member) => {
      const value =
        pdfSafe(
          member?.googleAddress
        );

      if (!value) {
        return "";
      }

      if (
        value.startsWith("http://") ||
        value.startsWith("https://")
      ) {
        return value;
      }

      return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(value)
      );
    };

  // =====================================================
  // MEMBER PROFILE / PORTFOLIO URL
  // =====================================================

  const getMemberProfileUrl =
    (member) => {
      if (!member?.memberId) {
        return "";
      }

      return (
        `${window.location.origin}/member/${encodeURIComponent(
          member.memberId
        )}`
      );
    };

  // =====================================================
  // CREATE QR
  // =====================================================

  const createQr =
    async (url) => {
      if (!url) {
        return "";
      }

      const container =
        document.createElement(
          "div"
        );

      container.style.position =
        "fixed";

      container.style.left =
        "-10000px";

      container.style.top =
        "-10000px";

      container.style.width =
        "220px";

      container.style.height =
        "220px";

      container.style.background =
        "#ffffff";

      document.body.appendChild(
        container
      );

      const root =
        createRoot(container);

      return new Promise(
        (resolve) => {
          root.render(
            <QRCodeCanvas
              value={url}
              size={200}
              level="M"
              includeMargin={true}
            />
          );

          setTimeout(() => {
            try {
              const canvas =
                container.querySelector(
                  "canvas"
                );

              if (!canvas) {
                root.unmount();
                container.remove();
                resolve("");
                return;
              }

              const dataUrl =
                canvas.toDataURL(
                  "image/png"
                );

              root.unmount();
              container.remove();

              resolve(dataUrl);
            } catch {
              root.unmount();
              container.remove();
              resolve("");
            }
          }, 100);
        }
      );
    };

  // =====================================================
  // LOAD IMAGE FOR PDF
  // =====================================================

  const loadImageForPdf =
    async (url) => {
      if (!url) return "";

      return new Promise(
        (resolve) => {
          const img =
            new Image();

          img.crossOrigin =
            "anonymous";

          img.onload = () => {
            try {
              const canvas =
                document.createElement(
                  "canvas"
                );

              canvas.width =
                img.naturalWidth ||
                600;

              canvas.height =
                img.naturalHeight ||
                600;

              const ctx =
                canvas.getContext(
                  "2d"
                );

              ctx.drawImage(
                img,
                0,
                0
              );

              resolve(
                canvas.toDataURL(
                  "image/jpeg",
                  0.88
                )
              );
            } catch {
              resolve("");
            }
          };

          img.onerror = () => {
            resolve("");
          };

          img.src = url;
        }
      );
    };

  // =====================================================
  // PDF TEXT FIELD
  // =====================================================

  const pdfField =
    (
      pdf,
      label,
      value,
      x,
      y,
      width
    ) => {
      const cleanValue =
        pdfSafe(value) || "—";

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(7.5);

      pdf.setTextColor(
        100,
        100,
        100
      );

      pdf.text(
        `${label}:`,
        x,
        y
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8.7);

      pdf.setTextColor(
        30,
        30,
        30
      );

      const lines =
        pdf.splitTextToSize(
          cleanValue,
          width
        );

      pdf.text(
        lines,
        x,
        y + 4.5
      );

      return Math.max(
        10,
        lines.length * 4 + 7
      );
    };

  // =====================================================
  // DRAW MEMBER PDF PAGE
  // =====================================================

  const drawMemberPdf =
    async (
      pdf,
      member
    ) => {
      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 13;

      const contentWidth =
        pageWidth -
        margin * 2;

      const gold = [
        170,
        125,
        35
      ];

      const dark = [
        35,
        35,
        35
      ];

      const light = [
        246,
        246,
        246
      ];

      const border = [
        220,
        220,
        220
      ];

      let y = 0;

      // =================================================
      // TOP HEADER
      // =================================================

      pdf.setFillColor(
        ...dark
      );

      pdf.rect(
        0,
        0,
        pageWidth,
        36,
        "F"
      );

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(17);

      pdf.text(
        websiteName || "OCMA",
        margin,
        12
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7.5);

      pdf.text(
        "Professional Cameramen & Media Professionals",
        margin,
        18
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
        230,
        190,
        90
      );

      pdf.text(
        "REGISTERED MEMBER",
        pageWidth - margin,
        11,
        {
          align: "right"
        }
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7);

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.text(
        "Official Member Record & Profile Sheet",
        pageWidth - margin,
        17,
        {
          align: "right"
        }
      );

      y = 43;

      // =================================================
      // MEMBER ID / NAME AREA
      // =================================================

      pdf.setFillColor(
        ...light
      );

      pdf.setDrawColor(
        ...border
      );

      pdf.roundedRect(
        margin,
        y,
        contentWidth,
        39,
        2.5,
        2.5,
        "FD"
      );

      // PROFILE PHOTO

      const photoUrl =
        pdfSafe(member.image);

      if (photoUrl) {
        const photoData =
          await loadImageForPdf(
            photoUrl
          );

        if (photoData) {
          pdf.addImage(
            photoData,
            "JPEG",
            margin + 4,
            y + 4,
            31,
            31
          );
        }
      }

      const nameX =
        margin + 40;

      pdf.setTextColor(
        ...dark
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(16);

      pdf.text(
        pdfSafe(member.name) ||
          "Member",
        nameX,
        y + 11
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(8.5);

      pdf.setTextColor(
        ...gold
      );

      pdf.text(
        "REGISTERED MEMBER",
        nameX,
        y + 18
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
        85,
        85,
        85
      );

      pdf.text(
        pdfSafe(
          member.specialty
        ) ||
          "Professional Member",
        nameX,
        y + 24
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
        ...dark
      );

      pdf.text(
        `Member ID: ${
          pdfSafe(member.memberId) ||
          "—"
        }`,
        nameX,
        y + 31
      );

      y += 46;

      // =================================================
      // PERSONAL INFORMATION
      // =================================================

      const section =
        (title) => {
          pdf.setFillColor(
            ...gold
          );

          pdf.roundedRect(
            margin,
            y,
            contentWidth,
            7,
            1,
            1,
            "F"
          );

          pdf.setTextColor(
            255,
            255,
            255
          );

          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(8);

          pdf.text(
            title.toUpperCase(),
            margin + 4,
            y + 4.8
          );

          y += 11;
        };

      section(
        "Personal Information"
      );

      let rowHeight =
        Math.max(
          pdfField(
            pdf,
            "Name",
            member.name,
            margin,
            y,
            78
          ),

          pdfField(
            pdf,
            "Father Name",
            member.fatherName,
            margin + 91,
            y,
            78
          )
        );

      y += rowHeight;

      rowHeight =
        Math.max(
          pdfField(
            pdf,
            "Gender",
            member.gender,
            margin,
            y,
            78
          ),

          pdfField(
            pdf,
            "Blood Group",
            member.bloodGroup,
            margin + 91,
            y,
            78
          )
        );

      y += rowHeight;

      rowHeight =
        Math.max(
          pdfField(
            pdf,
            "Experience",
            member.experience,
            margin,
            y,
            78
          ),

          pdfField(
            pdf,
            "Joining Date",
            pdfDate(
              member.joiningDate
            ),
            margin + 91,
            y,
            78
          )
        );

      y += rowHeight + 2;

      // =================================================
      // PROFESSIONAL INFORMATION
      // =================================================

      section(
        "Professional Information"
      );

      rowHeight =
        Math.max(
          pdfField(
            pdf,
            "Profession",
            member.specialty,
            margin,
            y,
            78
          ),

          pdfField(
            pdf,
            "Studio / Business",
            member.studio,
            margin + 91,
            y,
            78
          )
        );

      y += rowHeight;

      rowHeight =
        Math.max(
          pdfField(
            pdf,
            "Camera / Equipment",
            member.cameraDetails,
            margin,
            y,
            78
          ),

          pdfField(
            pdf,
            "Member ID",
            member.memberId,
            margin + 91,
            y,
            78
          )
        );

      y += rowHeight + 2;

      // =================================================
      // CONTACT INFORMATION
      // =================================================

      section(
        "Contact Information"
      );

      rowHeight =
        Math.max(
          pdfField(
            pdf,
            "Phone / WhatsApp",
            member.phone,
            margin,
            y,
            78
          ),

          pdfField(
            pdf,
            "Gmail / Google Account",
            member.googleEmail,
            margin + 91,
            y,
            78
          )
        );

      y += rowHeight;

      rowHeight =
        Math.max(
          pdfField(
            pdf,
            "City",
            member.city,
            margin,
            y,
            78
          ),

          pdfField(
            pdf,
            "Google Maps Address",
            member.googleAddress,
            margin + 91,
            y,
            78
          )
        );

      y += rowHeight;

      rowHeight =
        Math.max(
          pdfField(
            pdf,
            "Complete Address",
            member.address,
            margin,
            y,
            contentWidth
          )
        );

      y += rowHeight + 3;

      // =================================================
      // QR SECTION
      // =================================================

      const profileUrl =
        getMemberProfileUrl(
          member
        );

      const mapUrl =
        getMapUrl(member);

      const profileQr =
        profileUrl
          ? await createQr(
              profileUrl
            )
          : "";

      const mapQr =
        mapUrl
          ? await createQr(
              mapUrl
            )
          : "";

      if (
        profileQr ||
        mapQr
      ) {
        section(
          "Digital Profile & Location"
        );

        const qrTop = y;

        const qrBoxWidth =
          profileQr && mapQr
            ? (contentWidth - 6) /
              2
            : contentWidth;

        if (profileQr) {
          const boxX =
            margin;

          pdf.setFillColor(
            250,
            250,
            250
          );

          pdf.setDrawColor(
            ...border
          );

          pdf.roundedRect(
            boxX,
            qrTop,
            qrBoxWidth,
            47,
            2,
            2,
            "FD"
          );

          pdf.addImage(
            profileQr,
            "PNG",
            boxX + 5,
            qrTop + 4,
            35,
            35
          );

          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(7);

          pdf.setTextColor(
            ...dark
          );

          pdf.text(
            "SCAN TO VIEW PORTFOLIO",
            boxX + 44,
            qrTop + 13
          );

          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(7);

          pdf.setTextColor(
            90,
            90,
            90
          );

          const profileText =
            pdf.splitTextToSize(
              `Open this member's ${websiteName || "OCMA"} profile, portfolio, photos, videos and reviews.`,
              qrBoxWidth - 49
            );

          pdf.text(
            profileText,
            boxX + 44,
            qrTop + 20
          );
        }

        if (mapQr) {
          const boxX =
            profileQr
              ? margin +
                qrBoxWidth +
                6
              : margin;

          const mapBoxWidth =
            profileQr
              ? qrBoxWidth
              : contentWidth;

          pdf.setFillColor(
            250,
            250,
            250
          );

          pdf.setDrawColor(
            ...border
          );

          pdf.roundedRect(
            boxX,
            qrTop,
            mapBoxWidth,
            47,
            2,
            2,
            "FD"
          );

          pdf.addImage(
            mapQr,
            "PNG",
            boxX + 5,
            qrTop + 4,
            35,
            35
          );

          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(7);

          pdf.setTextColor(
            ...dark
          );

          pdf.text(
            "SCAN TO OPEN MAP LOCATION",
            boxX + 44,
            qrTop + 13
          );

          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(7);

          pdf.setTextColor(
            90,
            90,
            90
          );

          const mapText =
            pdf.splitTextToSize(
              "Scan the QR code to open this member's Google Maps location.",
              mapBoxWidth - 49
            );

          pdf.text(
            mapText,
            boxX + 44,
            qrTop + 20
          );
        }

        y += 53;
      }

      // =================================================
      // FOOTER
      // =================================================

      pdf.setDrawColor(
        ...gold
      );

      pdf.setLineWidth(
        0.4
      );

      pdf.line(
        margin,
        pageHeight - 17,
        pageWidth - margin,
        pageHeight - 17
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(6.8);

      pdf.setTextColor(
        110,
        110,
        110
      );

      pdf.text(
        `${websiteName || "OCMA"} — Official Registered Member Record`,
        margin,
        pageHeight - 11
      );

      pdf.text(
        `Generated: ${pdfDate(
          new Date()
        )}`,
        pageWidth - margin,
        pageHeight - 11,
        {
          align: "right"
        }
      );
    };

  // =====================================================
  // INDIVIDUAL MEMBER PDF
  // =====================================================

  const downloadMemberPdf =
    async (
      member
    ) => {
      if (!member) {
        return;
      }

      try {
        setPdfMemberId(
          member.id
        );

        const pdf =
          new jsPDF({
            orientation:
              "portrait",
            unit: "mm",
            format: "a4"
          });

        await drawMemberPdf(
          pdf,
          member
        );

        const memberId =
          pdfSafe(
            member.memberId
          ) || "Member";

        const memberName =
          pdfSafe(
            member.name
          ) || "Profile";

        const cleanName =
          memberName
            .replace(
              /[\\/:*?"<>|]/g,
              ""
            )
            .replace(
              /\s+/g,
              "-"
            );

        const pdfBrandName =
          pdfSafe(
            websiteName
          ) || "OCMA";

        const cleanBrandName =
          pdfBrandName
            .replace(
              /[\\/:*?"<>|]/g,
              ""
            )
            .replace(
              /\s+/g,
              "-"
            );

        pdf.save(
          `${cleanBrandName}-${memberId}-${cleanName}.pdf`
        );
      } catch (error) {
        console.log(
          "Member PDF Error:",
          error
        );

        alert(
          "PDF بنانے میں مسئلہ آیا۔ دوبارہ کوشش کریں۔"
        );
      } finally {
        setPdfMemberId(null);
      }
    };

  // =====================================================
  // ALL MEMBERS PDF
  // =====================================================

  const downloadAllMembersPdf =
    async () => {
      if (
        members.length === 0
      ) {
        alert(
          "No active members found."
        );
        return;
      }

      try {
        setPdfLoading(true);

        const pdf =
          new jsPDF({
            orientation:
              "portrait",
            unit: "mm",
            format: "a4"
          });

        for (
          let i = 0;
          i < members.length;
          i++
        ) {
          if (i > 0) {
            pdf.addPage();
          }

          await drawMemberPdf(
            pdf,
            members[i]
          );
        }

        const pdfBrandName =
          pdfSafe(
            websiteName
          ) || "OCMA";

        const cleanBrandName =
          pdfBrandName
            .replace(
              /[\\/:*?"<>|]/g,
              ""
            )
            .replace(
              /\s+/g,
              "-"
            );

        pdf.save(
          `${cleanBrandName}-All-Active-Members.pdf`
        );
      } catch (error) {
        console.log(
          "All Members PDF Error:",
          error
        );

        alert(
          "All Members PDF بنانے میں مسئلہ آیا۔ دوبارہ کوشش کریں۔"
        );
      } finally {
        setPdfLoading(false);
      }
    };

  // =====================================================
  // SAVE MEMBER
  // =====================================================

  const handleUpdate =
    async (e) => {
      e.preventDefault();

      if (!editMember) {
        return;
      }

      try {
        setSaving(true);

        let image =
          editMember.image || "";

        if (editPhoto) {
          image =
            await uploadImage(
              editPhoto
            );
        }

        let photos = [
          ...(editMember.portfolio?.photos || [])
        ];

        if (
          newPortfolioPhotos.length >
          0
        ) {
          const uploaded =
            await uploadImages(
              newPortfolioPhotos
            );

          photos = [
            ...photos,
            ...uploaded
          ];
        }

        if (
          photos.length > 10
        ) {
          alert(
            "Portfolio Photos زیادہ سے زیادہ 10 ہونی چاہئیں۔"
          );
          return;
        }

        let videos = [
          ...(editMember.portfolio?.videos || [])
        ];

        videos =
          videos
            .filter(
              (video) =>
                video?.url?.trim()
            )
            .slice(0, 5)
            .map(
              (video) => ({
                url:
                  video.url.trim(),

                embed:
                  getEmbedUrl(
                    video.url.trim()
                  )
              })
            );

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

            googleAddress:
              editMember.googleAddress || "",

            specialty:
              editMember.specialty || "",

            gender:
              editMember.gender || "",

            experience:
              editMember.experience || "",

            bloodGroup:
              editMember.bloodGroup || "",

            address:
              editMember.address || "",

            cameraDetails:
              editMember.cameraDetails || "",

            message:
              editMember.message || "",

            image,

            portfolio: {
              photos,
              videos
            }
          }
        );

        alert(
          "Member Updated Successfully"
        );

        setEditMember(null);
        setEditPhoto(null);
        setEditPhotoPreview("");
        setNewPortfolioPhotos([]);
        setNewPortfolioPreview([]);

        loadMembers();
      } catch (error) {
        console.log(
          "Update Member Error:",
          error
        );

        alert(
          "Update Failed"
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredMembers =
    members.filter(
      (member) => {
        const text =
          search
            .toLowerCase()
            .trim();

        return (
          member.name
            ?.toLowerCase()
            .includes(text) ||

          member.phone
            ?.toLowerCase()
            .includes(text) ||

          member.city
            ?.toLowerCase()
            .includes(text) ||

          member.memberId
            ?.toLowerCase()
            .includes(text) ||

          member.specialty
            ?.toLowerCase()
            .includes(text) ||

          member.gender
            ?.toLowerCase()
            .includes(text) ||

          member.googleEmail
            ?.toLowerCase()
            .includes(text)
        );
      }
    );

  // =====================================================
  // VIEW
  // =====================================================

  const handleView =
    (memberId) => {
      window.open(
        `/member/${memberId}`,
        "_blank"
      );
    };

  // =====================================================
  // STATS
  // =====================================================

  const toggleStat =
    (stat) => {
      setOpenStat(
        openStat === stat
          ? null
          : stat
      );
    };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="members-admin">

      <div
        className="member-live-stats"
        ref={statRef}
      >

        <div className="member-stat-wrap">

          <button
            type="button"
            className="member-stat"
            onClick={() =>
              toggleStat(
                "members"
              )
            }
          >
            <span>
              Members
            </span>

            <strong>
              {totalMembers}
            </strong>

            <span className="stat-arrow">
              {openStat === "members"
                ? "▲"
                : "▼"}
            </span>
          </button>

          {openStat === "members" && (
            <div className="member-stat-dropdown">

              <div className="stat-dropdown-title">
                All Members
              </div>

              {members.length === 0 ? (
                <div className="stat-empty">
                  No members found
                </div>
              ) : (
                members.map(
                  (member) => (
                    <div
                      className="stat-member-item"
                      key={member.id}
                    >
                      <div>
                        <strong>
                          {member.name ||
                            "Unnamed Member"}
                        </strong>

                        <small>
                          {member.memberId ||
                            "No ID"}
                        </small>
                      </div>

                      <span>
                        {member.city ||
                          "No City"}
                      </span>
                    </div>
                  )
                )
              )}

            </div>
          )}

        </div>

        <div className="member-stat-wrap">

          <button
            type="button"
            className="member-stat"
            onClick={() =>
              toggleStat(
                "cities"
              )
            }
          >
            <span>
              Cities
            </span>

            <strong>
              {totalCities}
            </strong>

            <span className="stat-arrow">
              {openStat === "cities"
                ? "▲"
                : "▼"}
            </span>
          </button>

          {openStat === "cities" && (
            <div className="member-stat-dropdown">

              <div className="stat-dropdown-title">
                Cities & Members
              </div>

              {sortedCities.map(
                ([city, count]) => (
                  <div
                    className="stat-list-item"
                    key={city}
                  >
                    <span>
                      {city}
                    </span>

                    <strong>
                      {count}
                    </strong>
                  </div>
                )
              )}

            </div>
          )}

        </div>

        <div className="member-stat-wrap">

          <button
            type="button"
            className="member-stat"
            onClick={() =>
              toggleStat(
                "professions"
              )
            }
          >
            <span>
              Professions
            </span>

            <strong>
              {totalProfessions}
            </strong>

            <span className="stat-arrow">
              {openStat === "professions"
                ? "▲"
                : "▼"}
            </span>
          </button>

          {openStat === "professions" && (
            <div className="member-stat-dropdown">

              <div className="stat-dropdown-title">
                Professions & Members
              </div>

              {sortedProfessions.map(
                ([profession, count]) => (
                  <div
                    className="stat-list-item"
                    key={profession}
                  >
                    <span>
                      {profession}
                    </span>

                    <strong>
                      {count}
                    </strong>
                  </div>
                )
              )}

            </div>
          )}

        </div>

        <div className="member-stat-wrap">

          <div className="member-stat member-stat-static">
            <span>
              Male
            </span>

            <strong>
              {totalMale}
            </strong>
          </div>

        </div>

        <div className="member-stat-wrap">

          <div className="member-stat member-stat-static">
            <span>
              Female
            </span>

            <strong>
              {totalFemale}
            </strong>
          </div>

        </div>

      </div>

      <h1>
        Approved {websiteName} Members
      </h1>

      {/* =================================================
          ALL MEMBERS PDF
      ================================================= */}

      <button
        type="button"
        className="member-pdf-all-button"
        onClick={
          downloadAllMembersPdf
        }
        disabled={
          pdfLoading ||
          members.length === 0
        }
      >
        {pdfLoading
          ? "Creating PDF..."
          : `Export All ${websiteName} Members PDF`}
      </button>

      <input
        className="member-search"
        placeholder={`Search Name, Phone, City or ${websiteName} ID...`}
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
      />

      <div className="members-grid">

        {filteredMembers.map(
          (member) => (

            <div
              className="member-card"
              key={member.id}
            >

              <div className="member-photo">

                <img
                  src={
                    member.image ||
                    "/assets/ocma-logo.png"
                  }
                  alt={
                    member.name ||
                    `${websiteName} Member`
                  }
                />

              </div>

              <div className="member-id">
                {member.memberId}
              </div>

              <div className="member-name">
                {member.name}
              </div>

              <div className="member-work">

                <div>
                  {member.specialty ||
                    "Not Added"}
                </div>

                {member.gender && (
                  <small className="member-gender">
                    {member.gender}
                  </small>
                )}

              </div>

              <div className="member-city">
                {member.city ||
                  "Not Added"}
              </div>

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
                  onClick={() =>
                    downloadMemberPdf(
                      member
                    )
                  }
                  disabled={
                    pdfMemberId ===
                    member.id
                  }
                >
                  {pdfMemberId ===
                  member.id
                    ? "PDF..."
                    : "PDF"}
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

      {filteredMembers.length === 0 && (
        <div className="no-members">
          No members found.
        </div>
      )}

      {/* =================================================
          EDIT MEMBER POPUP
      ================================================= */}

      {editMember && (

        <div
          className="edit-popup"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setEditMember(null);
            }
          }}
        >

          <form
            className="edit-box"
            onSubmit={
              handleUpdate
            }
          >

            <h2>
              Edit Member
            </h2>

            <p className="edit-member-name">
              {editMember.name ||
                `${websiteName} Member`}
            </p>

            {/* PROFILE PHOTO */}

            <div className="edit-field">

              <label>
                Profile Photo
              </label>

              <img
                src={
                  editPhotoPreview ||
                  editMember.image ||
                  "/assets/ocma-logo.png"
                }
                alt="Profile"
                className="popup-member-image"
              />

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleEditProfilePhoto
                }
              />

            </div>

            <div className="edit-field">

              <label>
                Name
              </label>

              <input
                name="name"
                value={
                  editMember.name || ""
                }
                onChange={
                  handleEditChange
                }
              />

            </div>

            <div className="edit-field">

              <label>
                Phone Number
              </label>

              <input
                name="phone"
                value={
                  editMember.phone || ""
                }
                onChange={
                  handleEditChange
                }
              />

            </div>

            <div className="edit-field">

              <label>
                Father Name
              </label>

              <input
                name="fatherName"
                value={
                  editMember.fatherName || ""
                }
                onChange={
                  handleEditChange
                }
              />

            </div>

            <div className="edit-field">

              <label>
                Studio Name
              </label>

              <input
                name="studio"
                value={
                  editMember.studio || ""
                }
                onChange={
                  handleEditChange
                }
              />

            </div>

            <div className="edit-field">

              <label>
                City
              </label>

              <input
                name="city"
                value={
                  editMember.city || ""
                }
                onChange={
                  handleEditChange
                }
              />

            </div>

            <div className="edit-field">

              <label>
                Google Business / Maps Address
              </label>

              <input
                name="googleAddress"
                value={
                  editMember.googleAddress ||
                  ""
                }
                onChange={
                  handleEditChange
                }
              />

            </div>

            <div className="edit-field">

              <label>
                Profession
              </label>

              <select
                name="specialty"
                value={
                  editMember.specialty ||
                  ""
                }
                onChange={
                  handleEditChange
                }
              >
                <option value="">
                  Select Profession
                </option>

                <option value="Photographer">
                  Photographer
                </option>

                <option value="Videographer">
                  Videographer
                </option>

                <option value="Cinematographer">
                  Cinematographer
                </option>

                <option value="Editor">
                  Editor
                </option>

                <option value="Drone Operator">
                  Drone Operator
                </option>

                <option value="Graphic Designer">
                  Graphic Designer
                </option>

                <option value="Social Media Manager">
                  Social Media Manager
                </option>
              </select>

            </div>

            <div className="edit-field">

              <label>
                Gender
              </label>

              <select
                name="gender"
                value={
                  editMember.gender ||
                  ""
                }
                onChange={
                  handleEditChange
                }
              >
                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>

            </div>

            <div className="edit-field">

              <label>
                Experience
              </label>

              <select
                name="experience"
                value={
                  editMember.experience ||
                  ""
                }
                onChange={
                  handleEditChange
                }
              >
                <option value="">
                  Experience
                </option>

                {Array.from(
                  { length: 50 },
                  (_, i) => (
                    <option
                      key={i}
                      value={`${i + 1} Years`}
                    >
                      {i + 1} Years
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="edit-field">

              <label>
                Blood Group
              </label>

              <select
                name="bloodGroup"
                value={
                  editMember.bloodGroup ||
                  ""
                }
                onChange={
                  handleEditChange
                }
              >
                <option value="">
                  Blood Group
                </option>

                <option value="A+">
                  A+
                </option>

                <option value="A-">
                  A-
                </option>

                <option value="B+">
                  B+
                </option>

                <option value="B-">
                  B-
                </option>

                <option value="AB+">
                  AB+
                </option>

                <option value="AB-">
                  AB-
                </option>

                <option value="O+">
                  O+
                </option>

                <option value="O-">
                  O-
                </option>

              </select>

            </div>

            <div className="edit-field">

              <label>
                Complete Address
              </label>

              <textarea
                name="address"
                value={
                  editMember.address ||
                  ""
                }
                onChange={
                  handleEditChange
                }
              />

            </div>

            <div className="edit-field">

              <label>
                Camera & Equipment Details
              </label>

              <textarea
                name="cameraDetails"
                value={
                  editMember.cameraDetails ||
                  ""
                }
                onChange={
                  handleEditChange
                }
              />

            </div>

            <div className="edit-field">

              <label>
                Member Message
              </label>

              <textarea
                name="message"
                value={
                  editMember.message ||
                  ""
                }
                onChange={
                  handleEditChange
                }
              />

            </div>

            {/* PORTFOLIO PHOTOS */}

            <h3>
              Portfolio Photos
            </h3>

            <p>
              موجودہ تصاویر حذف کریں یا نئی شامل کریں۔
              زیادہ سے زیادہ 10 تصاویر۔
            </p>

            <div className="edit-portfolio-list">

              {(
                editMember.portfolio?.photos ||
                []
              ).map(
                (photo, index) => (

                  <div
                    key={index}
                    className="edit-portfolio-row"
                  >

                    <img
                      src={photo}
                      alt={`Portfolio ${index + 1}`}
                      className="edit-portfolio-thumb"
                      onClick={() =>
                        window.open(
                          photo,
                          "_blank"
                        )
                      }
                    />

                    <div className="edit-portfolio-info">

                      <strong>
                        Photo {index + 1}
                      </strong>

                      <span>
                        موجودہ Portfolio Photo
                      </span>

                    </div>

                    <button
                      type="button"
                      className="edit-photo-delete"
                      onClick={() =>
                        deleteExistingPhoto(
                          index
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                )
              )}

            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={
                handleNewPortfolioPhotos
              }
            />

            {newPortfolioPreview.length >
              0 && (

              <div className="edit-portfolio-list">

                {newPortfolioPreview.map(
                  (photo, index) => (

                    <div
                      key={index}
                      className="edit-portfolio-row new"
                    >

                      <img
                        src={photo}
                        alt={`New Portfolio ${
                          index + 1
                        }`}
                        className="edit-portfolio-thumb"
                      />

                      <div className="edit-portfolio-info">

                        <strong>
                          New Photo {index + 1}
                        </strong>

                        <span>
                          نئی شامل کی جانے والی تصویر
                        </span>

                      </div>

                      <button
                        type="button"
                        className="edit-photo-delete"
                        onClick={() =>
                          deleteNewPortfolioPhoto(
                            index
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  )
                )}

              </div>
            )}

            {/* VIDEOS */}

            <h3>
              Video Portfolio
            </h3>

            {(
              editMember.portfolio?.videos ||
              []
            ).map(
              (video, index) => (

                <div
                  className="video-box"
                  key={index}
                >

                  <input
                    type="text"
                    placeholder={`Video Link ${
                      index + 1
                    }`}
                    value={
                      video.url || ""
                    }
                    onChange={(e) =>
                      handleVideoChange(
                        index,
                        e.target.value
                      )
                    }
                  />

                  {video.url &&
                    getEmbedUrl(
                      video.url
                    ) && (

                      <iframe
                        title={`member-video-${index}`}
                        src={
                          getEmbedUrl(
                            video.url
                          )
                        }
                        width="100%"
                        height="250"
                        frameBorder="0"
                        allowFullScreen
                      />

                    )}

                  <button
                    type="button"
                    className="delete"
                    onClick={() =>
                      deleteVideo(
                        index
                      )
                    }
                  >
                    Delete Video
                  </button>

                </div>

              )
            )}

            {(
              editMember.portfolio?.videos
                ?.length || 0
            ) < 5 && (

              <button
                type="button"
                onClick={addVideo}
              >
                + Add Video Link
              </button>

            )}

            {/* SAVE */}

            <div className="edit-actions">

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Update Member"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditMember(null)
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