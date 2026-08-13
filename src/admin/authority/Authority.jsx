import { useEffect, useState } from "react";

import {
  addData,
  getData,
  deleteData
} from "../../services/firestoreService";

import { uploadImage } from "../../services/cloudinary";

import "./Authority.css";


function Authority() {

  const collectionName = "authority";

  const [members, setMembers] = useState([]);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [type, setType] = useState("Supreme Council");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMembers = async () => {
    const data = await getData(collectionName);
    setMembers(data);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!name || !designation) return;

    try {

      setLoading(true);

      let imageUrl = "https://via.placeholder.com/600x450";

      if (image) {
        imageUrl = await uploadImage(image);
      }

      await addData(collectionName, {

        name,
        designation,
        type,
        phone,
        image: imageUrl,
        createdAt: new Date().toISOString()

      });

      setName("");
      setDesignation("");
      setPhone("");
      setImage(null);

      await loadMembers();

    } finally {

      setLoading(false);

    }

  };

  const handleDelete = async (id) => {

    await deleteData(collectionName, id);

    await loadMembers();

  };

  return (

    <div className="authority-admin">

      <h1>Authority Management</h1>

      <form
        className="authority-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          placeholder="Member Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Designation"
          value={designation}
          onChange={(e)=>setDesignation(e.target.value)}
        />

        <select
          value={type}
          onChange={(e)=>setType(e.target.value)}
        >
          <option>Supreme Council</option>
          <option>Election Commission</option>
        </select>

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e)=>setPhone(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e)=>setImage(e.target.files[0])}
        />

        <button type="submit">

          {loading ? "Saving..." : "Add Authority Member"}

        </button>

      </form>

      <div className="authority-list">

        {members.map((member)=>(

          <div
            className="admin-authority-card"
            key={member.id}
          >

            <img
              src={member.image}
              alt={member.name}
            />

            <h3>{member.name}</h3>

            <p>{member.designation}</p>

            <small>{member.type}</small>

            <p>{member.phone}</p>

            <button
              onClick={()=>handleDelete(member.id)}
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Authority;