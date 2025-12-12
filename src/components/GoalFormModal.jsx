import { useEffect, useState } from 'react';

const cycleOptions = [
  { value: 'daily', label: 'Hàng ngày' },
  { value: 'weekly', label: 'Hàng tuần' },
  { value: 'monthly', label: 'Hàng tháng' },
  { value: 'yearly', label: 'Hàng năm' }
];

const GoalFormModal = ({ open, onClose, onSubmit, account, initialData }) => {
  const [form, setForm] = useState({
    purpose: '',
    limitAmount: '',
    cycle: 'monthly'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        purpose: initialData.purpose,
        limitAmount: String(initialData.limitAmount),
        cycle: initialData.cycle
      });
    } else {
      setForm({ purpose: '', limitAmount: '', cycle: 'monthly' });
    }
  }, [initialData, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        purpose: form.purpose,
        limitAmount: Number(form.limitAmount),
        cycle: form.cycle
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {initialData ? 'Chỉnh sửa mục tiêu' : 'Tạo mục tiêu chi tiêu'}
            </h2>
            <p className="text-sm text-slate-500">
              {account?.bankName} • {account?.maskedAccount}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-2 py-1 text-sm text-slate-500 hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">
              Mục đích chi tiêu
            </label>
            <input
              type="text"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="Ví dụ: Chi tiêu ăn uống hàng tháng"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">
              Giới hạn chi tiêu (VND)
            </label>
            <input
              type="number"
              name="limitAmount"
              min="100000"
              step="10000"
              value={form.limitAmount}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="Ví dụ: 5000000"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">
              Chu kỳ theo dõi
            </label>
            <select
              name="cycle"
              value={form.cycle}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {cycleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Tạo mục tiêu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalFormModal;

