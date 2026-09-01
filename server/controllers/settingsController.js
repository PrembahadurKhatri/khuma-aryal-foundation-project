import asyncHandler from "express-async-handler";
import Settings from "../models/Settings.js";

// Settings is a singleton — there is always exactly one document.
const getOrCreate = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

// @desc   Get site settings
// @route  GET /api/settings  (public)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate();
  res.json({ success: true, data: settings });
});

// @desc   Update site settings
// @route  PUT /api/settings  (admin)
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate();

  const {
    nameEn, nameNe, taglineEn, taglineNe, addressEn, addressNe, officeHoursEn, officeHoursNe, phone, email, facebook, instagram, youtube,
    statYears, statBeneficiaries, statProjects, statVolunteers,
    maintenanceEnabled, maintenanceMessage,
    metaTitle, metaDescription,
  } = req.body;

  settings.name = { en: nameEn ?? settings.name?.en, ne: nameNe ?? settings.name?.ne };
  settings.tagline = { en: taglineEn ?? settings.tagline?.en, ne: taglineNe ?? settings.tagline?.ne };
  settings.address = { en: addressEn ?? settings.address?.en, ne: addressNe ?? settings.address?.ne };
  settings.officeHours = { en: officeHoursEn ?? settings.officeHours?.en, ne: officeHoursNe ?? settings.officeHours?.ne };
  if (phone !== undefined) settings.phone = phone;
  if (email !== undefined) settings.email = email;
  settings.social = {
    facebook: facebook ?? settings.social?.facebook ?? "",
    instagram: instagram ?? settings.social?.instagram ?? "",
    youtube: youtube ?? settings.social?.youtube ?? "",
  };
  settings.stats = {
    years: statYears ?? settings.stats?.years,
    beneficiaries: statBeneficiaries ?? settings.stats?.beneficiaries,
    projects: statProjects ?? settings.stats?.projects,
    volunteers: statVolunteers ?? settings.stats?.volunteers,
  };
  // maintenanceEnabled arrives as a real boolean from the admin form, but
  // req.body can hand it back as the string "false" depending on how the
  // client serializes it — coerce explicitly rather than relying on JS
  // truthiness, where the string "false" is truthy and would leave
  // maintenance mode stuck on.
  if (maintenanceEnabled !== undefined) {
    settings.maintenanceMode = {
      enabled: maintenanceEnabled === true || maintenanceEnabled === "true",
      message: maintenanceMessage ?? settings.maintenanceMode?.message,
    };
  } else if (maintenanceMessage !== undefined) {
    settings.maintenanceMode = {
      enabled: settings.maintenanceMode?.enabled ?? false,
      message: maintenanceMessage,
    };
  }

  if (metaTitle !== undefined || metaDescription !== undefined) {
    settings.seo = {
      metaTitle: metaTitle ?? settings.seo?.metaTitle ?? "",
      metaDescription: metaDescription ?? settings.seo?.metaDescription ?? "",
    };
  }

  await settings.save();
  res.json({ success: true, data: settings });
});
