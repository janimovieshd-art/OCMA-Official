import { useEffect, useRef, useState } from "react";

import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "firebase/auth";

import { db, auth, googleProvider } from "../firebase/firebase";
import { addData } from "../services/firestoreService";

import {
  uploadImage,
  uploadImages
} from "../services/cloudinary";

import "./JoinOCMA.css";

function JoinOCMA() {
  const [websiteName, setWebsiteName] = useState("OCMA");
  const [websiteLogo, setWebsiteLogo] = useState("");

  const [googleUser, setGoogleUser] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const [existingMember, setExistingMember] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);

  const [memberChecking, setMemberChecking] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    phone: "",
    city: "",
    studio: "",
    googleAddress: "",
    gender: "",
    specialty: "",
    experience: "",
    bloodGroup: "",
    address: "",
    cameraDetails: "",
    message: ""
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [existingPortfolioPhotos, setExistingPortfolioPhotos] =
    useState([]);

  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [portfolioPreview, setPortfolioPreview] = useState([]);

  const [videos, setVideos] = useState([
    "",
    "",
    "",
    "",
    ""
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const messageRef = useRef(null);
  const submitAreaRef = useRef(null);

  const emptyForm = {
    name: "",
    fatherName: "",
    phone: "",
    city: "",
    studio: "",
    googleAddress: "",
    gender: "",
    specialty: "",
    experience: "",
    bloodGroup: "",
    address: "",
    cameraDetails: "",
    message: ""
  };

  /* =====================================================
     LOAD WEBSITE SETTINGS
  ===================================================== */

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(
          doc(db, "websiteSettings", "main")
        );

        if (snap.exists()) {
          const data = snap.data();

          const dynamicName =
            data.navbar?.name?.trim() ||
            data.website?.siteName?.trim() ||
            data.website?.shortName?.trim() ||
            "OCMA";

          const dynamicLogo =
            data.website?.logo?.trim() || "";

          setWebsiteName(dynamicName);
          setWebsiteLogo(dynamicLogo);
        }
      } catch (error) {
        console.log(
          "Join Settings Error:",
          error
        );
      }
    };

    loadSettings();
  }, []);

  /* =====================================================
     GOOGLE AUTH
  ===================================================== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setGoogleUser(user || null);
        setGoogleLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =====================================================
     CHECK EXISTING MEMBER + PENDING REQUEST
  ===================================================== */

  useEffect(() => {
    const checkExistingMember = async () => {
      if (!googleUser?.uid) {
        setExistingMember(null);
        setExistingRequest(null);
        setEditMode(false);
        return;
      }

      try {
        setMemberChecking(true);
        setError("");
        setSuccess("");

        /* -------------------------------------------------
           1. CHECK APPROVED / ACTIVE MEMBER
        ------------------------------------------------- */

        const memberQuery = query(
          collection(db, "members"),
          where(
            "googleUid",
            "==",
            googleUser.uid
          )
        );

        const memberSnap =
          await getDocs(memberQuery);

        if (!memberSnap.empty) {
          const activeMember =
            memberSnap.docs.find(
              (item) =>
                item.data()?.status ===
                "ACTIVE"
            );

          if (activeMember) {
            const memberData = {
              id: activeMember.id,
              ...activeMember.data()
            };

            setExistingMember(
              memberData
            );

            setExistingRequest(null);
            setEditMode(false);

            return;
          }
        }

        /* -------------------------------------------------
           2. NO ACTIVE MEMBER
           CHECK PENDING MEMBERSHIP REQUEST
        ------------------------------------------------- */

        const requestQuery = query(
          collection(db, "membership_requests"),
          where(
            "googleUid",
            "==",
            googleUser.uid
          )
        );

        const requestSnap =
          await getDocs(requestQuery);

        const pendingRequests =
          requestSnap.docs.filter(
            (item) =>
              item.data()?.status ===
              "PENDING"
          );

        if (
          pendingRequests.length >
          0
        ) {
          /*
             If old duplicate pending requests
             already exist, use the latest one.
          */

          const latestRequest =
            [...pendingRequests].sort(
              (a, b) => {
                const aTime =
                  new Date(
                    a.data()?.createdAt ||
                    0
                  ).getTime();

                const bTime =
                  new Date(
                    b.data()?.createdAt ||
                    0
                  ).getTime();

                return bTime - aTime;
              }
            )[0];

          setExistingRequest({
            id: latestRequest.id,
            ...latestRequest.data()
          });

          setExistingMember(null);
          setEditMode(false);

          return;
        }

        /* -------------------------------------------------
           3. NO MEMBER + NO PENDING REQUEST
        ------------------------------------------------- */

        setExistingMember(null);
        setExistingRequest(null);
        setEditMode(false);

      } catch (error) {
        console.log(
          "Existing Member / Request Check Error:",
          error
        );

        setError(
          "ممبر کی معلومات چیک نہیں ہو سکیں۔ دوبارہ کوشش کریں۔"
        );
      } finally {
        setMemberChecking(false);
      }
    };

    checkExistingMember();
  }, [googleUser]);

  /* =====================================================
     MESSAGE SCROLL
  ===================================================== */

  useEffect(() => {
    if (!success && !error) return;

    const timer = setTimeout(() => {
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [success, error]);

  /* =====================================================
     START EDIT PROFILE / REQUEST
  ===================================================== */

  const startEditProfile = () => {
    const record =
      existingMember ||
      existingRequest;

    if (!record) return;

    setFormData({
      name: record.name || "",
      fatherName: record.fatherName || "",
      phone: record.phone || "",
      city: record.city || "",
      studio: record.studio || "",
      googleAddress:
        record.googleAddress || "",
      gender: record.gender || "",
      specialty: record.specialty || "",
      experience: record.experience || "",
      bloodGroup:
        record.bloodGroup || "",
      address: record.address || "",
      cameraDetails:
        record.cameraDetails || "",
      message: record.message || ""
    });

    setPhoto(null);

    setPhotoPreview(
      record.image ||
      googleUser?.photoURL ||
      websiteLogo ||
      ""
    );

    const oldPhotos =
      Array.isArray(
        record.portfolio?.photos
      )
        ? record.portfolio.photos
        : [];

    setExistingPortfolioPhotos(
      oldPhotos
    );

    setPortfolioPhotos([]);
    setPortfolioPreview([]);

    const oldVideos =
      Array.isArray(
        record.portfolio?.videos
      )
        ? record.portfolio.videos
        : [];

    const videoUrls = oldVideos
      .map((video) => {
        if (typeof video === "string") {
          return video;
        }

        return video?.url || "";
      })
      .filter(Boolean);

    const fiveVideos = [
      ...videoUrls,
      "",
      "",
      "",
      ""
    ].slice(0, 5);

    while (fiveVideos.length < 5) {
      fiveVideos.push("");
    }

    setVideos(fiveVideos);

    setEditMode(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  /* =====================================================
     CANCEL EDIT
  ===================================================== */

  const cancelEdit = () => {
    setEditMode(false);
    setError("");
    setSuccess("");

    setPhoto(null);
    setPhotoPreview("");

    setPortfolioPhotos([]);
    setPortfolioPreview([]);

    setExistingPortfolioPhotos([]);

    setVideos([
      "",
      "",
      "",
      "",
      ""
    ]);

    setFormData(emptyForm);
  };

  /* =====================================================
     GOOGLE LOGIN
  ===================================================== */

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setSuccess("");
      setLoginLoading(true);

      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );

      setGoogleUser(result.user);
    } catch (error) {
      console.log(
        "Join Google Login Error:",
        error
      );

      if (
        error?.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "Google Login مکمل نہیں ہوا۔"
        );
      } else if (
        error?.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "Browser نے Google Login popup روک دیا ہے۔ براہِ کرم popup allow کریں۔"
        );
      } else {
        setError(
          "Google Login نہیں ہو سکا۔ براہِ کرم دوبارہ کوشش کریں۔"
        );
      }
    } finally {
      setLoginLoading(false);
    }
  };

  /* =====================================================
     GOOGLE LOGOUT
  ===================================================== */

  const handleGoogleLogout = async () => {
    try {
      await signOut(auth);

      setGoogleUser(null);
      setExistingMember(null);
      setExistingRequest(null);
      setEditMode(false);

      setSuccess("");
      setError("");

      setFormData(emptyForm);
      setPhoto(null);
      setPhotoPreview("");
      setPortfolioPhotos([]);
      setPortfolioPreview([]);
      setExistingPortfolioPhotos([]);

      setVideos([
        "",
        "",
        "",
        "",
        ""
      ]);
    } catch (error) {
      console.log(
        "Google Logout Error:",
        error
      );
    }
  };

  /* =====================================================
     DELETE MY PROFILE / REQUEST
  ===================================================== */

  const handleDeleteProfile = async () => {
    if (!googleUser?.uid) {
      setError(
        "آپ کا Google Account نہیں ملا۔"
      );
      return;
    }

    if (
      !existingMember?.id &&
      !existingRequest?.id
    ) {
      setError(
        "آپ کی پروفائل یا درخواست نہیں ملی۔"
      );
      return;
    }

    const confirmed = window.confirm(
      `کیا آپ واقعی اپنی ${websiteName} ممبر پروفائل Delete کرنا چاہتے ہیں؟\n\n` +
      "اس عمل سے آپ کی ممبر پروفائل، Reviews/Ratings اور Membership Request کا ریکارڈ حذف ہو جائے گا۔\n\n" +
      "یہ عمل واپس نہیں کیا جا سکتا۔"
    );

    if (!confirmed) return;

    const secondConfirm = window.confirm(
      "آخری تصدیق:\n\nکیا آپ واقعی اپنی پروفائل ہمیشہ کے لیے Delete کرنا چاہتے ہیں؟"
    );

    if (!secondConfirm) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      /* -------------------------------------------------
         1. FIND MEMBER RECORDS
      ------------------------------------------------- */

      const memberQuery = query(
        collection(db, "members"),
        where(
          "googleUid",
          "==",
          googleUser.uid
        )
      );

      const memberSnap =
        await getDocs(memberQuery);

      const memberIds =
        memberSnap.docs.map(
          (item) => item.id
        );

      /* -------------------------------------------------
         2. DELETE ALL RATINGS
      ------------------------------------------------- */

      for (const memberId of memberIds) {
        const ratingsQuery = query(
          collection(db, "member_ratings"),
          where(
            "memberId",
            "==",
            memberId
          )
        );

        const ratingsSnap =
          await getDocs(ratingsQuery);

        for (const ratingDoc of ratingsSnap.docs) {
          await deleteDoc(
            ratingDoc.ref
          );
        }
      }

      /* -------------------------------------------------
         3. DELETE MEMBER PROFILES
      ------------------------------------------------- */

      for (const memberDoc of memberSnap.docs) {
        await deleteDoc(
          memberDoc.ref
        );
      }

      /* -------------------------------------------------
         4. DELETE ALL MEMBERSHIP REQUESTS
      ------------------------------------------------- */

      const requestQuery = query(
        collection(db, "membership_requests"),
        where(
          "googleUid",
          "==",
          googleUser.uid
        )
      );

      const requestSnap =
        await getDocs(requestQuery);

      for (const requestDoc of requestSnap.docs) {
        await deleteDoc(
          requestDoc.ref
        );
      }

      /* -------------------------------------------------
         5. CLEAR LOCAL DATA
      ------------------------------------------------- */

      setExistingMember(null);
      setExistingRequest(null);
      setEditMode(false);

      setFormData(emptyForm);

      setPhoto(null);
      setPhotoPreview("");

      setPortfolioPhotos([]);
      setPortfolioPreview([]);

      setExistingPortfolioPhotos([]);

      setVideos([
        "",
        "",
        "",
        "",
        ""
      ]);

      /* -------------------------------------------------
         6. LOGOUT
      ------------------------------------------------- */

      await signOut(auth);

      setGoogleUser(null);

      setSuccess("");
      setError("");

      alert(
        "آپ کی ممبر پروفائل کامیابی سے Delete کر دی گئی ہے۔"
      );
    } catch (error) {
      console.log(
        "Delete Profile Error:",
        error
      );

      setError(
        "پروفائل Delete نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setError("");
    setSuccess("");
  };

  /* =====================================================
     FILE SIZE
  ===================================================== */

  const checkSize = (file) => {
    return (
      file.size <=
      5 * 1024 * 1024
    );
  };

  /* =====================================================
     PROFILE PHOTO
  ===================================================== */

  const handleProfilePhoto = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "صرف تصویر فائل اپلوڈ کریں۔"
      );
      return;
    }

    if (!checkSize(file)) {
      setError(
        "پروفائل تصویر 5MB سے زیادہ نہیں ہونی چاہیے۔"
      );
      return;
    }

    setPhoto(file);

    setPhotoPreview(
      URL.createObjectURL(file)
    );

    setError("");
    setSuccess("");
  };

  /* =====================================================
     PORTFOLIO
  ===================================================== */

  const handlePortfolio = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const currentTotal =
      existingPortfolioPhotos.length +
      portfolioPhotos.length;

    const availableSlots =
      10 - currentTotal;

    if (availableSlots <= 0) {
      setError(
        "زیادہ سے زیادہ 10 Portfolio Photos شامل کی جا سکتی ہیں۔"
      );
      return;
    }

    const filesToAdd =
      files.slice(
        0,
        availableSlots
      );

    const newFiles = [
      ...portfolioPhotos
    ];

    const newPreview = [
      ...portfolioPreview
    ];

    for (const file of filesToAdd) {
      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setError(
          `${file.name} تصویر فائل نہیں ہے۔`
        );
        continue;
      }

      if (!checkSize(file)) {
        setError(
          `${file.name} کا سائز 5MB سے زیادہ ہے۔`
        );
        continue;
      }

      newFiles.push(file);

      newPreview.push(
        URL.createObjectURL(file)
      );
    }

    if (
      files.length >
      availableSlots
    ) {
      setError(
        "زیادہ سے زیادہ 10 Portfolio Photos شامل کی جا سکتی ہیں۔"
      );
    }

    setPortfolioPhotos(newFiles);
    setPortfolioPreview(newPreview);

    if (
      newFiles.length >
      portfolioPhotos.length
    ) {
      setSuccess("");
    }
  };

  /* =====================================================
     REMOVE NEW PORTFOLIO PHOTO
  ===================================================== */

  const removePortfolioPhoto = (
    index
  ) => {
    const files = [
      ...portfolioPhotos
    ];

    const previews = [
      ...portfolioPreview
    ];

    files.splice(index, 1);
    previews.splice(index, 1);

    setPortfolioPhotos(files);
    setPortfolioPreview(previews);

    setError("");
    setSuccess("");
  };

  /* =====================================================
     REMOVE EXISTING PORTFOLIO PHOTO
  ===================================================== */

  const removeExistingPortfolioPhoto =
    (index) => {
      const photos = [
        ...existingPortfolioPhotos
      ];

      photos.splice(index, 1);

      setExistingPortfolioPhotos(
        photos
      );

      setError("");
      setSuccess("");
    };

  /* =====================================================
     VIDEO
  ===================================================== */

  const handleVideoChange = (
    index,
    value
  ) => {
    const updated = [...videos];

    updated[index] = value;

    setVideos(updated);

    setError("");
    setSuccess("");
  };

  /* =====================================================
     VIDEO EMBED
  ===================================================== */

  const getEmbedUrl = (url) => {
    if (!url) return "";

    try {
      if (
        url.includes(
          "youtube.com/watch"
        )
      ) {
        const id =
          new URL(
            url
          ).searchParams.get("v");

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }

      if (
        url.includes("youtu.be")
      ) {
        const id = url
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
        const id = url
          .split("/shorts/")[1]
          .split("?")[0];

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }

      if (
        url.includes(
          "vimeo.com"
        )
      ) {
        const id = url
          .split("/")
          .pop()
          .split("?")[0];

        if (id) {
          return `https://player.vimeo.com/video/${id}`;
        }
      }

      if (
        url.includes(
          "facebook.com"
        )
      ) {
        return (
          `https://www.facebook.com/plugins/video.php?href=` +
          `${encodeURIComponent(
            url
          )}` +
          `&show_text=false`
        );
      }
    } catch {
      return "";
    }

    return "";
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!googleUser) {
      setError(
        "براہِ کرم پہلے Google Account سے Login کریں۔"
      );
      return;
    }

    if (!formData.gender) {
      setError(
        "براہِ کرم Gender منتخب کریں۔"
      );
      return;
    }

    if (!formData.specialty) {
      setError(
        "براہِ کرم Profession منتخب کریں۔"
      );
      return;
    }

    try {
      setLoading(true);

      /* =================================================
         EDIT EXISTING MEMBER
      ================================================= */

      if (
        editMode &&
        existingMember
      ) {
        let imageUrl =
          existingMember.image ||
          "";

        let newWorkImages = [];

        if (photo) {
          imageUrl =
            await uploadImage(photo);
        }

        if (
          portfolioPhotos.length >
          0
        ) {
          newWorkImages =
            await uploadImages(
              portfolioPhotos
            );
        }

        const finalPortfolioPhotos =
          [
            ...existingPortfolioPhotos,
            ...newWorkImages
          ].slice(0, 10);

        const videoData = videos
          .filter(
            (video) =>
              video.trim() !== ""
          )
          .map((video) => ({
            url: video.trim(),
            embed:
              getEmbedUrl(
                video.trim()
              )
          }));

        const memberRef = doc(
          db,
          "members",
          existingMember.id
        );

        const updatedAt =
          new Date().toISOString();

        await updateDoc(
          memberRef,
          {
            ...formData,

            image: imageUrl,

            portfolio: {
              photos:
                finalPortfolioPhotos,
              videos: videoData
            },

            googleUid:
              existingMember.googleUid ||
              googleUser.uid,

            googleEmail:
              existingMember.googleEmail ||
              googleUser.email ||
              "",

            googleName:
              existingMember.googleName ||
              googleUser.displayName ||
              "",

            googlePhoto:
              existingMember.googlePhoto ||
              googleUser.photoURL ||
              "",

            updatedAt
          }
        );

        setExistingMember({
          ...existingMember,
          ...formData,
          image: imageUrl,
          portfolio: {
            photos:
              finalPortfolioPhotos,
            videos: videoData
          },
          updatedAt
        });

        setPhoto(null);
        setPortfolioPhotos([]);
        setPortfolioPreview([]);

        setEditMode(false);

        setSuccess(
          "آپ کی پروفائل کامیابی سے اپڈیٹ ہوگئی ہے۔"
        );

        return;
      }

      /* =================================================
         EDIT EXISTING PENDING REQUEST
      ================================================= */

      if (
        editMode &&
        existingRequest
      ) {
        let imageUrl =
          existingRequest.image ||
          "";

        let newWorkImages = [];

        if (photo) {
          imageUrl =
            await uploadImage(photo);
        }

        if (
          portfolioPhotos.length >
          0
        ) {
          newWorkImages =
            await uploadImages(
              portfolioPhotos
            );
        }

        const finalPortfolioPhotos =
          [
            ...existingPortfolioPhotos,
            ...newWorkImages
          ].slice(0, 10);

        const videoData = videos
          .filter(
            (video) =>
              video.trim() !== ""
          )
          .map((video) => ({
            url: video.trim(),
            embed:
              getEmbedUrl(
                video.trim()
              )
          }));

        const requestRef = doc(
          db,
          "membership_requests",
          existingRequest.id
        );

        const updatedAt =
          new Date().toISOString();

        await updateDoc(
          requestRef,
          {
            ...formData,

            image: imageUrl,

            portfolio: {
              photos:
                finalPortfolioPhotos,
              videos: videoData
            },

            googleUid:
              existingRequest.googleUid ||
              googleUser.uid,

            googleEmail:
              existingRequest.googleEmail ||
              googleUser.email ||
              "",

            googleName:
              existingRequest.googleName ||
              googleUser.displayName ||
              "",

            googlePhoto:
              existingRequest.googlePhoto ||
              googleUser.photoURL ||
              "",

            status: "PENDING",

            updatedAt
          }
        );

        setExistingRequest({
          ...existingRequest,
          ...formData,
          image: imageUrl,
          portfolio: {
            photos:
              finalPortfolioPhotos,
            videos: videoData
          },
          status: "PENDING",
          updatedAt
        });

        setPhoto(null);
        setPortfolioPhotos([]);
        setPortfolioPreview([]);

        setEditMode(false);

        setSuccess(
          "آپ کی ممبرشپ درخواست کامیابی سے اپڈیٹ ہوگئی ہے۔"
        );

        return;
      }

      /* =================================================
         FINAL DUPLICATE CHECK
         IMPORTANT:
         CHECK AGAIN JUST BEFORE CREATING NEW REQUEST
      ================================================= */

      const duplicateMemberQuery =
        query(
          collection(db, "members"),
          where(
            "googleUid",
            "==",
            googleUser.uid
          )
        );

      const duplicateMemberSnap =
        await getDocs(
          duplicateMemberQuery
        );

      const activeMember =
        duplicateMemberSnap.docs.find(
          (item) =>
            item.data()?.status ===
            "ACTIVE"
        );

      if (activeMember) {
        setExistingMember({
          id: activeMember.id,
          ...activeMember.data()
        });

        setExistingRequest(null);
        setEditMode(false);

        setError(
          "آپ کا Google Account پہلے ہی ایک رجسٹرڈ ممبر پروفائل کے ساتھ منسلک ہے۔"
        );

        return;
      }

      /* -------------------------------------------------
         CHECK PENDING REQUEST AGAIN
      ------------------------------------------------- */

      const duplicateRequestQuery =
        query(
          collection(db, "membership_requests"),
          where(
            "googleUid",
            "==",
            googleUser.uid
          )
        );

      const duplicateRequestSnap =
        await getDocs(
          duplicateRequestQuery
        );

      const pendingRequests =
        duplicateRequestSnap.docs.filter(
          (item) =>
            item.data()?.status ===
            "PENDING"
        );

      if (
        pendingRequests.length >
        0
      ) {
        const latestRequest =
          [...pendingRequests].sort(
            (a, b) => {
              const aTime =
                new Date(
                  a.data()?.createdAt ||
                  0
                ).getTime();

              const bTime =
                new Date(
                  b.data()?.createdAt ||
                  0
                ).getTime();

              return bTime - aTime;
            }
          )[0];

        setExistingRequest({
          id: latestRequest.id,
          ...latestRequest.data()
        });

        setExistingMember(null);
        setEditMode(false);

        setError(
          "آپ کی ممبرشپ درخواست پہلے ہی جمع ہو چکی ہے۔ نئی درخواست بنانے کے بجائے Edit Request استعمال کریں۔"
        );

        return;
      }

      /* =================================================
         NEW MEMBERSHIP REQUEST
      ================================================= */

      let imageUrl = "";
      let workImages = [];

      if (photo) {
        imageUrl =
          await uploadImage(photo);
      }

      if (
        portfolioPhotos.length >
        0
      ) {
        workImages =
          await uploadImages(
            portfolioPhotos
          );
      }

      const videoData = videos
        .filter(
          (video) =>
            video.trim() !== ""
        )
        .map((video) => ({
          url: video.trim(),
          embed:
            getEmbedUrl(
              video.trim()
            )
        }));

      const createdAt =
        new Date().toISOString();

      const requestData = {
        ...formData,

        image: imageUrl,

        portfolio: {
          photos: workImages,
          videos: videoData
        },

        googleUid:
          googleUser.uid,

        googleEmail:
          googleUser.email || "",

        googleName:
          googleUser.displayName ||
          "",

        googlePhoto:
          googleUser.photoURL ||
          "",

        googleRating: 0,
        googleReviewCount: 0,

        status: "PENDING",

        createdAt
      };

      const newRequestId =
        await addData(
          "membership_requests",
          requestData
        );

      /* =================================================
         IMPORTANT:
         HIDE FORM AFTER SUBMIT
      ================================================= */

      setExistingRequest({
        id:
          typeof newRequestId ===
          "string"
            ? newRequestId
            : "",
        ...requestData
      });

      setExistingMember(null);

      setEditMode(false);

      setSuccess(
        "آپ کی ممبرشپ درخواست کامیابی سے جمع ہوگئی ہے۔"
      );

      setFormData(emptyForm);

      setPhoto(null);
      setPhotoPreview("");

      setPortfolioPhotos([]);
      setPortfolioPreview([]);

      setExistingPortfolioPhotos([]);

      setVideos([
        "",
        "",
        "",
        "",
        ""
      ]);

      const fileInputs =
        document.querySelectorAll(
          '.join-box input[type="file"]'
        );

      fileInputs.forEach(
        (input) => {
          input.value = "";
        }
      );

    } catch (error) {
      console.log(
        `Join ${websiteName} Error:`,
        error
      );

      setError(
        "درخواست جمع نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔"
      );

      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FIELD TITLE
  ===================================================== */

  const FieldTitle = ({
    english,
    urdu
  }) => (
    <div className="field-title">
      <span>{english}</span>
      <small>{urdu}</small>
    </div>
  );

  /* =====================================================
     GOOGLE LOADING
  ===================================================== */

  if (googleLoading) {
    return (
      <div className="join-page">
        <div className="join-box loading-screen">

          {websiteLogo ? (
            <div className="brand-logo">
              <img
                src={websiteLogo}
                alt={websiteName}
              />
            </div>
          ) : (
            <div className="brand-orb">
              <span>
                {websiteName}
              </span>
            </div>
          )}

          <h1>
            {websiteName}
          </h1>

          <p className="loading-text">
            Please wait...
          </p>

          <p className="urdu-line">
            براہِ کرم انتظار کریں۔
          </p>

        </div>
      </div>
    );
  }

  /* =====================================================
     GOOGLE LOGIN PAGE
  ===================================================== */

  if (!googleUser) {
    return (
      <div className="join-page">
        <div className="join-box login-page">

          <div className="hero-glow"></div>

          {websiteLogo ? (
            <div className="brand-logo">
              <img
                src={websiteLogo}
                alt={websiteName}
              />
            </div>
          ) : (
            <div className="brand-orb">
              <span>
                {websiteName}
              </span>
            </div>
          )}

          <div className="page-badge">
            MEMBER REGISTRATION
          </div>

          <h1>
            Join {websiteName}
          </h1>

          <p className="intro-text">
            Become an official registered
            member of {websiteName}.
          </p>

          <p className="urdu-line">
            آفیشل رجسٹرڈ ممبر بننے کے لیے
            Google Account سے جاری رکھیں۔
          </p>

          {error && (
            <div className="message-wrap">

              <div className="error-message">

                <strong>
                  Attention
                </strong>

                <span>
                  {error}
                </span>

              </div>

            </div>
          )}

          <div className="google-login-box">

            <div className="google-icon">
              G
            </div>

            <div className="login-copy">

              <h2>
                Continue with Google
              </h2>

              <p>
                Secure account verification
              </p>

              <small>
                Google Account کے ذریعے اپنی
                شناخت محفوظ طریقے سے مکمل کریں۔
              </small>

            </div>

            <button
              type="button"
              onClick={
                handleGoogleLogin
              }
              disabled={
                loginLoading
              }
            >
              {loginLoading
                ? "Signing in..."
                : "Continue with Google"}
            </button>

          </div>

          <div className="login-note">

            <span>●</span>

            <div>

              <strong>
                Why Google Login?
              </strong>

              <small>
                ایک Google Account ایک فعال
                ممبر پروفائل کے ساتھ منسلک رہے گا۔
              </small>

            </div>

          </div>

        </div>
      </div>
    );
  }

  /* =====================================================
     CHECKING MEMBER / REQUEST
  ===================================================== */

  if (memberChecking) {
    return (
      <div className="join-page">
        <div className="join-box loading-screen">

          <div className="google-user-box">

            <div className="google-user-photo">

              <img
                src={
                  googleUser.photoURL ||
                  websiteLogo ||
                  ""
                }
                alt={
                  googleUser.displayName ||
                  "Google Account"
                }
                referrerPolicy="no-referrer"
              />

            </div>

            <div className="google-user-info">

              <strong>
                {googleUser.displayName ||
                  "Google User"}
              </strong>

              <span>
                {googleUser.email ||
                  "Google Account"}
              </span>

              <small>
                Checking membership...
              </small>

            </div>

          </div>

          <div className="checking-loader">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <p className="urdu-line">
            ممبرشپ کی معلومات چیک کی جا رہی ہیں۔
          </p>

        </div>
      </div>
    );
  }

  /* =====================================================
     EXISTING ACTIVE MEMBER PAGE
  ===================================================== */

  if (
    googleUser &&
    existingMember &&
    !editMode
  ) {
    return (
      <div className="join-page">
        <div className="join-box member-found">

          <div className="page-badge">
            VERIFIED MEMBER
          </div>

          <h1>
            {websiteName}
          </h1>

          <p className="intro-text">
            Your Google Account is already
            connected with a registered member.
          </p>

          <p className="urdu-line">
            آپ کا Google Account پہلے سے ایک
            رجسٹرڈ ممبر پروفائل کے ساتھ منسلک ہے۔
          </p>

          <div className="member-card">

            <div className="member-card-photo">

              <img
                src={
                  existingMember.image ||
                  googleUser.photoURL ||
                  websiteLogo ||
                  ""
                }
                alt={
                  existingMember.name ||
                  "Member"
                }
                referrerPolicy="no-referrer"
              />

              <div className="verified-dot">
                ✓
              </div>

            </div>

            <div className="member-card-info">

              <span className="mini-label">
                REGISTERED MEMBER
              </span>

              <strong>
                {existingMember.name ||
                  googleUser.displayName ||
                  "Registered Member"}
              </strong>

              <span>
                {googleUser.email ||
                  existingMember.googleEmail ||
                  ""}
              </span>

              <small>
                آپ اپنی پروفائل کی معلومات براہِ راست
                اپڈیٹ کر سکتے ہیں۔
              </small>

            </div>

            <button
              type="button"
              className="logout-button"
              onClick={
                handleGoogleLogout
              }
              disabled={loading}
            >
              Logout
            </button>

          </div>

          {error && (
            <div className="message-wrap">

              <div className="error-message">

                <strong>
                  Attention
                </strong>

                <span>
                  {error}
                </span>

              </div>

            </div>
          )}

          {success && (
            <div className="message-wrap">

              <div className="success-message">

                <strong>
                  Profile Updated
                </strong>

                <span>
                  {success}
                </span>

              </div>

            </div>
          )}

          <button
            type="button"
            className="primary-action"
            onClick={
              startEditProfile
            }
            disabled={loading}
          >
            <span>
              Edit Profile
            </span>

            <small>
              اپنی پروفائل تبدیل کریں
            </small>

          </button>

          <button
            type="button"
            className="delete-profile-button"
            onClick={
              handleDeleteProfile
            }
            disabled={loading}
          >
            <span>
              Delete My Profile
            </span>

            <small>
              اپنی ممبر پروفائل مستقل طور پر حذف کریں
            </small>
          </button>

        </div>
      </div>
    );
  }

  /* =====================================================
     PENDING REQUEST PAGE
     FORM IS HIDDEN AFTER SUBMISSION
  ===================================================== */

  if (
    googleUser &&
    existingRequest &&
    !editMode
  ) {
    return (
      <div className="join-page">
        <div className="join-box member-found">

          <div className="page-badge">
            REQUEST SUBMITTED
          </div>

          <h1>
            {websiteName}
          </h1>

          <p className="intro-text">
            Your membership request has
            already been submitted.
          </p>

          <p className="urdu-line">
            آپ کی ممبرشپ درخواست پہلے ہی جمع ہو چکی ہے
            اور ایڈمن کی منظوری کا انتظار ہے۔
          </p>

          <div className="member-card">

            <div className="member-card-photo">

              <img
                src={
                  existingRequest.image ||
                  googleUser.photoURL ||
                  websiteLogo ||
                  ""
                }
                alt={
                  existingRequest.name ||
                  "Member"
                }
                referrerPolicy="no-referrer"
              />

              <div
                className="account-status"
              >
                ✓
              </div>

            </div>

            <div className="member-card-info">

              <span className="mini-label">
                PENDING REQUEST
              </span>

              <strong>
                {existingRequest.name ||
                  googleUser.displayName ||
                  "Membership Request"}
              </strong>

              <span>
                {googleUser.email ||
                  existingRequest.googleEmail ||
                  ""}
              </span>

              <small>
                آپ کی درخواست ایڈمن کی منظوری کے لیے موجود ہے۔
              </small>

            </div>

            <button
              type="button"
              className="logout-button"
              onClick={
                handleGoogleLogout
              }
              disabled={loading}
            >
              Logout
            </button>

          </div>

          {success && (
            <div className="message-wrap">

              <div className="success-message">

                <strong>
                  Request Updated
                </strong>

                <span>
                  {success}
                </span>

              </div>

            </div>
          )}

          {error && (
            <div className="message-wrap">

              <div className="error-message">

                <strong>
                  Attention
                </strong>

                <span>
                  {error}
                </span>

              </div>

            </div>
          )}

          <button
            type="button"
            className="primary-action"
            onClick={
              startEditProfile
            }
            disabled={loading}
          >
            <span>
              Edit Request
            </span>

            <small>
              اپنی جمع شدہ درخواست میں تبدیلی کریں
            </small>

          </button>

          <button
            type="button"
            className="delete-profile-button"
            onClick={
              handleDeleteProfile
            }
            disabled={loading}
          >
            <span>
              Delete My Request
            </span>

            <small>
              اپنی ممبرشپ درخواست مستقل طور پر حذف کریں
            </small>
          </button>

        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN FORM
  ===================================================== */

  return (
    <div className="join-page">

      <div className="join-box form-page">

        <div className="hero-glow"></div>

        <div className="form-header">

          <div className="page-badge">
            {editMode
              ? existingRequest
                ? "REQUEST EDIT"
                : "PROFILE EDIT"
              : "MEMBER REGISTRATION"}
          </div>

          {websiteLogo && (
            <div className="form-brand-logo">

              <img
                src={websiteLogo}
                alt={websiteName}
              />

            </div>
          )}

          <h1>
            {editMode
              ? existingRequest
                ? "Edit Request"
                : "Edit Profile"
              : `Join ${websiteName}`}
          </h1>

          <p className="intro-text">
            {editMode
              ? existingRequest
                ? `Update your ${websiteName} membership request.`
                : `Update your ${websiteName} member profile.`
              : "Create your official registered member profile."}
          </p>

          <p className="urdu-line">
            {editMode
              ? "اپنی ممبر پروفائل یا درخواست کی معلومات تبدیل کریں۔"
              : "اپنی ممبر پروفائل بنانے کے لیے نیچے دی گئی معلومات مکمل کریں۔"}
          </p>

        </div>

        <div className="google-user-box">

          <div className="google-user-photo">

            <img
              src={
                googleUser.photoURL ||
                websiteLogo ||
                ""
              }
              alt={
                googleUser.displayName ||
                "Google Account"
              }
              referrerPolicy="no-referrer"
            />

            <div className="account-status">
              ✓
            </div>

          </div>

          <div className="google-user-info">

            <strong>
              {googleUser.displayName ||
                "Google User"}
            </strong>

            <span>
              {googleUser.email ||
                "Google Account"}
            </span>

            <small>
              Google Account Connected
            </small>

          </div>

          <button
            type="button"
            onClick={
              handleGoogleLogout
            }
            disabled={loading}
          >
            Logout
          </button>

        </div>

        {error && (
          <div
            className="message-wrap top-message"
            ref={messageRef}
          >
            <div className="error-message">

              <div className="message-icon">
                !
              </div>

              <div>

                <strong>
                  Something went wrong
                </strong>

                <span>
                  {error}
                </span>

              </div>

            </div>
          </div>
        )}

        {success && (
          <div
            className="message-wrap top-message"
            ref={messageRef}
          >
            <div className="success-message">

              <div className="message-icon">
                ✓
              </div>

              <div>

                <strong>
                  {editMode
                    ? "Profile Updated"
                    : "Request Submitted"}
                </strong>

                <span>
                  {success}
                </span>

              </div>

            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* =================================================
             SECTION 01
          ================================================= */}

          <section className="form-section">

            <div className="section-heading">

              <span className="section-number">
                01
              </span>

              <div>

                <h2>
                  Personal Information
                </h2>

                <p>
                  ذاتی معلومات
                </p>

              </div>

            </div>

            <div className="field-grid">

              <div className="field">

                <FieldTitle
                  english="Full Name"
                  urdu="پورا نام"
                />

                <input
                  name="name"
                  placeholder="Enter your full name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="field">

                <FieldTitle
                  english="Father Name"
                  urdu="والد کا نام"
                />

                <input
                  name="fatherName"
                  placeholder="Enter father's name"
                  value={
                    formData.fatherName
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="field">

                <FieldTitle
                  english="WhatsApp Number"
                  urdu="واٹس ایپ نمبر"
                />

                <input
                  name="phone"
                  type="tel"
                  placeholder="03XX XXXXXXX"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="field">

                <FieldTitle
                  english="City"
                  urdu="شہر"
                />

                <input
                  name="city"
                  placeholder="Enter your city"
                  value={
                    formData.city
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="field">

                <FieldTitle
                  english="Gender"
                  urdu="جنس"
                />

                <select
                  name="gender"
                  value={
                    formData.gender
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                </select>

              </div>

              <div className="field">

                <FieldTitle
                  english="Blood Group"
                  urdu="بلڈ گروپ"
                />

                <select
                  name="bloodGroup"
                  value={
                    formData.bloodGroup
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select blood group
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

            </div>

          </section>

          {/* =================================================
             SECTION 02
          ================================================= */}

          <section className="form-section">

            <div className="section-heading">

              <span className="section-number">
                02
              </span>

              <div>

                <h2>
                  Professional Information
                </h2>

                <p>
                  پیشہ ورانہ معلومات
                </p>

              </div>

            </div>

            <div className="field-grid">

              <div className="field">

                <FieldTitle
                  english="Studio Name"
                  urdu="اسٹوڈیو کا نام"
                />

                <input
                  name="studio"
                  placeholder="Enter studio name"
                  value={
                    formData.studio
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="field">

                <FieldTitle
                  english="Profession"
                  urdu="پیشہ"
                />

                <select
                  name="specialty"
                  value={
                    formData.specialty
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select profession
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

              <div className="field">

                <FieldTitle
                  english="Experience"
                  urdu="تجربہ"
                />

                <select
                  name="experience"
                  value={
                    formData.experience
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select experience
                  </option>

                  {Array.from(
                    {
                      length: 50
                    },
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

              <div className="field field-full">

                <FieldTitle
                  english="Google Business / Maps Address"
                  urdu="گوگل بزنس یا گوگل میپس کا پتہ"
                />

                <input
                  name="googleAddress"
                  placeholder="Paste your Google Business or Maps address"
                  value={
                    formData.googleAddress
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

          </section>

          {/* =================================================
             SECTION 03
          ================================================= */}

          <section className="form-section">

            <div className="section-heading">

              <span className="section-number">
                03
              </span>

              <div>

                <h2>
                  Profile Photo
                </h2>

                <p>
                  پروفائل تصویر
                </p>

              </div>

            </div>

            <div className="upload-card">

              <div className="upload-icon">
                ↑
              </div>

              <div className="upload-content">

                <h3>
                  Profile Photo
                </h3>

                <p>
                  Square photo recommended
                </p>

                <small>
                  1000 × 1000 pixels • Maximum 5MB
                </small>

              </div>

              <label className="upload-button">

                Choose Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleProfilePhoto
                  }
                />

              </label>

            </div>

            {photoPreview && (
              <div className="profile-preview-wrap">

                <img
                  src={photoPreview}
                  className="profile-preview"
                  alt="Profile preview"
                />

                <span>
                  Profile Preview
                </span>

              </div>
            )}

          </section>

          {/* =================================================
             SECTION 04
          ================================================= */}

          <section className="form-section">

            <div className="section-heading">

              <span className="section-number">
                04
              </span>

              <div>

                <h2>
                  Professional Details
                </h2>

                <p>
                  پیشہ ورانہ تفصیلات
                </p>

              </div>

            </div>

            <div className="field-stack">

              <div className="field">

                <FieldTitle
                  english="Complete Address"
                  urdu="مکمل پتہ"
                />

                <textarea
                  name="address"
                  placeholder="Enter your complete address"
                  value={
                    formData.address
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="field">

                <FieldTitle
                  english="Camera & Equipment"
                  urdu="کیمرہ اور آلات کی تفصیل"
                />

                <textarea
                  name="cameraDetails"
                  placeholder="Example: Sony A7 IV, Canon R6, DJI Drone..."
                  value={
                    formData.cameraDetails
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="field">

                <FieldTitle
                  english="Additional Message"
                  urdu="اضافی پیغام"
                />

                <textarea
                  name="message"
                  placeholder="Anything you would like to tell us"
                  value={
                    formData.message
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

          </section>

          {/* =================================================
             SECTION 05
          ================================================= */}

          <section className="form-section">

            <div className="section-heading">

              <span className="section-number">
                05
              </span>

              <div>

                <h2>
                  Photo Portfolio
                </h2>

                <p>
                  فوٹو پورٹ فولیو
                </p>

              </div>

            </div>

            <div className="portfolio-info">

              <div>

                <strong>
                  Maximum 10 Photos
                </strong>

                <span>
                  زیادہ سے زیادہ 10 تصاویر
                </span>

              </div>

              <div>

                <strong>
                  Maximum 5MB Each
                </strong>

                <span>
                  ہر تصویر زیادہ سے زیادہ 5MB
                </span>

              </div>

              <div>

                <strong>
                  5×7 / 7×5 Format
                </strong>

                <span>
                  پورٹریٹ یا لینڈ اسکیپ
                </span>

              </div>

            </div>

            {editMode &&
              existingPortfolioPhotos.length >
                0 && (
                <div className="portfolio-current">

                  <div className="sub-heading">

                    <strong>
                      Current Photos
                    </strong>

                    <span>
                      موجودہ تصاویر
                    </span>

                  </div>

                  <div className="portfolio-preview">

                    {existingPortfolioPhotos.map(
                      (
                        img,
                        index
                      ) => (
                        <div
                          className="portfolio-item"
                          key={`old-${index}`}
                        >

                          <img
                            src={img}
                            alt="Portfolio"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeExistingPortfolioPhoto(
                                index
                              )
                            }
                          >
                            ×
                          </button>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            <label className="large-upload">

              <div className="large-upload-icon">
                +
              </div>

              <strong>
                Add Portfolio Photos
              </strong>

              <span>
                Click to select photos
              </span>

              <small>
                {existingPortfolioPhotos.length +
                  portfolioPhotos.length}
                /10 photos
              </small>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={
                  handlePortfolio
                }
              />

            </label>

            {portfolioPreview.length >
              0 && (
              <div className="new-portfolio">

                <div className="sub-heading">

                  <strong>
                    New Photos
                  </strong>

                  <span>
                    نئی تصاویر
                  </span>

                </div>

                <div className="portfolio-preview">

                  {portfolioPreview.map(
                    (
                      img,
                      index
                    ) => (
                      <div
                        className="portfolio-item"
                        key={`new-${index}`}
                      >

                        <img
                          src={img}
                          alt="New Portfolio"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removePortfolioPhoto(
                              index
                            )
                          }
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          </section>

          {/* =================================================
             SECTION 06
          ================================================= */}

          <section className="form-section">

            <div className="section-heading">

              <span className="section-number">
                06
              </span>

              <div>

                <h2>
                  Video Portfolio
                </h2>

                <p>
                  ویڈیو پورٹ فولیو
                </p>

              </div>

            </div>

            <div className="video-intro">

              <strong>
                YouTube / Facebook / Vimeo / instagram links
              </strong>

              <span>
                اپنی بہترین ویڈیوز کے لنکس شامل کریں۔
              </span>

            </div>

            <div className="video-list">

              {videos.map(
                (
                  video,
                  index
                ) => (
                  <div
                    className="video-box"
                    key={index}
                  >

                    <div className="video-number">

                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </div>

                    <div className="video-input-area">

                      <span>
                        Video Link{" "}
                        {index + 1}
                      </span>

                      <input
                        type="text"
                        placeholder="Paste video link"
                        value={
                          video
                        }
                        onChange={(
                          e
                        ) =>
                          handleVideoChange(
                            index,
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {video &&
                      getEmbedUrl(
                        video
                      ) && (
                        <iframe
                          title={`video-${index}`}
                          src={getEmbedUrl(
                            video
                          )}
                          width="100%"
                          height="250"
                          frameBorder="0"
                          allowFullScreen
                        />
                      )}

                  </div>
                )
              )}

            </div>

          </section>

          {/* =================================================
             SUBMIT AREA
          ================================================= */}

          <div
            className="submit-area"
            ref={submitAreaRef}
          >

            <div className="submit-note">

              <span>
                ✓
              </span>

              <div>

                <strong>
                  {editMode
                    ? "Your changes will be saved directly."
                    : "Your information will be sent to Admin for approval."}
                </strong>

                <small>
                  {editMode
                    ? "آپ کی تبدیلیاں فوراً محفوظ ہو جائیں گی۔"
                    : "نئی ممبرشپ درخواست ایڈمن کی منظوری کے لیے بھیجی جائے گی۔"}
                </small>

              </div>

            </div>

            <button
              type="submit"
              className="main-submit"
              disabled={loading}
            >

              <span className="submit-main">

                {loading
                  ? editMode
                    ? "Updating..."
                    : "Submitting Request..."
                  : editMode
                    ? existingRequest
                      ? "Update My Request"
                      : "Update My Profile"
                    : "Submit Membership Request"}

              </span>

              <span className="submit-urdu">

                {loading
                  ? "براہِ کرم انتظار کریں"
                  : editMode
                    ? existingRequest
                      ? "درخواست اپڈیٹ کریں"
                      : "پروفائل اپڈیٹ کریں"
                    : "ممبرشپ درخواست جمع کریں"}

              </span>

            </button>

            {(success ||
              error) && (
              <div
                className="submit-message"
                ref={messageRef}
              >

                {success && (
                  <div className="success-message">

                    <div className="message-icon">
                      ✓
                    </div>

                    <div>

                      <strong>
                        {editMode
                          ? "Updated Successfully"
                          : "Request Submitted Successfully"}
                      </strong>

                      <span>
                        {success}
                      </span>

                    </div>

                  </div>
                )}

                {error && (
                  <div className="error-message">

                    <div className="message-icon">
                      !
                    </div>

                    <div>

                      <strong>
                        Please Check
                      </strong>

                      <span>
                        {error}
                      </span>

                    </div>

                  </div>
                )}

              </div>
            )}

            {editMode && (
              <>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    cancelEdit
                  }
                  disabled={loading}
                >
                  Cancel Editing
                </button>

                <button
                  type="button"
                  className="delete-profile-button"
                  onClick={
                    handleDeleteProfile
                  }
                  disabled={loading}
                >
                  <span>
                    {existingRequest
                      ? "Delete My Request"
                      : "Delete My Profile"}
                  </span>

                  <small>
                    اپنی معلومات مستقل طور پر حذف کریں
                  </small>
                </button>
              </>
            )}

          </div>

        </form>

      </div>
    </div>
  );
}

export default JoinOCMA;