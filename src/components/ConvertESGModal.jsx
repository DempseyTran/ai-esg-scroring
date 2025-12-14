import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const ConvertESGModal = ({
  open,
  onClose,
  onSubmit,
  account,
}) => {
  const [points, setPoints] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Tỷ lệ quy đổi: 1 điểm ESG = 1000 VND
  const exchangeRate = 1000;
  const maxPoints = account?.esgPoint || 0;
  const estimatedAmount = points ? Number(points) * exchangeRate : 0;

  const handleChange = (event) => {
    const value = event.target.value;
    // Chỉ cho phép số dương
    if (value === "" || (/^\d*\.?\d*$/.test(value) && Number(value) >= 0)) {
      setPoints(value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!account || !points || Number(points) <= 0) {
      return;
    }

    if (Number(points) > maxPoints) {
      alert(`Số điểm ESG không đủ. Bạn chỉ có ${maxPoints.toFixed(2)} điểm.`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        accountId: account.id,
        points: Number(points),
      });
      setPoints("");
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMax = () => {
    setPoints(maxPoints.toString());
  };

  if (!open || !account) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Quy đổi điểm ESG
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-600">Tài khoản</div>
            <div className="mt-1 text-lg font-semibold text-slate-800">
              {account.bankName} • {account.maskedAccount}
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Điểm ESG hiện có:{" "}
              <span className="font-semibold text-brand-600">
                {maxPoints.toFixed(2)} điểm
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">
              Số điểm ESG muốn quy đổi
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={points}
                onChange={handleChange}
                placeholder="Nhập số điểm"
                required
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={handleMax}
                className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                Tối đa
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Tỷ lệ quy đổi: 1 điểm ESG = {currencyFormatter.format(exchangeRate)}
            </p>
          </div>

          {points && Number(points) > 0 && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
              <div className="text-sm text-slate-600">Số tiền nhận được</div>
              <div className="mt-1 text-2xl font-bold text-brand-600">
                {currencyFormatter.format(estimatedAmount)}
              </div>
              {Number(points) > maxPoints && (
                <p className="mt-2 text-xs text-red-600">
                  Số điểm vượt quá số điểm hiện có
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                !points ||
                Number(points) <= 0 ||
                Number(points) > maxPoints
              }
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang xử lý..." : "Quy đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertESGModal;

