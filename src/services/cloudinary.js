const CLOUD_NAME = "go6yojyn";

const UPLOAD_PRESET = "ocma_upload";





// Single Image Upload
export const uploadImage = async (file) => {


  const formData = new FormData();


  formData.append(
    "file",
    file
  );


  formData.append(
    "upload_preset",
    UPLOAD_PRESET
  );



  const response = await fetch(

    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

    {

      method:"POST",

      body:formData,

    }

  );



  const data = await response.json();



  return data.secure_url;


};








// Multiple Images Upload
export const uploadImages = async (files)=>{


  const uploadedImages = [];



  for(const file of files){


    const url = await uploadImage(file);


    uploadedImages.push(url);


  }



  return uploadedImages;


};