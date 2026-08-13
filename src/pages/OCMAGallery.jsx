import {
useEffect,
useState
} from "react";

import {
getData
} from "../services/firestoreService";

import "./OCMAGallery.css";



function OCMAGallery(){


const [gallery,setGallery] = useState([]);

const [loading,setLoading] = useState(true);

const [selectedIndex,setSelectedIndex] = useState(null);





const loadGallery = async()=>{


try{


const data = await getData("gallery");


const activePosts = data.filter(

item=>item.status==="ACTIVE"

);


setGallery(activePosts);


}

catch(error){

console.log(error);

}

finally{

setLoading(false);

}


};






useEffect(()=>{

loadGallery();

},[]);







return(


<div className="ocma-gallery-page">



<div className="gallery-header">


<h1>

OCMA OFFICIAL GALLERY

</h1>


<p>

Events • Ceremonies • Meetings • Association Activities

</p>


</div>






{

loading &&

<h3 className="gallery-loading">

Loading Gallery...

</h3>

}






{

!loading && gallery.length===0 &&

<h3 className="gallery-empty">

No Gallery Posts Available

</h3>

}







<div className="ocma-gallery-grid">


{

gallery.map((item,index)=>(


<div

className="ocma-gallery-card"

key={item.id}

>


<img

className="gallery-image"

src={item.image}

alt={item.title}

onClick={()=>setSelectedIndex(index)}

/>



<div className="gallery-info">


<h2>

{item.title}

</h2>



{

item.category &&

<span>

{item.category}

</span>

}



{

item.description &&

<p>

{item.description}

</p>

}



{

item.date &&

<small>

{item.date}

</small>

}


</div>



</div>


))

}


</div>







{

selectedIndex!==null && (


<div

className="gallery-popup"

onClick={()=>setSelectedIndex(null)}

>


<div

className="gallery-popup-box"

onClick={(e)=>e.stopPropagation()}

>


<button

className="popup-close"

onClick={()=>setSelectedIndex(null)}

>

×

</button>





<button

className="popup-prev"

onClick={()=>{

setSelectedIndex(

selectedIndex===0

?

gallery.length-1

:

selectedIndex-1

);

}}

>

❮

</button>





<img

className="popup-image"

src={gallery[selectedIndex].image}

alt={gallery[selectedIndex].title}

/>





<button

className="popup-next"

onClick={()=>{

setSelectedIndex(

selectedIndex===gallery.length-1

?

0

:

selectedIndex+1

);

}}

>

❯

</button>





<div className="popup-info">


<h2>

{gallery[selectedIndex].title}

</h2>



{

gallery[selectedIndex].category &&

<span>

{gallery[selectedIndex].category}

</span>

}



{

gallery[selectedIndex].description &&

<p>

{gallery[selectedIndex].description}

</p>

}



{

gallery[selectedIndex].date &&

<small>

{gallery[selectedIndex].date}

</small>

}


</div>



</div>


</div>


)

}





</div>


);


}



export default OCMAGallery;