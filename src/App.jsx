import { BrowserRouter, Routes, Route } from "react-router-dom";


// PUBLIC PAGES
import Home from "./pages/Home";
import JoinOCMA from "./pages/JoinOCMA";
import MemberProfile from "./pages/MemberProfile";
import MembersPage from "./pages/MembersPage";
import OCMAGallery from "./pages/OCMAGallery";



// ADMIN
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import ProtectedRoute from "./admin/ProtectedRoute";

import AdminGallery from "./admin/AdminGallery";

import SeniorMembers from "./admin/seniorMembers/SeniorMembers";
import Authority from "./admin/authority/Authority";
import Announcements from "./admin/Announcements";
import MemberRequests from "./admin/MemberRequests";
import Members from "./admin/members/Members";


// SETTINGS
import Settings from "./admin/Settings";


import "./App.css";



function App(){


return(


<BrowserRouter>


<Routes>



{/* =====================
PUBLIC WEBSITE
===================== */}



<Route 
path="/"
element={<Home />}
/>



<Route
path="/members"
element={<MembersPage />}
/>



<Route
path="/join-ocma"
element={<JoinOCMA />}
/>



<Route
path="/member/:memberId"
element={<MemberProfile />}
/>



<Route
path="/ocma-gallery"
element={<OCMAGallery />}
/>






{/* =====================
ADMIN LOGIN
===================== */}



<Route
path="/admin/login"
element={<AdminLogin />}
/>







{/* =====================
ADMIN PANEL
===================== */}



<Route

path="/admin"

element={<ProtectedRoute />}

>



<Route

element={<AdminLayout />}

>



<Route

index

element={<AdminDashboard />}

/>




<Route

path="member-requests"

element={<MemberRequests />}

/>



<Route

path="members"

element={<Members />}

/>



<Route

path="authority"

element={<Authority />}

/>



<Route

path="senior-members"

element={<SeniorMembers />}

/>



<Route

path="announcements"

element={<Announcements />}

/>



<Route

path="gallery"

element={<AdminGallery />}

/>



<Route

path="settings"

element={<Settings />}

/>



</Route>


</Route>



</Routes>


</BrowserRouter>


);


}


export default App;