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

// Gallery videos — a single multer .fields() call uploads both the video
// file and an optional thumbnail image together, so this storage needs to
// route each field to different Cloudinary params. `params` as a function
// (rather than a static object, like the storages above) lets it branch on
// `file.fieldname`: "video" gets resource_type "video" (required for
// Cloudinary to accept/transcode video), anything else (the "thumbnail"
// field) gets treated as a normal image.
export const mediaStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === "video") {
      return {
        folder: "khuma-aryal-foundation/videos",
        resource_type: "video",
        allowed_formats: ["mp4", "webm", "mov", "avi", "mkv"],
      };
    }
    return {
      folder: "khuma-aryal-foundation",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    };
  },
});

export default cloudinary;
