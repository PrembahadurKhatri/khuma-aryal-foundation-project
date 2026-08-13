import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("admin-theme") || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "light" ? "dark" : "light"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center px-4 font-body transition-colors ${
        theme === "dark" ? "bg-gray-950 text-gray-100" : "bg-cream-100 text-ink-900"
      }`}
    >
      <button
        type="button"
        onClick={toggleTheme}
        className={`absolute right-4 top-4 flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
          theme === "dark" ? "border-gray-700 bg-gray-900 text-gray-100" : "border-forest-100 bg-white text-ink-900"
        }`}
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        {theme === "light" ? "Dark mode" : "Light mode"}
      </button>

      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-md rounded-2xl border p-8 shadow-xl ${
          theme === "dark" ? "border-gray-800 bg-gray-900" : "border-forest-100 bg-white"
        }`}
      >
        <div className="mb-6 flex flex-col items-center">
          <img src="/logo.svg" alt="Khuma Aryal Foundation" className="mb-3 h-16 w-16" />
          <h1 className="text-2xl font-bold text-forest-700 dark:text-forest-400">Admin Login</h1>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-ink-600"}`}>Khuma Aryal Foundation Dashboard</p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">{error}</p>}

        <label className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-ink-700"}`}>Email</label>
        <input
          type="email"
          required
          autoFocus
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={`mb-4 w-full rounded-lg border px-3 py-2 ${
            theme === "dark" ? "border-gray-700 bg-gray-800 text-gray-100" : "border-forest-100 bg-white text-ink-900"
          }`}
        />

        <label className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-ink-700"}`}>Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className={`mb-6 w-full rounded-lg border px-3 py-2 ${
            theme === "dark" ? "border-gray-700 bg-gray-800 text-gray-100" : "border-forest-100 bg-white text-ink-900"
          }`}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-forest-700 px-4 py-2.5 text-center font-semibold text-white shadow-soft transition-colors hover:bg-forest-800 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default Login;
