import { useEffect, useState } from "react";
import transactionsApi from "../api/transactionsApi.js";
import bankApi from "../api/bankApi.js";
import TransactionsTable from "../components/TransactionsTable.jsx";
import StatCard from "../components/StatCard.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { useRefresh } from "../context/RefreshContext.jsx";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const Transactions = () => {
  const [accounts, setAccounts] = useState([]);
  const [filters, setFilters] = useState(() => {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    // Đảm bảo endDate là hôm nay hoặc tương lai để bao gồm giao dịch mới nhất
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 1); // Thêm 1 ngày để chắc chắn bao gồm hôm nay
    return {
      accountId: "",
      type: "",
      startDate: defaultStart.toISOString().slice(0, 10),
      endDate: defaultEnd.toISOString().slice(0, 10),
    };
  });
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { transactionsVersion } = useRefresh();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const result = await bankApi.getAccounts();
        setAccounts(result.linked || []);
      } catch (error) {
        console.error("Không thể tải tài khoản", error);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params = buildParams(filters);
        const [list, summaryRes] = await Promise.all([
          transactionsApi.list(params),
          transactionsApi.summary(params),
        ]);
        setTransactions(list);
        setSummary(summaryRes);
        // Log để debug
        if (transactionsVersion > 0) {
          console.log(`Đã refresh giao dịch (version ${transactionsVersion}), tìm thấy ${list.length} giao dịch`);
        }
      } catch (error) {
        console.error("Không thể tải giao dịch", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters, transactionsVersion]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          Bộ lọc giao dịch
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tài khoản
            </label>
            <select
              name="accountId"
              value={filters.accountId}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Tất cả tài khoản</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} • {account.maskedAccount}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Loại giao dịch
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Tất cả</option>
              <option value="expense">Chi tiêu</option>
              <option value="income">Thu nhập</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Từ ngày
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Đến ngày
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Số giao dịch"
          value={summary?.totalTransactions || 0}
        />
        <StatCard
          label="Tổng chi tiêu"
          value={currencyFormatter.format(summary?.totalExpense || 0)}
        />
        <StatCard
          label="Tổng thu nhập"
          value={currencyFormatter.format(summary?.totalIncome || 0)}
          tone="positive"
        />
      </section>

      {loading ? (
        <LoadingScreen message="Đang tải danh sách giao dịch..." />
      ) : (
        <TransactionsTable transactions={transactions} />
      )}
    </div>
  );
};

const buildParams = (filters) => {
  const params = {};
  if (filters.accountId) params.accountId = filters.accountId;
  if (filters.type) params.type = filters.type;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  return params;
};

export default Transactions;
