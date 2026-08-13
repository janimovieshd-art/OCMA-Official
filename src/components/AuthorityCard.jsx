import { useState } from "react";

import "./AuthorityCard.css";


function AuthorityCard({ member }) {


const [open,setOpen] = useState(false);



const whatsappNumber = member.phone
?.replace(/\D/g,"")
.replace(/^0/,"92");



return(


<>


<div className="authority-card">


<div className="certificate-preview">


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




<h3>
{member.name}
</h3>



<p>
{member.designation}
</p>




<div className="authority-buttons">



<button

type="button"

onClick={()=>setOpen(true)}

>

View Image

</button>





{

member.phone &&

<a

className="whatsapp-btn"

href={`https://wa.me/${whatsappNumber}`}

target="_blank"

rel="noopener noreferrer"

>

WhatsApp

</a>

}



</div>



</div>






{

open &&

<div

className="certificate-modal"

onClick={()=>setOpen(false)}

>


<div

className="modal-box"

onClick={(e)=>e.stopPropagation()}

>


<button

className="close-btn"

onClick={()=>setOpen(false)}

>

✕

</button>



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


</div>

}



</>


);


}


export default AuthorityCard;