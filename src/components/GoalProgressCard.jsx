const GoalProgressCard = ({ goal, onEdit, onDelete }) => {
  const progress = Math.min(goal.progress, 100);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-brand-700">
            {goal.bankName} • {goal.maskedAccount}
          </div>
          <h3 className="mt-1 text-lg font-semibold text-slate-800">
            {goal.purpose}
          </h3>
          <p className="text-sm text-slate-500">
            Chu kỳ: {cycleLabel(goal.cycle)} • Giới hạn:{' '}
            {formatCurrency(goal.limitAmount)}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Chỉnh sửa
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal)}
              className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Đã chi {formatCurrency(goal.spent)} / {formatCurrency(goal.limitAmount)}
          </span>
          <span
            className={`font-medium ${
              goal.isExceeded ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {progress}%
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all ${
              goal.isExceeded ? 'bg-red-500' : 'bg-brand-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {goal.isExceeded && (
          <p className="mt-2 text-sm text-red-600">
            Cảnh báo: đã vượt giới hạn {formatCurrency(goal.limitAmount)}
          </p>
        )}
      </div>
    </div>
  );
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);

const cycleLabel = (cycle) => {
  switch (cycle) {
    case 'daily':
      return 'Hàng ngày';
    case 'weekly':
      return 'Hàng tuần';
    case 'monthly':
      return 'Hàng tháng';
    case 'yearly':
      return 'Hàng năm';
    default:
      return cycle;
  }
};

export default GoalProgressCard;

