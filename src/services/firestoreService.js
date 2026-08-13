import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase/firebase";


// =====================================
// COLLECTION REFERENCE
// =====================================

export const getCollection = (name) => {
  return collection(db, name);
};


// =====================================
// ADD DATA
// =====================================

export const addData = async (collectionName, data) => {

  const ref = collection(db, collectionName);

  return await addDoc(ref, data);

};


// =====================================
// GET DATA
// =====================================

export const getData = async (collectionName) => {

  const ref = collection(db, collectionName);

  const snapshot = await getDocs(ref);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data()
  }));

};


// =====================================
// DELETE DATA
// =====================================

export const deleteData = async (collectionName, id) => {

  await deleteDoc(
    doc(
      db,
      collectionName,
      id
    )
  );

};


// =====================================
// UPDATE DATA
// =====================================

export const updateData = async (
  collectionName,
  id,
  data
) => {

  await updateDoc(
    doc(
      db,
      collectionName,
      id
    ),
    data
  );

};