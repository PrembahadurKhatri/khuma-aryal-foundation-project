// One-off: uploads client/public/images/logo.jpg to Cloudinary so
// utils/emailTemplate.js can reference a permanent, always-public HTTPS URL
// instead of building one from CLIENT_URL (which is localhost in dev — not
// reachable by an email client's image-fetching servers).
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, "../../client/public/images/logo.jpg");

const result = await cloudinary.uploader.upload(logoPath, {
  folder: "khuma-aryal-foundation",
  public_id: "email-logo",
  overwrite: true,
});

console.log(result.secure_url);
