import "./MemberCard.css";


function MemberCard({ member }) {



const whatsappNumber = member.phone
?.replace(/\D/g,"")
.replace(/^0/,"92");



return (



<div

className={`member-card ${
member.designation === "President"
?
"president-card"
:
""
}`}

>






{

(member.stars || 0) > 0 &&


<div className="member-stars">

{"⭐".repeat(member.stars || 0)}

</div>


}








<img


src={

member.image?.startsWith("http")

?

member.image

:

`/assets/${member.image}`


}


alt={member.name}


className="member-image"



/>








<h3>

{member.name}

</h3>







<p className="designation">

{member.designation}

</p>









{

member.phone &&



<a


href={`https://wa.me/${whatsappNumber}`}


target="_blank"


rel="noreferrer"


className="member-whatsapp-btn"



>

WhatsApp


</a>



}







</div>




);


}


export default MemberCard;