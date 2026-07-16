import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a Base64 image string to Cloudinary and returns the secure URL.
 */
export async function uploadToCloudinary(fileUri: string, folderName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      fileUri,
      {
        folder: folderName, // e.g., "medvision_original" or "medvision_predicted"
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          reject(error);
        } else {
          resolve(result.secure_url); // Returns the URL to save in MongoDB
        }
      }
    );
  });
}

export default cloudinary;