import { useEffect, useState } from "react";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  db
} from "../firebase/firebase";


import {
  getData
} from "../services/firestoreService";


import AuthorityCard from "./AuthorityCard";

import "./Authority.css";



function Authority(){


const [members,setMembers]=useState([]);


const [title,setTitle]=useState(
"OCMA Authority"
);


const [description,setDescription]=useState(
"Official leadership and management authority of OCMA."
);


const [supremeTitle,setSupremeTitle]=useState(
"Supreme Council"
);


const [electionTitle,setElectionTitle]=useState(
"Election Commission"
);






const loadAuthority = async()=>{


try{


const data = await getData("authority");


setMembers(data);


}catch(error){


console.log(error);


}


};








const loadSectionSettings=async()=>{


try{


const ref=doc(

db,

"websiteSettings",

"main"

);



const snap=await getDoc(ref);



if(snap.exists()){


const data=snap.data();



const section=data.homepage?.authority;



if(section){


setTitle(

section.title ||

"OCMA Authority"

);



setDescription(

section.description ||

"Official leadership and management authority of OCMA."

);



setSupremeTitle(

section.supremeTitle ||

"Supreme Council"

);



setElectionTitle(

section.electionTitle ||

"Election Commission"

);



}



}



}catch(error){


console.log(

"Authority Settings Error:",

error

);


}



};







useEffect(()=>{


loadAuthority();


loadSectionSettings();


},[]);









const supremeCouncil = members.filter(

(member)=>

member.type === "Supreme Council"

);





const electionCommission = members.filter(

(member)=>

member.type === "Election Commission"

);








return(


<section className="authority-section">



<h2>

{title}

</h2>



<p className="authority-intro">

{description}

</p>







{

supremeCouncil.length>0 &&


<div className="authority-group">


<h3>

{supremeTitle}

</h3>



<div className="authority-grid">


{

supremeCouncil.map((member)=>(


<AuthorityCard

key={member.id}

member={member}

/>


))

}



</div>


</div>


}









{

electionCommission.length>0 &&


<div className="authority-group">


<h3>

{electionTitle}

</h3>



<div className="authority-grid">


{

electionCommission.map((member)=>(


<AuthorityCard

key={member.id}

member={member}

/>


))

}



</div>


</div>


}







</section>


);


}


export default Authority;