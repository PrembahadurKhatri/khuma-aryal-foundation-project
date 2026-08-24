import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../services/authService.js";
import getErrorMessage from "../../utils/getErrorMessage.js";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const theme = localStorage.getItem("admin-theme") || "light";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      setDone(true);
      setTimeout(() => navigate("/admin/login"), 2500);
    } catch (err) {
      setError(getErrorMessage(err, "Reset link is invalid or has expired."));
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
          <h1 className="text-2xl font-bold text-forest-700 dark:text-forest-400">Reset Password</h1>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-ink-600"}`}>Choose a new password below.</p>
        </div>

        {done ? (
          <p className={`rounded-lg px-4 py-3 text-center text-sm ${theme === "dark" ? "bg-forest-950/40 text-forest-400" : "bg-forest-50 text-forest-700"}`}>
            Password reset successfully. Redirecting you to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">{error}</p>}

            <label className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-ink-700"}`}>New Password</label>
            <input
              type="password"
              required
              minLength={8}
              autoFocus
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`mb-4 w-full rounded-lg border px-3 py-2 ${
                theme === "dark" ? "border-gray-700 bg-gray-800 text-gray-100" : "border-forest-100 bg-white text-ink-900"
              }`}
            />

            <label className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-ink-700"}`}>Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className={`mb-6 w-full rounded-lg border px-3 py-2 ${
                theme === "dark" ? "border-gray-700 bg-gray-800 text-gray-100" : "border-forest-100 bg-white text-ink-900"
              }`}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-forest-700 px-4 py-2.5 text-center font-semibold text-white shadow-soft transition-colors hover:bg-forest-800 disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
