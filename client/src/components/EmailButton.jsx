import { useSiteInfo } from "../contexts/SiteInfoContext.jsx";

// Floating action button, fixed to the bottom-right of every public page
// (mounted once in MainLayout, alongside Navbar/Footer). Below the toast
// stack's z-[100] (see ToastContext.jsx) so a toast never gets hidden
// behind it, but above ordinary page content. Replaces the earlier
// WhatsApp version of this same button.
export default function EmailButton() {
  const siteInfo = useSiteInfo();
  if (!siteInfo?.email) return null;

  return (
    <a
      href={`mailto:${siteInfo.email}`}
      aria-label="Email us"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#EA4335] text-white shadow-[0_10px_28px_-6px_rgba(234,67,53,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-6px_rgba(234,67,53,0.65)] sm:bottom-7 sm:right-7"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M4 6.5 12 13l8-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
