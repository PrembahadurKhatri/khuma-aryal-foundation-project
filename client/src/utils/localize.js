// Resolves a bilingual content field — e.g. { en: "Founder", ne: "संस्थापक" } —
// to a plain string for the active language. Falls back to English, then to
// the raw value itself, so the UI never renders "[object Object]" if a
// translation is missing (e.g. a new CMS entry added without Nepali text yet).
export function pick(field, language) {
  if (field == null) return "";
  if (typeof field === "string") return field;
  return field[language] ?? field.en ?? Object.values(field)[0] ?? "";
}
