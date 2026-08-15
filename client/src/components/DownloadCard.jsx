import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";

const TYPE_LABELS = {
  AnnualReport: "Annual Report",
  Brochure: "Event Brochure",
  PressRelease: "Press Release",
  RegistrationForm: "Registration Form",
  Newsletter: "Newsletter",
  Other: "Document",
};

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5V8h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DownloadCard({ item }) {
  const { t, language } = useLanguage();
  const title = pick(item.title, language);

  return (
    <div className="flex items-center gap-4 rounded-xl2 border border-forest-100 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-600">
        <FileIcon />
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="w-fit rounded-full bg-forest-50 px-2.5 py-0.5 font-body text-[11px] font-semibold text-forest-700">{TYPE_LABELS[item.type] || TYPE_LABELS.Other}</span>
        <h3 className="font-body text-sm font-semibold text-forest-900 sm:text-base">{title}</h3>
      </div>
      <a
        href={item.file}
        target="_blank"
        rel="noreferrer"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-forest-700 px-4 py-2 font-body text-xs font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lift"
      >
        <DownloadIcon />
        {t("news.download")}
      </a>
    </div>
  );
}
