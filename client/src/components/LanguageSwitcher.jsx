import { useLanguage } from "../i18n/LanguageContext.jsx";
import { UKFlag, NepalFlag } from "./icons/Flags.jsx";

export default function LanguageSwitcher({ light = false }) {
  const { language, setLanguage, t } = useLanguage();

  const base = "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all duration-200";
  const activeClasses = light ? "bg-white text-forest-800 shadow-sm" : "bg-forest-600 text-white shadow-sm";
  const inactiveClasses = light ? "text-white/70 hover:text-white" : "text-ink-600 hover:text-forest-800";

  return (
    <div
      className={`flex items-center gap-1 rounded-full border p-1 backdrop-blur ${
        light ? "border-white/25 bg-white/5" : "border-forest-100 bg-white"
      }`}
      role="group"
      aria-label={t("common.language")}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`${base} ${language === "en" ? activeClasses : inactiveClasses}`}
        aria-pressed={language === "en"}
      >
        <UKFlag className="h-4 w-4 rounded-full ring-1 ring-black/5" />
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("ne")}
        className={`${base} ${language === "ne" ? activeClasses : inactiveClasses}`}
        aria-pressed={language === "ne"}
      >
        <NepalFlag className="h-4 w-4 rounded-full ring-1 ring-black/5" />
        ने
      </button>
    </div>
  );
}
