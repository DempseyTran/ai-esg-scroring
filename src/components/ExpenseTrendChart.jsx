import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const ExpenseTrendChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
        Chưa có dữ liệu chi tiêu để hiển thị.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Chi tiêu theo thời gian
        </h3>
        <span className="text-xs text-slate-400">
          Giá trị hiển thị theo VNĐ (chi tiêu âm, thu nhập dương)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#expenses)"
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#22c55e"
            fillOpacity={0.1}
            fill="#22c55e"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseTrendChart;

