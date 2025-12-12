import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    vneid: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [identityInfo, setIdentityInfo] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        vneid: form.vneid
      });
      setIdentityInfo(result.identity);
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Đăng ký thất bại. Vui lòng kiểm tra thông tin.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-white px-8 py-10">
            <h2 className="text-xl font-semibold text-slate-800">
              Đăng ký tài khoản Personal Finance OpenBank
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Cung cấp thông tin cá nhân trùng khớp với VNeID để hệ thống xác minh trước khi kích hoạt tài khoản.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Họ và tên (theo VNeID)
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="Nguyen Van A"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Email (đăng ký với ngân hàng/VNeID)
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
                  Mã định danh công dân (VNeID 12 số)
                </label>
                <input
                  type="text"
                  name="vneid"
                  value={form.vneid}
                  onChange={handleChange}
                  minLength={12}
                  maxLength={12}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="012345678901"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    placeholder="• • • • • •"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Nhập lại mật khẩu
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    minLength={6}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    placeholder="• • • • • •"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              {identityInfo && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Xác minh VNeID thành công! Số điện thoại: {identityInfo.phone}. Đang chuyển bạn
                  tới dashboard...
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký & xác minh VNeID'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
          <div className="hidden bg-brand-600 p-8 text-brand-100 lg:block">
            <h3 className="text-lg font-semibold text-white">
              Vì sao cần xác minh VNeID?
            </h3>
            <ul className="mt-6 space-y-4 text-sm">
              <li>
                • Đảm bảo tài khoản Open Banking thuộc về đúng chủ sở hữu trước khi đồng bộ dữ liệu.
              </li>
              <li>
                • Vô hiệu hóa các tài khoản có VNeID ở trạng thái khóa, giúp ví thanh toán luôn tuân thủ.
              </li>
              <li>
                • Tự động ghi nhận nhật ký kiểm tra để audit khi cần.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

