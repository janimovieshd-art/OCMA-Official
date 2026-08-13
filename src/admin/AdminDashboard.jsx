import { 
useEffect,
useState
} from "react";


import {

FaUsers,
FaUserClock,
FaUserTie,
FaCertificate,
FaImages,
FaVideo,
FaGraduationCap,
FaBullhorn,
FaRobot,
FaMicrochip,
FaServer,
FaMemory,
FaNetworkWired,
FaCog,
FaBolt

} from "react-icons/fa";


import {

getData

} from "../services/firestoreService";


import OcmaLogo from "../assets/LOGO copy.PNG";


import "./AdminDashboard.css";




function AdminDashboard(){



const [booting,setBooting]=useState(true);


const [bootText,setBootText]=useState([]);


const [aiText,setAiText]=useState("");




const [stats,setStats]=useState({

members:0,

requests:0,

senior:0,

authority:0,

photos:0,

videos:0,

training:0,

announcements:0

});







const bootLines=[


"OCMA AI CORE INITIALIZING",


"POWER SYSTEM ONLINE",


"DATABASE CONNECTED",


"SECURITY MODULE ACTIVE",


"MEDIA CORE READY",


"SYSTEM ACCESS GRANTED"


];







const aiLines=[


"Scanning membership database",


"Checking OCMA authority records",


"Synchronizing media archive",


"Analyzing system activity",


"Updating AI control network",


"Security diagnostics running"


];










/* =========================
BOOT SYSTEM
========================= */


useEffect(()=>{


let i=0;



const timer=setInterval(()=>{


setBootText(prev=>[

...prev,

bootLines[i]

]);



i++;



if(i>=bootLines.length){


clearInterval(timer);



setTimeout(()=>{


setBooting(false);


},800);



}



},400);




return()=>clearInterval(timer);



},[]);












/* =========================
AI TYPING SYSTEM
========================= */


useEffect(()=>{


let line=0;


let char=0;


let typing;




const startTyping=()=>{



const text=aiLines[line];


setAiText("");

char=0;




typing=setInterval(()=>{



setAiText(prev=>

prev+text.charAt(char)

);



char++;





if(char>=text.length){



clearInterval(typing);



setTimeout(()=>{



line++;



if(line>=aiLines.length){

line=0;

}



startTyping();



},1200);



}



},60);



};






startTyping();





return()=>clearInterval(typing);



},[]);

// =========================
// DATABASE LOAD SYSTEM
// =========================


const loadStats=async()=>{


try{


const members=

await getData("members") || [];



const requests=

await getData("membership_requests") || [];



const senior=

await getData("senior_members") || [];



const authority=

await getData("authority") || [];



const training=

await getData("training") || [];



const announcements=

await getData("announcements") || [];





let photos=0;


let videos=0;





members.forEach(item=>{


photos +=

item.portfolio?.photos?.length || 0;



videos +=

item.portfolio?.videos?.length || 0;



});







setStats({


members:

members.filter(

x=>x.status==="ACTIVE"

).length,



requests:

requests.filter(

x=>!x.status || x.status==="PENDING"

).length,



senior:

senior.length,



authority:

authority.length,



photos,


videos,



training:

training.length,



announcements:

announcements.length



});



}



catch(error){


console.log(error);


}



};








useEffect(()=>{


loadStats();



},[]);











// =========================
// DASHBOARD CARDS DATA
// =========================



const cards=[


{

title:"ACTIVE MEMBERS",

value:stats.members,

icon:<FaUsers/>,

status:"MEMBERS DATABASE ONLINE"

},



{

title:"NEW REQUESTS",

value:stats.requests,

icon:<FaUserClock/>,

status:"REQUEST VERIFICATION"

},



{

title:"SENIOR COUNCIL",

value:stats.senior,

icon:<FaUserTie/>,

status:"COUNCIL RECORD ACTIVE"

},



{

title:"AUTHORITY",

value:stats.authority,

icon:<FaCertificate/>,

status:"CERTIFICATE SYSTEM"

},



{

title:"PHOTO ARCHIVE",

value:stats.photos,

icon:<FaImages/>,

status:"IMAGE CORE ACTIVE"

},



{

title:"VIDEO ARCHIVE",

value:stats.videos,

icon:<FaVideo/>,

status:"MEDIA SYSTEM ONLINE"

},



{

title:"TRAINING",

value:stats.training,

icon:<FaGraduationCap/>,

status:"COURSE MODULE"

},



{

title:"ANNOUNCEMENTS",

value:stats.announcements,

icon:<FaBullhorn/>,

status:"NOTICE NETWORK"

}

];







// =========================
// RETURN START
// =========================



return(


<>





{

booting &&



<div className="boot-screen">


<div className="boot-logo">


<FaRobot/>


</div>





<h1>

OCMA AI SYSTEM

</h1>






<div className="boot-lines">



{


bootText.map((line,index)=>(


<p key={index}>


{line}


</p>



))


}





</div>




</div>



}

<div className="ai-lab-dashboard">





<div className="matrix-data">


{

Array.from({

length:50

}).map((_,i)=>(


<span key={i}>


010101101001011010010101


</span>


))


}


</div>









<div className="lab-frame">







{/* =========================
HEADER
========================= */}



<div className="lab-header">



<div className="ai-symbol">


<FaRobot/>


</div>






<div>


<h1>

OCMA AI COMMAND CENTER

</h1>



<p>

INTELLIGENT ASSOCIATION CONTROL SYSTEM

</p>


</div>






<div className="system-status">


● ONLINE


</div>




</div>













{/* =========================
AI LIVE TERMINAL
========================= */}





<div className="ai-floating-text">



<FaMicrochip/>





<span>


&gt; {aiText}


</span>





<span className="cursor">


_


</span>




</div>













{/* =========================
TOP HUD
========================= */}





<div className="ai-hud">





<div>


<FaServer/>


<br/>


CPU CORE


<br/>


98% ACTIVE


</div>








<div>


<FaMemory/>


<br/>


MEMORY


<br/>


SYNC OK


</div>









<div>


<FaNetworkWired/>


<br/>


NETWORK


<br/>


CONNECTED


</div>








<div>


<FaCog/>


<br/>


AI ENGINE


<br/>


RUNNING


</div>





</div>













{/* =========================
AI CORE
========================= */}





<div className="ai-core">





<div className="gear gear-one"></div>


<div className="gear gear-two"></div>








<div className="energy-ring">






<div className="electric-particles">



<span></span>

<span></span>

<span></span>

<span></span>

<span></span>

<span></span>



</div>








<div className="logo-core">



<img

src={OcmaLogo}

alt="OCMA Logo"

/>



</div>







</div>








<h2>


OCMA AI CORE


</h2>







<span>


SYSTEM POWER 100%


</span>







</div>

{/* =========================
VOICE WAVE
========================= */}



<div className="voice-wave">


<span></span>

<span></span>

<span></span>

<span></span>

<span></span>


</div>









{/* =========================
AI SEARCH LINE
========================= */}



<div className="ai-search-line">



<FaBolt/>




AI SCANNING SYSTEM



● ● ●





</div>













{/* =========================
HOLOGRAM PANELS
========================= */}



<div className="hologram-panels">





{

cards.map((item,index)=>(



<div

className="data-panel"

key={index}

>





<div className="panel-light"></div>







<div className="panel-icon">


{item.icon}


</div>







<h2>


{item.value}


</h2>







<h3>


{item.title}


</h3>








<div className="panel-status">



<span></span>



{item.status}



● ● ●




</div>







</div>



))





}







</div>









</div>









</div>








</>





);


}





export default AdminDashboard;