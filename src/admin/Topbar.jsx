import { FaUserCircle } from "react-icons/fa";

import "./Topbar.css";


function Topbar() {


  return (

    <header className="topbar">


      <h2>
        OCMA Management System
      </h2>



      <div className="admin-profile">


        <FaUserCircle />


        <span>
          Admin
        </span>


      </div>


    </header>

  );


}


export default Topbar;