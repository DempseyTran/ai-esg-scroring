import { useEffect, useMemo, useState } from "react";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const TransferModal = ({
  open,
  onClose,
  onSubmit,
  sourceAccount,
  recipients = []
}) => {
  const [form, setForm] = useState({
    targetAccountId: "",
    amount: "",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        targetAccountId: "",
        amount: "",
        description: ""
      });
    }
  }, [open, sourceAccount]);

  const availableRecipients = useMemo(() => {
    if (!sourceAccount) {
      return [];
    }
    const filtered = recipients.filter((recipient) => recipient.id !== sourceAccount.id);
    console.log("Available recipients:", filtered, "from total:", recipients.length); // Debug log
    return filtered;
  }, [recipients, sourceAccount]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!sourceAccount || !form.targetAccountId || !form.amount) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        sourceAccountId: sourceAccount.id,
        targetAccountId: Number(form.targetAccountId),
        amount: Number(form.amount),
        description: form.description
      });
      // Không gọi onClose ở đây nữa vì handleTransfer sẽ đóng modal
      // Reset form để sẵn sàng cho lần chuyển tiếp theo
      setForm({
        targetAccountId: "",
        amount: "",
        description: ""
      });
    } catch (error) {
      console.error(error);
      // Chỉ đóng modal nếu có lỗi (để user có thể thử lại)
      // onClose sẽ được gọi trong handleTransfer nếu thành công
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !sourceAccount) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Chuyển tiền từ {sourceAccount.bankName}
            </h2>
            <p className="text-sm text-slate-500">
              Số tài khoản: {sourceAccount.accountNumber} • Số dư hiện tại{" "}
              <span className="font-medium text-slate-700">
                {currencyFormatter.format(sourceAccount.balance || 0)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-500 hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">
              Tài khoản nhận
            </label>
            <select
              name="targetAccountId"
              value={form.targetAccountId}
              onChange={handleChange}
              required
              disabled={availableRecipients.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {availableRecipients.length === 0 
                  ? "Không có tài khoản nhận khả dụng" 
                  : "Chọn tài khoản nhận"}
              </option>
              {availableRecipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.ownerName || 'N/A'} • {recipient.bankName} •{" "}
                  {recipient.accountNumber || 'N/A'}
                </option>
              ))}
            </select>
            {availableRecipients.length === 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-amber-600">
                  Không có tài khoản nhận khả dụng.
                </p>
                <p className="text-xs text-slate-500">
                  Lý do: Hệ thống chỉ hiển thị tài khoản của người dùng khác. 
                  Nếu bạn là người dùng duy nhất hoặc chưa có tài khoản của người khác, 
                  vui lòng tạo thêm tài khoản hoặc đăng ký user mới.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-600">
                Số tiền chuyển (VND)
              </label>
              <input
                type="number"
                name="amount"
                min="1000"
                step="1000"
                value={form.amount}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="Ví dụ: 1000000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Mô tả (tuỳ chọn)
              </label>
              <input
                type="text"
                name="description"
                maxLength={200}
                value={form.description}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="Ví dụ: Chuyển tiền sinh hoạt gia đình"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                !form.targetAccountId ||
                !form.amount ||
                availableRecipients.length === 0
              }
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang xử lý..." : "Thực hiện chuyển tiền"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;

