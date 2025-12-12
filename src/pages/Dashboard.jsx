import { useEffect, useMemo, useState } from "react";
import bankApi from "../api/bankApi.js";
import transactionsApi from "../api/transactionsApi.js";
import goalsApi from "../api/goalsApi.js";
import StatCard from "../components/StatCard.jsx";
import ExpenseTrendChart from "../components/ExpenseTrendChart.jsx";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart.jsx";
import AlertBanner from "../components/AlertBanner.jsx";
import AccountSuggestionCard from "../components/AccountSuggestionCard.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { useNotification } from "../context/NotificationContext.jsx";

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [suggestedAccounts, setSuggestedAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [integratingId, setIntegratingId] = useState(null);
  const { notify } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const startDateStr = startDate.toISOString().slice(0, 10);

        const [accountRes, summaryRes, breakdownRes, alertsRes, transactions] =
          await Promise.all([
            bankApi.getAccounts(),
            transactionsApi.summary({ startDate: startDateStr }),
            transactionsApi.breakdown({ startDate: startDateStr }),
            goalsApi.alerts(),
            transactionsApi.list({ startDate: startDateStr })
          ]);

        setAccounts(accountRes.linked || []);
        setSuggestedAccounts(accountRes.suggested || []);
        setSummary(summaryRes);
        setBreakdown(aggregateBreakdown(breakdownRes));
        setAlerts(alertsRes);
        setTrendData(buildTrendData(transactions));
      } catch (error) {
        console.error("Không thể tải dữ liệu dashboard:", error);
        notify({
          type: "danger",
          title: "Không thể tải dashboard",
          message: "Vui lòng kiểm tra kết nối và thử lại."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [notify]);

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, item) => acc + (item.balance || 0), 0);
  }, [accounts]);

  const handleIntegrate = async (suggestion) => {
    try {
      setIntegratingId(suggestion.accountNumber);
      const linkedAccount = await bankApi.linkAccount({
        institutionId: suggestion.institutionId,
        accountNumber: suggestion.accountNumber
      });
      const refreshed = await bankApi.getAccounts();
      setAccounts(refreshed.linked || []);
      setSuggestedAccounts(refreshed.suggested || []);
      notify({
        type: "success",
        title: "Kết nối thành công",
        message: `Đã thêm tài khoản ${linkedAccount.bankName} • ${linkedAccount.maskedAccount}.`
      });
    } catch (error) {
      console.error("Không thể kết nối tài khoản:", error);
      notify({
        type: "danger",
        title: "Kết nối thất bại",
        message: "Không thể kết nối tài khoản Open Banking. Vui lòng thử lại."
      });
    } finally {
      setIntegratingId(null);
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải tổng quan tài chính..." />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tài khoản đã kết nối"
          value={accounts.length}
          helper={`Bạn còn ${suggestedAccounts.length} tài khoản chưa tích hợp`}
        />
        <StatCard
          label="Tổng số dư"
          value={currencyFormatter.format(totalBalance)}
          tone="positive"
        />
        <StatCard
          label="Tổng chi tiêu 30 ngày"
          value={currencyFormatter.format(summary?.totalExpense || 0)}
        />
        <StatCard
          label="Cảnh báo mục tiêu"
          value={alerts.length}
          helper="Kiểm tra các mục tiêu đang vượt giới hạn"
          tone={alerts.length ? 'warning' : 'default'}
        />
      </section>

      {alerts.length > 0 && (
        <section className="space-y-3">
          {alerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              title={`Vượt hạn mức: ${alert.purpose}`}
              message={`Tài khoản ${alert.bankName} (${alert.maskedAccount}) đã chi ${currencyFormatter.format(alert.spent)} vượt mục tiêu ${currencyFormatter.format(alert.limitAmount)} trong chu kỳ ${cycleLabel(alert.cycle)}.`}
              tone="danger"
            />
          ))}
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <ExpenseTrendChart data={trendData} />
        <CategoryBreakdownChart data={breakdown} />
      </section>

      {suggestedAccounts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Tài khoản Open Banking gợi ý tích hợp
          </h2>
          <p className="text-sm text-slate-500">
            Hệ thống phát hiện bạn đang có tài khoản ngân hàng chưa đồng bộ với ví. Kết nối để
            quản lý tập trung và theo dõi giao dịch realtime.
          </p>
          <div className="space-y-3">
            {suggestedAccounts.map((item) => (
              <AccountSuggestionCard
                key={`${item.institutionId}-${item.accountNumber}`}
                suggestion={item}
                loading={integratingId === item.accountNumber}
                onIntegrate={handleIntegrate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const buildTrendData = (transactions = []) => {
  const grouped = {};
  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    if (!grouped[label]) {
      grouped[label] = { label, income: 0, expense: 0 };
    }
    if (tx.type === 'expense') {
      grouped[label].expense += tx.amount;
    } else {
      grouped[label].income += tx.amount;
    }
  });
  return Object.values(grouped).sort((a, b) => {
    const [dayA, monthA] = a.label.split('/').map(Number);
    const [dayB, monthB] = b.label.split('/').map(Number);
    const dateA = new Date(new Date().getFullYear(), monthA - 1, dayA);
    const dateB = new Date(new Date().getFullYear(), monthB - 1, dayB);
    return dateA - dateB;
  });
};

const aggregateBreakdown = (rows = []) => {
  const grouped = {};
  rows.forEach((row) => {
    const key = row.category || 'Khác';
    if (!grouped[key]) {
      grouped[key] = { category: key, income: 0, expense: 0 };
    }
    if (row.type === 'expense') {
      grouped[key].expense += row.totalAmount;
    } else {
      grouped[key].income += row.totalAmount;
    }
  });
  return Object.values(grouped);
};

const cycleLabel = (cycle) => {
  switch (cycle) {
    case 'daily':
      return 'hằng ngày';
    case 'weekly':
      return 'hằng tuần';
    case 'monthly':
      return 'hằng tháng';
    case 'yearly':
      return 'hằng năm';
    default:
      return cycle;
  }
};

export default Dashboard;

