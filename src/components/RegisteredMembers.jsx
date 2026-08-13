import { useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";


import {
  getData
} from "../services/firestoreService";


import RegisteredMemberCard from "./RegisteredMemberCard";


import "./RegisteredMembers.css";



function RegisteredMembers(){


const [members,setMembers] = useState([]);


const [search,setSearch] = useState("");


const [profession,setProfession] = useState("All");


const [city,setCity] = useState("All");



const [sectionTitle,setSectionTitle] = useState(
"Registered Professional Members"
);



const [sectionDescription,setSectionDescription] = useState(
"Verified photographers, videographers and media professionals of OCMA."
);



const [searchPlaceholder,setSearchPlaceholder] = useState(
"Search Name, Number, Profession or OCMA ID..."
);








const professions = [


"All",

"Photographer",

"Videographer",

"Cinematographer",

"Editor",

"Drone Operator",

"Other"


];









const loadMembers = async()=>{


try{


const data = await getData("members");



const activeMembers = data.filter(


(member)=>

member.status === "ACTIVE"


);



setMembers(activeMembers);



}


catch(error){


console.log(

"Members Load Error:",

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



const settings = data.homepage?.registeredMembers;



if(settings){



setSectionTitle(

settings.title ||

"Registered Professional Members"

);



setSectionDescription(

settings.description ||

"Verified photographers, videographers and media professionals of OCMA."

);



setSearchPlaceholder(

settings.searchPlaceholder ||

"Search Name, Number, Profession or OCMA ID..."

);



}



}



}



catch(error){


console.log(

"Registered Section Settings Error:",

error

);


}


};









useEffect(()=>{


loadMembers();


loadSectionSettings();



},[]);









const cities = [


"All",


...new Set(


members

.map(

(member)=>member.city

)

.filter(Boolean)


)


];









const filteredMembers = members.filter((member)=>{


const text = search.toLowerCase();




const searchMatch =


member.name?.toLowerCase().includes(text)



||



member.city?.toLowerCase().includes(text)



||



member.specialty?.toLowerCase().includes(text)



||



member.memberId?.toLowerCase().includes(text)



||



member.phone?.includes(text);







const professionMatch =


profession === "All"



||



member.specialty === profession;







const cityMatch =


city === "All"



||



member.city === city;







return(

searchMatch

&&

professionMatch

&&

cityMatch

);



});









return(


<section className="registered-members">



<div className="registered-header">





<h2>

{sectionTitle}

</h2>






<p>

{sectionDescription}

</p>







<input


type="text"


placeholder={searchPlaceholder}


value={search}


onChange={(e)=>

setSearch(e.target.value)

}


/>









<div className="profession-filter">



{


professions.map((item)=>(



<button


key={item}


className={

profession === item

?

"active-filter"

:

""

}



onClick={()=>setProfession(item)}


>


{item}


</button>



))


}




</div>









<select


className="city-filter"


value={city}


onChange={(e)=>

setCity(e.target.value)

}


>


<option value="All">

🔍 Search City

</option>





{


cities

.filter(

(item)=>item !== "All"

)

.map((item)=>(



<option

key={item}

value={item}

>


📍 {item}


</option>



))


}



</select>







</div>









<div className="registered-grid">





{


filteredMembers.map((member)=>(



<RegisteredMemberCard


key={member.id}


member={member}


/>



))


}




</div>









{

filteredMembers.length === 0 &&



<h3 className="no-members">


No Member Found


</h3>



}








</section>


);


}



export default RegisteredMembers;