import { useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";


import { getData } from "../services/firestoreService";


import "./SeniorMembers.css";



function SeniorMembers() {



const [members,setMembers] = useState([]);



const [sectionTitle,setSectionTitle] = useState(
"All Senior Members of OCMA"
);



const [sectionDescription,setSectionDescription] = useState(
"Our respected senior members who have contributed their experience and services for the cameramen community."
);









const loadMembers = async()=>{


try{


const data = await getData("seniorMembers");



setMembers(data);



}

catch(error){


console.log(

"Senior Members Error:",

error

);


}



};









const loadSectionSettings = async()=>{


try{


const ref = doc(

db,

"websiteSettings",

"main"

);



const snap = await getDoc(ref);



if(snap.exists()){


const data = snap.data();



const settings = data.homepage?.seniorMembers;



if(settings){



setSectionTitle(

settings.title ||

"All Senior Members of OCMA"

);



setSectionDescription(

settings.description ||

"Our respected senior members who have contributed their experience and services for the cameramen community."

);



}



}



}



catch(error){


console.log(

"Senior Settings Error:",

error

);


}



};









useEffect(()=>{


loadMembers();


loadSectionSettings();



},[]);









return(



<section className="senior-section">





<h2>

{sectionTitle}

</h2>







<p className="senior-intro">

{sectionDescription}

</p>









<div className="senior-grid">







{


members.map((member)=>(




<div


className="senior-card"


key={member.id}



>







<img


src={member.image}


alt={member.name}


className="senior-image"


/>








<h3>

{member.name}

</h3>








<p className="senior-designation">

{member.designation}

</p>









<div className="senior-stars">


{"⭐".repeat(member.stars || 5)}


</div>









<p>

{member.phone}

</p>









<a


href={`https://wa.me/92${member.phone?.replace(/^0/,"")}`}


target="_blank"


rel="noreferrer"


className="senior-whatsapp"


>


🟢 WhatsApp Contact


</a>







</div>






))


}







</div>







</section>



);


}



export default SeniorMembers;