import { useEffect, useState } from "react";

import {
  addData,
  getData,
  deleteData
} from "../../services/firestoreService";

import { uploadImage } from "../../services/cloudinary";

import "./SeniorMembers.css";


function SeniorMembers(){


const collectionName="seniorMembers";


const [members,setMembers]=useState([]);


const [name,setName]=useState("");

const [designation,setDesignation]=useState("");

const [phone,setPhone]=useState("");

const [stars,setStars]=useState(5);

const [image,setImage]=useState(null);

const [loading,setLoading]=useState(false);





const loadMembers=async()=>{


const data=await getData(collectionName);

setMembers(data);


};




useEffect(()=>{


loadMembers();


},[]);






const handleSubmit=async(e)=>{


e.preventDefault();



if(!name || !designation) return;



try{


setLoading(true);



let imageUrl="https://via.placeholder.com/200";



if(image){

imageUrl=await uploadImage(image);

}





await addData(

collectionName,

{


name,

designation,

phone,

stars:Number(stars),

image:imageUrl,

createdAt:new Date().toISOString()


}

);




setName("");

setDesignation("");

setPhone("");

setStars(5);

setImage(null);



await loadMembers();



}

catch(error){

console.log(error);

}

finally{

setLoading(false);

}


};







const handleDelete=async(id)=>{


await deleteData(

collectionName,

id

);


await loadMembers();


};








return(


<div className="senior-container">


<h1>
Senior Members Management
</h1>





<form

className="senior-form"

onSubmit={handleSubmit}

>



<input

placeholder="Member Name"

value={name}

onChange={(e)=>setName(e.target.value)}

/>




<input

placeholder="Designation"

value={designation}

onChange={(e)=>setDesignation(e.target.value)}

/>





<input

placeholder="Phone Number"

value={phone}

onChange={(e)=>setPhone(e.target.value)}

/>





<input

type="number"

min="1"

max="5"

placeholder="Stars"

value={stars}

onChange={(e)=>setStars(e.target.value)}

/>





<input

type="file"

accept="image/*"

onChange={(e)=>setImage(e.target.files[0])}

/>





<button>

{
loading
?
"Saving..."
:
"Add Senior Member"
}

</button>




</form>







<div className="senior-table">



{

members.map((member)=>(



<div

className="senior-row"

key={member.id}

>



<div className="senior-photo">


<img

src={
member.image
?
member.image
:
"/assets/ocma-logo.png"
}

alt={member.name}

/>


</div>






<div className="senior-name">

{member.name}

</div>





<div className="senior-designation">

{member.designation}

</div>






<div className="senior-phone">

{member.phone}

</div>






<div className="senior-stars">

{"⭐".repeat(member.stars || 5)}

</div>






<div className="senior-actions">


{

member.phone &&

<a

className="whatsapp-btn"

href={`https://wa.me/${member.phone.replace(/\D/g,"").replace(/^0/,"92")}`}

target="_blank"

rel="noopener noreferrer"

>

WhatsApp

</a>

}



<button

className="delete-btn"

onClick={()=>handleDelete(member.id)}

>

Delete

</button>



</div>






</div>



))

}



</div>





</div>


);


}



export default SeniorMembers;