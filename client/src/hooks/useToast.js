import { useContext } from "react";
import { ToastContext } from "../contexts/ToastContext.jsx";

const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};

export default useToast;
