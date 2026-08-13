import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../firebase/AuthContext";


function ProtectedRoute() {


  const { user, loading } = useAuth();



  if (loading) {


    return (

      <div
        style={{
          color:"white",
          textAlign:"center",
          marginTop:"50px"
        }}
      >

        Loading...

      </div>

    );


  }



  if (!user) {


    return (

      <Navigate to="/admin/login" replace />

    );


  }



  return <Outlet />;


}


export default ProtectedRoute;