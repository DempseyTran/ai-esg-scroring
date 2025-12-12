import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Đăng nhập thất bại. Vui lòng kiểm tra thông tin.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-brand-600 p-8 text-white">
            <h1 className="text-2xl font-semibold">
              Personal Finance OpenBank
            </h1>
            <p className="mt-4 text-sm text-brand-100">
              Đồng bộ danh mục tài khoản ngân hàng, giám sát chi tiêu và đặt mục
              tiêu tài chính thông minh dựa trên Open Banking API.
            </p>
            <ul className="mt-6 space-y-4 text-sm">
              <li>• Đồng bộ đa ngân hàng chỉ với một lần xác thực</li>
              <li>• Gợi ý tài khoản chưa tích hợp để bạn không bỏ sót</li>
              <li>• Cảnh báo ngay khi chi tiêu vượt hạn mức mục tiêu</li>
            </ul>
          </div>
          <div className="px-8 py-10">
            <h2 className="text-xl font-semibold text-slate-800">
              Đăng nhập vào tài khoản của bạn
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Trải nghiệm quản lý tài chính đa ngân hàng trên một nền tảng thống
              nhất.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="vana@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
