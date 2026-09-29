import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export function getSignedUploadParams(folder: string) {
  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  }
}

export async function deleteAsset(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}

export async function deleteFolder(weddingId: string, subpath = "") {
  const folderPath = `weddings/${weddingId}${subpath ? `/${subpath}` : ""}`
  if (folderPath.includes("..") || folderPath.includes("*")) {
    throw new Error("Invalid folder path")
  }
  await cloudinary.api.delete_resources_by_prefix(folderPath)
  await cloudinary.api.delete_folder(folderPath)
}

export { cloudinary }
