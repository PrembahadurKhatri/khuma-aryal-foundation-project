import { adToBs, bsToAd } from "@sbmdkl/nepali-date-converter";

export const NEPALI_MONTHS = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

// Library's documented supported range is 1921–2040 AD / 1978–2099 BS.
export const BS_YEAR_MIN = 1978;
export const BS_YEAR_MAX = 2099;

/** AD "YYYY-MM-DD" -> BS "YYYY-MM-DD", or null if out of range/invalid. */
export const safeAdToBs = (adDate) => {
  if (!adDate) return null;
  try {
    return adToBs(adDate);
  } catch {
    return null;
  }
};

/** BS "YYYY-MM-DD" -> AD "YYYY-MM-DD", or null if out of range/invalid. */
export const safeBsToAd = (bsDate) => {
  if (!bsDate) return null;
  try {
    return bsToAd(bsDate);
  } catch {
    return null;
  }
};

/** { year, month, day } (BS, 1-indexed month) parsed from a BS "YYYY-MM-DD" string. */
export const parseBs = (bsDate) => {
  if (!bsDate) return { year: "", month: "", day: "" };
  const [year, month, day] = bsDate.split("-");
  return { year, month: Number(month), day: Number(day) };
};

export const formatBs = (year, month, day) =>
  year && month && day ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
