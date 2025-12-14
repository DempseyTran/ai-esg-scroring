const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const BankAccountCard = ({
  account,
  onSync,
  onCreateGoal,
  onEditGoal,
  onDeleteGoal,
  onTransfer,
  onConvertESG,
  syncing = false,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-brand-600">
            {account.bankName}
          </div>
          <h3 className="text-xl font-semibold text-slate-800">
            {account.maskedAccount}
          </h3>
          <p className="text-sm text-slate-500">
            Số dư hiện tại:{" "}
            <span className="font-medium text-slate-700">
              {currencyFormatter.format(account.balance || 0)}
            </span>
          </p>
          {account.esgPoint !== undefined && account.esgPoint !== null && (
            <p className="text-sm text-slate-500">
              Điểm ESG:{" "}
              <span className="font-medium text-emerald-600">
                {Number(account.esgPoint).toFixed(2)} điểm
              </span>
            </p>
          )}
          <p className="text-xs text-slate-400">
            Lần đồng bộ gần nhất:{" "}
            {new Date(account.lastSync).toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onTransfer?.(account)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Chuyển tiền
          </button>
          {account.esgPoint !== undefined &&
            account.esgPoint !== null &&
            Number(account.esgPoint) > 0 &&
            onConvertESG && (
              <button
                onClick={() => onConvertESG(account)}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-100"
              >
                Quy đổi điểm ESG
              </button>
            )}
          <button
            onClick={() => onCreateGoal(account)}
            className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            Thiết lập mục tiêu
          </button>
          <button
            onClick={() => onSync(account)}
            disabled={syncing}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {syncing ? "Đang đồng bộ..." : "Đồng bộ giao dịch"}
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Mục tiêu chi tiêu
        </h4>
        {account.goals?.length ? (
          <ul className="mt-3 space-y-3">
            {account.goals.map((goal) => (
              <li
                key={goal.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-700">
                      {goal.purpose}
                    </div>
                    <div className="text-xs text-slate-500">
                      Chu kỳ {cycleLabel(goal.cycle)} · Giới hạn{" "}
                      {currencyFormatter.format(goal.limitAmount)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        goal.isExceeded ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {goal.progress}% ({currencyFormatter.format(goal.spent)})
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                      {onEditGoal && (
                        <button
                          onClick={() => onEditGoal(account, goal)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                        >
                          Sửa
                        </button>
                      )}
                      {onDeleteGoal && (
                        <button
                          onClick={() => onDeleteGoal(account, goal)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white">
                  <div
                    className={`h-2 rounded-full ${
                      goal.isExceeded ? "bg-red-400" : "bg-brand-500"
                    }`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            Bạn chưa có mục tiêu chi tiêu cho tài khoản này. Hãy thiết lập mục
            tiêu để nhận cảnh báo thông minh.
          </p>
        )}
      </div>
    </div>
  );
};

const cycleLabel = (cycle) => {
  switch (cycle) {
    case "daily":
      return "hằng ngày";
    case "weekly":
      return "hằng tuần";
    case "monthly":
      return "hằng tháng";
    case "yearly":
      return "hằng năm";
    default:
      return cycle;
  }
};

export default BankAccountCard;
