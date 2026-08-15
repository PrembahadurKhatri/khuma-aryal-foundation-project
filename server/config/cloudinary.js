import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Lets middleware/upload.js fall back to local disk storage if these three
// aren't all set (e.g. a fresh clone before Cloudinary is configured),
// rather than crashing on every upload.
export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "khuma-aryal-foundation",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
  },
});

// Separate storage for non-image documents (Notice attachments, Downloads).
// `resource_type: "raw"` is required for Cloudinary to accept/serve
// PDFs/docs — the image storage above defaults to "image" and would reject
// them.
export const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "khuma-aryal-foundation/documents",
    resource_type: "raw",
    allowed_formats: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
  },
});

export default cloudinary;
