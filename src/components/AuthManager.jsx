import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

const AuthManager = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiFetch({
        path: `${SupportDashboard.api_url}tickefic/v1/login`,
        method: "POST",
        data: {
          username: credentials.username,
          password: credentials.password,
        },
        credentials: "same-origin",
      });

      console.log(response);

      if (response.success) {
        window.location.reload(); // Simplest way to let WP recognize the new cookie
      }
    } catch (err) {
      setError(err.data.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {__("Welcome Back", "tickefic")}
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            {__("Login to manage your support tickets", "tickefic")}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">
              {__("Username / Email", "tickefic")}
            </label>
            <input
              type="text"
              name="username"
              required
              value={credentials.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">
              {__("Password", "tickefic")}
            </label>
            <input
              type="password"
              name="password"
              required
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] disabled:bg-slate-400"
          >
            {loading
              ? __("Signing in...", "tickefic")
              : __("Sign In", "tickefic")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthManager;
