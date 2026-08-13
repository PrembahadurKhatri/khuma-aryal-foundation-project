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

  const { nameEn, nameNe, taglineEn, taglineNe, addressEn, addressNe, officeHoursEn, officeHoursNe, phone, email, facebook, instagram, youtube } = req.body;

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

  await settings.save();
  res.json({ success: true, data: settings });
});
