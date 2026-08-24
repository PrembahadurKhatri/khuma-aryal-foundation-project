import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService.js";
import getErrorMessage from "../../utils/getErrorMessage.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = localStorage.getItem("admin-theme") || "light";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center px-4 font-body transition-colors ${
        theme === "dark" ? "bg-gray-950 text-gray-100" : "bg-cream-100 text-ink-900"
      }`}
    >
      <div className={`w-full max-w-md rounded-2xl border p-8 shadow-xl ${theme === "dark" ? "border-gray-800 bg-gray-900" : "border-forest-100 bg-white"}`}>
        <div className="mb-6 flex flex-col items-center">
          <img src="/images/kaf.png" alt="Khuma Aryal Foundation" className="mb-3 h-16 w-16 rounded-full object-cover" />
          <h1 className="text-2xl font-bold text-forest-700 dark:text-forest-400">Forgot Password</h1>
          <p className={`text-center text-sm ${theme === "dark" ? "text-gray-400" : "text-ink-600"}`}>
            Enter your admin email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className={`mb-6 rounded-lg px-4 py-3 text-sm ${theme === "dark" ? "bg-forest-950/40 text-forest-400" : "bg-forest-50 text-forest-700"}`}>
              If that email exists, a reset link has been sent. Check your inbox — the link expires in 15 minutes.
            </p>
            <Link
              to="/admin/login"
              className="block w-full rounded-lg bg-forest-700 px-4 py-2.5 text-center font-semibold text-white shadow-soft transition-colors hover:bg-forest-800"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">{error}</p>}

            <label className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-ink-700"}`}>Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mb-6 w-full rounded-lg border px-3 py-2 ${
                theme === "dark" ? "border-gray-700 bg-gray-800 text-gray-100" : "border-forest-100 bg-white text-ink-900"
              }`}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-forest-700 px-4 py-2.5 text-center font-semibold text-white shadow-soft transition-colors hover:bg-forest-800 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <Link
              to="/admin/login"
              className={`mt-4 block text-center text-sm hover:underline ${theme === "dark" ? "text-gray-400" : "text-ink-600"}`}
            >
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
