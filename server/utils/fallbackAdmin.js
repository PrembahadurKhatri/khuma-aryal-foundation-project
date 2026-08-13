// The hardcoded fallback admin lets /admin/login work before MongoDB is
// configured or seeded. Its id is a sentinel string, not a Mongo ObjectId,
// so every place that would otherwise do User.findById(decoded.id) must
// special-case FALLBACK_ADMIN_ID first — a real lookup throws a CastError.
export const FALLBACK_ADMIN_ID = "local-fallback-admin";

export const fallbackAdminCredentials = {
  email: process.env.FALLBACK_ADMIN_EMAIL || "admin@khumaaryalfoundation.org",
  password: process.env.FALLBACK_ADMIN_PASSWORD || "ChangeMe123!",
};

export const isFallbackAdminLogin = (email, password) => {
  return (
    email?.toLowerCase() === fallbackAdminCredentials.email.toLowerCase() &&
    password === fallbackAdminCredentials.password
  );
};

export const fallbackAdminUser = {
  _id: FALLBACK_ADMIN_ID,
  name: "Admin",
  email: fallbackAdminCredentials.email,
  role: "admin",
  isActive: true,
};

// The fallback admin has no real Mongo _id, so it can never be a valid value
// for a User ref field (createdBy/etc.) — callers should omit those fields
// entirely rather than pass this sentinel through to Mongoose.
export const isFallbackAdminId = (id) => id === FALLBACK_ADMIN_ID;
