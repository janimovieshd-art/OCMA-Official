import { useNavigate } from "react-router-dom";

import {
  FaHome,
  FaUsers,
  FaCertificate,
  FaUserTie,
  FaBullhorn,
  FaImages,
  FaGraduationCap,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";


import { logoutAdmin } from "../firebase/auth";


import "./Sidebar.css";



function Sidebar() {


  const navigate = useNavigate();




  const handleLogout = async()=>{


    await logoutAdmin();


    navigate("/admin/login");


  };





  return (


    <aside className="sidebar">



      <div className="sidebar-logo">


        <h2>
          OCMA
        </h2>


        <span>
          Admin Panel
        </span>


      </div>





      <nav>



        <a onClick={()=>navigate("/admin")}>

          <FaHome />

          Dashboard

        </a>





        <a onClick={()=>navigate("/admin/member-requests")}>

          <FaUsers />

          Member Requests

        </a>





        <a onClick={()=>navigate("/admin/members")}>

          <FaUsers />

          Members

        </a>





        <a onClick={()=>navigate("/admin/authority")}>

          <FaCertificate />

          Authority

        </a>





        <a onClick={()=>navigate("/admin/senior-members")}>

          <FaUserTie />

          Senior Members

        </a>





        <a onClick={()=>navigate("/admin/announcements")}>

          <FaBullhorn />

          Announcements

        </a>





        <a onClick={()=>navigate("/admin/gallery")}>

          <FaImages />

          Gallery

        </a>





        





        <a onClick={()=>navigate("/admin/settings")}>

          <FaCog />

          Settings

        </a>




      </nav>





      <button

        className="logout-btn"

        onClick={handleLogout}

      >


        <FaSignOutAlt />

        Logout


      </button>




    </aside>


  );


}


export default Sidebar;