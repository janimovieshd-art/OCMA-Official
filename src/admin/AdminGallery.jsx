import {
  useEffect,
  useState
} from "react";


import {
  addData,
  getData,
  deleteData
} from "../services/firestoreService";


import {
  uploadImage
} from "../services/cloudinary";


import "./AdminGallery.css";



function AdminGallery(){


const [title,setTitle] = useState("");

const [description,setDescription] = useState("");

const [category,setCategory] = useState("Event");


const [image,setImage] = useState(null);

const [preview,setPreview] = useState("");


const [gallery,setGallery] = useState([]);


const [loading,setLoading] = useState(false);


const [message,setMessage] = useState("");

const [error,setError] = useState("");





const categories=[

"Event",

"Ceremony",

"Election",

"Meeting",

"Workshop",

"Training",

"Award",

"Other"

];








// IMAGE SELECT

const handleImage=(e)=>{


const file=e.target.files[0];


if(!file) return;



if(!file.type.startsWith("image/")){


setError(
"صرف تصویر فائل اپلوڈ کریں۔"
);


return;


}



if(file.size > 5 * 1024 * 1024){


setError(
"تصویر کا سائز 5MB سے زیادہ نہیں ہونا چاہیے۔"
);


return;


}



setImage(file);


setPreview(

URL.createObjectURL(file)

);


setError("");



};









// LOAD GALLERY

const loadGallery=async()=>{


try{


const data = await getData("gallery");


setGallery(data);



}

catch(error){


console.log(error);


}



};









useEffect(()=>{


loadGallery();


},[]);









// SUBMIT POST

const handleSubmit=async(e)=>{


e.preventDefault();


setError("");

setMessage("");



if(!image){


setError(
"براہ کرم تصویر منتخب کریں۔"
);


return;


}





try{


setLoading(true);



const imageUrl = await uploadImage(image);





await addData(

"gallery",

{


title,


description,


category,


image:imageUrl,


status:"ACTIVE",


date:new Date().toLocaleDateString(),


createdAt:new Date().toISOString()


}


);






setMessage(
"Gallery post کامیابی سے شامل ہوگئی۔"
);




setTitle("");

setDescription("");

setCategory("Event");

setImage(null);

setPreview("");



loadGallery();



}


catch(error){


console.log(error);


setError(
"Gallery post upload نہیں ہو سکی۔"
);


}



finally{


setLoading(false);


}



};









// DELETE POST

const handleDelete=async(id)=>{


const confirmDelete = window.confirm(

"کیا آپ یہ پوسٹ delete کرنا چاہتے ہیں؟"

);



if(!confirmDelete) return;



try{


await deleteData(

"gallery",

id

);



loadGallery();



}


catch(error){


console.log(error);


}



};









return(


<div className="admin-gallery">



<div className="gallery-box">



<h1>

OCMA Gallery Management

</h1>



<p>

Events • Ceremonies • Elections • Official Posts

</p>






{
message &&

<div className="success-box">

{message}

</div>

}






{
error &&

<div className="error-box">

{error}

</div>

}







<form onSubmit={handleSubmit}>



<input

type="text"

placeholder="Post Title"

value={title}

onChange={(e)=>

setTitle(e.target.value)

}

required

/>







<textarea

placeholder="Post Description"

value={description}

onChange={(e)=>

setDescription(e.target.value)

}

/>







<select

value={category}

onChange={(e)=>

setCategory(e.target.value)

}

>


{

categories.map((item)=>(


<option

key={item}

>

{item}

</option>


))


}


</select>







<input

type="file"

accept="image/*"

onChange={handleImage}

required

/>








{

preview &&


<img

src={preview}

className="gallery-preview"

alt="preview"

/>


}







<button

disabled={loading}

>


{

loading

?

"Uploading..."

:

"Publish Gallery Post"

}



</button>







</form>




</div>









<div className="gallery-list">





{

gallery.map((item)=>(


<div

className="gallery-card"

key={item.id}

>


<img

src={item.image}

alt={item.title}

/>





<div className="gallery-info">


<h2>

{item.title}

</h2>



<span>

{item.category}

</span>



<p>

{item.description}

</p>




<button

onClick={()=>handleDelete(item.id)}

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



export default AdminGallery;