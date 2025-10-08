import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function uploadBase64Image(base64Data, folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'agriconnect') {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
    return null
  }
  const res = await cloudinary.uploader.upload(base64Data, {
    folder,
    resource_type: 'image',
    overwrite: true,
  })
  return res?.secure_url || res?.url || null
}



