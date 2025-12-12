import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const CategoryBreakdownChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
        Chưa có dữ liệu phân loại chi tiêu.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Phân bổ theo danh mục
        </h3>
        <span className="text-xs text-slate-400">So sánh thu nhập và chi tiêu</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="category" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#22c55e" name="Thu nhập" />
          <Bar dataKey="expense" fill="#ef4444" name="Chi tiêu" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBreakdownChart;

