import { useSiteInfo } from "../contexts/SiteInfoContext.jsx";

// Floating action button, fixed to the bottom-right of every public page
// (mounted once in MainLayout, alongside Navbar/Footer). Below the toast
// stack's z-[100] (see ToastContext.jsx) so a toast never gets hidden
// behind it, but above ordinary page content.
export default function WhatsAppButton() {
  const siteInfo = useSiteInfo();
  if (!siteInfo?.phone) return null;

  const digitsOnly = siteInfo.phone.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${digitsOnly}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_-6px_rgba(37,211,102,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-6px_rgba(37,211,102,0.65)] sm:bottom-7 sm:right-7"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.5 1.34 5.02L2 22l5.13-1.35a10 10 0 0 0 4.91 1.28h.01c5.52 0 10-4.48 10-10s-4.48-10-10.01-10Zm5.86 14.3c-.25.7-1.45 1.35-2 1.44-.51.08-1.16.11-1.87-.12a17 17 0 0 1-1.7-.63c-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.22-1.62-1.22-3.1 0-1.47.77-2.19 1.05-2.49.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.19.01.44-.07.68.53.25.6.85 2.08.93 2.23.08.15.13.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.76 1.26 1.63 2.04 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.17-.2.73-.86.93-1.15.2-.3.4-.24.66-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.08.13.08.75-.17 1.45Z" />
      </svg>
    </a>
  );
}
