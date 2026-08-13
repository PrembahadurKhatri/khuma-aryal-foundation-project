import { createContext, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Replaces alert()/silent-failure feedback in the admin panel with a small
// toast stack. Scoped to AdminLayout — see hooks/useToast.js.
export const ToastContext = createContext(null);

let idCounter = 0;

const toneClass = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  error: "border-red-300 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const value = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 left-5 sm:left-auto z-[100] flex flex-col gap-2 sm:max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg font-body text-sm font-medium ${toneClass[toast.type] || toneClass.success}`}
            >
              <p className="flex-1">{toast.message}</p>
              <button onClick={() => remove(toast.id)} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
