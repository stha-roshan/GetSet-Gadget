import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

const configureCloudinary = () => {
  if (isConfigured) return;

  console.log("🔍 Cloudinary Config Check:");
  console.log(
    "Cloud Name:",
    process.env.CLOUDINARY_CLOUD_NAME ? "✅ Loaded" : "❌ Missing"
  );
  console.log(
    "API Key:",
    process.env.CLOUDINARY_API_KEY ? "✅ Loaded" : "❌ Missing"
  );
  console.log(
    "API Secret:",
    process.env.CLOUDINARY_API_SECRET ? "✅ Loaded" : "❌ Missing"
  );

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  isConfigured = true;
};

const uploadOnCloudinary = async (image) => {
  try {
    configureCloudinary()
    if (!image) return null;
    const result = await cloudinary.uploader.upload(image);
    return result;
  } catch (error) {
    console.log("something went wrong while uploading image", error.message);
    return null;
  }
};

export { uploadOnCloudinary };
