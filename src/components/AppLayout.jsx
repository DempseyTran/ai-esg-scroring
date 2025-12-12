import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/bank-accounts', label: 'Tài khoản ngân hàng' },
  { to: '/transactions', label: 'Giao dịch' },
  { to: '/goals', label: 'Mục tiêu chi tiêu' }
];

const AppLayout = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              Personal Finance OpenBank
            </h1>
            <p className="text-sm text-slate-500">
              Kết nối đa ngân hàng • Theo dõi chi tiêu thông minh
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-700">
                {user?.fullName}
              </div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Đăng xuất
            </button>
          </div>
        </div>
        <nav className="bg-slate-50">
          <div className="mx-auto flex max-w-6xl gap-6 px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'border-b-2 pb-3 pt-3 text-sm font-medium transition',
                    isActive
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-slate-500 hover:text-brand-600'
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

