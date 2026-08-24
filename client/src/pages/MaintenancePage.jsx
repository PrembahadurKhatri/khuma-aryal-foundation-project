// Shown in place of the entire public site when Settings → Site Maintenance
// is toggled on (see admin/SettingsManage.jsx and MainLayout.jsx, which
// decides whether to render this instead of the normal route tree). Deliberately
// standalone — no Navbar/Footer — so there's nothing here that links back into
// a site that's currently down.
export default function MaintenancePage({ message }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-100 px-6 text-center font-body">
      <img src="/images/kaf.png" alt="Khuma Aryal Foundation" className="mb-6 h-20 w-20 rounded-full object-cover shadow-soft" />
      <h1 className="mb-3 font-display text-3xl font-bold text-forest-800 sm:text-4xl">We'll be right back</h1>
      <p className="max-w-md text-ink-600">
        {message || "We're currently performing scheduled maintenance. We'll be back online shortly — thank you for your patience."}
      </p>
      <div className="mt-8 flex gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-forest-400" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 animate-pulse rounded-full bg-forest-500" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 animate-pulse rounded-full bg-forest-600" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
