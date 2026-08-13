import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";


import { getData } from "../services/firestoreService";


import "./OCMAGalleryPreview.css";



function OCMAGalleryPreview() {



const [gallery,setGallery] = useState([]);


const [loading,setLoading] = useState(true);



const [sectionTitle,setSectionTitle] = useState(
"OCMA Official Gallery"
);



const [sectionDescription,setSectionDescription] = useState(
"Events • Ceremonies • Meetings • Association Activities"
);



const [buttonText,setButtonText] = useState(
"View Complete Gallery"
);









const loadGallerySettings = async()=>{


try{


const ref = doc(

db,

"websiteSettings",

"main"

);



const snap = await getDoc(ref);



if(snap.exists()){


const data=snap.data();



const settings = data.homepage?.ocmaGallery;



if(settings){



setSectionTitle(

settings.title ||

"OCMA Official Gallery"

);



setSectionDescription(

settings.description ||

"Events • Ceremonies • Meetings • Association Activities"

);



setButtonText(

settings.buttonText ||

"View Complete Gallery"

);



}



}



}



catch(error){


console.log(

"Gallery Settings Error:",

error

);


}


};









useEffect(()=>{


const loadGallery = async()=>{


try{


const data = await getData("gallery");



const activePosts = data.filter(


item =>


item.status==="ACTIVE"

&&

item.image


);



setGallery(

activePosts.slice(0,8)

);



}


catch(error){


console.log(

"Gallery Load Error:",

error

);


}



finally{


setLoading(false);


}



};





loadGallery();


loadGallerySettings();



},[]);









return(



<section className="ocma-preview">






<div className="preview-title">



<h1>

{sectionTitle}

</h1>




<p>

{sectionDescription}

</p>



</div>









{

loading &&


<div className="preview-loading">


Loading Gallery...


</div>


}









{

!loading && gallery.length===0 &&


<div className="preview-empty">


No Gallery Available


</div>


}









<div className="preview-grid">





{


gallery.map((item)=>(



<div


className="preview-card"


key={item.id}


>




<img


src={item.image}


alt={item.title}


/>






<div className="preview-overlay">



<h3>

{item.title}

</h3>



</div>






</div>



))


}




</div>









<div className="preview-button">



<Link


to="/ocma-gallery"


className="gallery-btn"


>


{buttonText}


</Link>



</div>







</section>



);


}



export default OCMAGalleryPreview;