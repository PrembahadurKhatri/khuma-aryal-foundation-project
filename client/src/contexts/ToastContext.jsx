import { createContext, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Replaces alert()/silent-failure feedback in the admin panel with a small
// toast stack. Scoped to AdminLayout — see hooks/useToast.js.
export const ToastContext = createContext(null);

let idCounter = 0;
const DURATION = 4000;

const TONE = {
  success: {
    accent: "bg-emerald-500",
    ring: "ring-emerald-500/15",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  error: {
    accent: "bg-red-500",
    ring: "ring-red-500/15",
    iconBg: "bg-red-500/15 text-red-600 dark:text-red-400",
    bar: "bg-red-500",
  },
  loading: {
    accent: "bg-forest-500",
    ring: "ring-forest-500/15",
    iconBg: "bg-forest-500/15 text-forest-600 dark:text-forest-400",
    bar: "bg-forest-500",
  },
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

// Spins in place — used for in-flight "uploading/saving" toasts so it's
// visually obvious at a glance (not just readable text) that something is
// still happening and the admin should wait rather than click again.
function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const ICON = { success: CheckIcon, error: AlertIcon, loading: SpinnerIcon };

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, type, message }]);
      // "loading" toasts represent work that's still in flight (a create/
      // update request, often with a file upload) — they stay on screen
      // until the caller explicitly dismisses them once the request
      // settles, rather than disappearing on a fixed timer that has no
      // relation to how long the actual upload takes.
      if (type !== "loading") setTimeout(() => remove(id), DURATION);
      return id;
    },
    [remove]
  );

  const value = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
    loading: (message) => push("loading", message),
    dismiss: (id) => remove(id),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 left-5 sm:left-auto z-[100] flex flex-col gap-2.5 sm:max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => {
            const tone = TONE[toast.type] || TONE.success;
            const Icon = ICON[toast.type] || CheckIcon;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="pointer-events-auto relative isolate flex items-start gap-3 overflow-hidden rounded-2xl border border-white/40 bg-white/90 py-3.5 pl-4 pr-3.5 font-body shadow-[0_10px_40px_-8px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/90"
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} aria-hidden="true" />
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.iconBg}`}>
                  <Icon />
                </span>
                <p className="flex-1 self-center text-sm font-semibold leading-snug text-ink-900 dark:text-gray-100">{toast.message}</p>
                {toast.type !== "loading" && (
                  <button
                    onClick={() => remove(toast.id)}
                    aria-label="Dismiss"
                    className="shrink-0 self-start rounded-full p-1 text-ink-400 opacity-60 transition-opacity hover:opacity-100 dark:text-gray-500"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                {/* Countdown bar — only meaningful for toasts that actually
                    auto-dismiss on a timer; a "loading" toast's real
                    lifetime is the in-flight request, not a fixed clock. */}
                {toast.type !== "loading" && (
                  <motion.span
                    className={`absolute bottom-0 left-0 h-[3px] ${tone.bar}`}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: DURATION / 1000, ease: "linear" }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
