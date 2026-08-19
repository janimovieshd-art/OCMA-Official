import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase/firebase";


// =====================================================
// RATINGS COLLECTION
// =====================================================

const ratingsCollection = "ratings";


// =====================================================
// CHECK EXISTING RATING
// =====================================================
// ایک Google user ایک ہی member کو دوبارہ rate نہ کر سکے
// =====================================================

export const getUserRating = async (
  memberId,
  userId
) => {

  try {

    if (!memberId || !userId) {
      return null;
    }


    const ratingsRef =
      collection(
        db,
        ratingsCollection
      );


    const ratingQuery =
      query(
        ratingsRef,

        where(
          "memberId",
          "==",
          memberId
        ),

        where(
          "userId",
          "==",
          userId
        )
      );


    const snapshot =
      await getDocs(
        ratingQuery
      );


    if (
      snapshot.empty
    ) {

      return null;

    }


    const ratingDoc =
      snapshot.docs[0];


    return {

      id:
        ratingDoc.id,

      ...ratingDoc.data()

    };

  }

  catch (error) {

    console.log(
      "Get User Rating Error:",
      error
    );

    throw error;

  }

};


// =====================================================
// ADD RATING
// =====================================================

export const addRating = async ({
  memberId,
  userId,
  userName,
  userEmail,
  userPhoto,
  rating,
  review
}) => {

  try {

    if (
      !memberId ||
      !userId
    ) {

      throw new Error(
        "Member ID and User ID are required."
      );

    }


    // -----------------------------------------------
    // CHECK IF USER ALREADY RATED THIS MEMBER
    // -----------------------------------------------

    const existingRating =
      await getUserRating(
        memberId,
        userId
      );


    if (existingRating) {

      throw new Error(
        "You have already rated this member."
      );

    }


    // -----------------------------------------------
    // VALIDATE RATING
    // -----------------------------------------------

    const numericRating =
      Number(rating);


    if (
      numericRating < 1 ||
      numericRating > 5
    ) {

      throw new Error(
        "Rating must be between 1 and 5."
      );

    }


    // -----------------------------------------------
    // ADD TO FIRESTORE
    // -----------------------------------------------

    const ratingsRef =
      collection(
        db,
        ratingsCollection
      );


    const ratingData = {

      memberId,

      userId,

      userName:
        userName || "",

      userEmail:
        userEmail || "",

      userPhoto:
        userPhoto || "",

      rating:
        numericRating,

      review:
        review?.trim() || "",

      createdAt:
        serverTimestamp()

    };


    const result =
      await addDoc(
        ratingsRef,
        ratingData
      );


    return {

      id:
        result.id,

      ...ratingData

    };

  }

  catch (error) {

    console.log(
      "Add Rating Error:",
      error
    );

    throw error;

  }

};


// =====================================================
// GET MEMBER RATINGS
// =====================================================

export const getMemberRatings = async (
  memberId
) => {

  try {

    if (!memberId) {
      return [];
    }


    const ratingsRef =
      collection(
        db,
        ratingsCollection
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


    return snapshot.docs.map(
      (item) => ({

        id:
          item.id,

        ...item.data()

      })
    );

  }

  catch (error) {

    console.log(
      "Get Member Ratings Error:",
      error
    );

    throw error;

  }

};


// =====================================================
// GET MEMBER RATING SUMMARY
// =====================================================

export const getMemberRatingSummary = async (
  memberId
) => {

  try {

    const ratings =
      await getMemberRatings(
        memberId
      );


    if (
      ratings.length === 0
    ) {

      return {

        average:
          0,

        count:
          0,

        ratings: []

      };

    }


    const total =
      ratings.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.rating || 0
          ),
        0
      );


    const average =
      total /
      ratings.length;


    return {

      average:
        Number(
          average.toFixed(1)
        ),

      count:
        ratings.length,

      ratings

    };

  }

  catch (error) {

    console.log(
      "Rating Summary Error:",
      error
    );

    throw error;

  }

};