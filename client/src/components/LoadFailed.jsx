// Surfaces a failed fetch instead of leaving a section stuck on its
// skeleton forever (data stays null on error, so a bare `!data` loading
// check never resolves) — visible proof-on-page of what went wrong, so a
// visitor (or admin) can screenshot the actual reason without needing
// devtools, which matters a lot on mobile / in-app browsers.
export default function LoadFailed({ error }) {
  const reason = error?.response?.status ? `Server responded with status ${error.response.status}.` : error?.message || "Network error.";
  return (
    <p className="rounded-xl2 border border-red-200 bg-red-50 py-8 text-center font-body text-sm text-red-700 shadow-card">
      Couldn't load this section right now. ({reason})
    </p>
  );
}
