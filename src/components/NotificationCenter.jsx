const toneStyles = {
  info: "border-blue-200 bg-white/95 text-slate-700",
  success: "border-emerald-200 bg-white/95 text-slate-700",
  warning: "border-amber-200 bg-white/95 text-slate-700",
  danger: "border-red-200 bg-white/95 text-slate-700"
};

const badgeStyles = {
  info: "bg-blue-500/10 text-blue-600",
  success: "bg-emerald-500/10 text-emerald-600",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-red-500/10 text-red-600"
};

const typeLabel = {
  info: "Thông báo",
  success: "Thành công",
  warning: "Cảnh báo",
  danger: "Lỗi"
};

const NotificationCenter = ({ toasts = [], onDismiss }) => {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex items-start justify-end px-4 py-6 sm:p-6">
      <div className="flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md transition-all ${toneStyles[toast.type] ?? toneStyles.info}`}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <span className={`mt-0.5 inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${badgeStyles[toast.type] ?? badgeStyles.info}`}>
                {typeLabel[toast.type] ?? typeLabel.info}
              </span>
              <div className="flex-1">
                {toast.title && (
                  <p className="text-sm font-semibold text-slate-800">
                    {toast.title}
                  </p>
                )}
                {toast.message && (
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {toast.message}
                  </p>
                )}
                {toast.actionLabel && toast.onAction && (
                  <button
                    type="button"
                    onClick={() => toast.onAction(toast.id)}
                    className="mt-3 inline-flex items-center rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-900"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="rounded-lg bg-transparent p-1 text-slate-400 transition hover:bg-slate-200/80 hover:text-slate-600"
              >
                <span className="sr-only">Đóng</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 5.22a.75.75 0 011.06 0L10 8.94l3.72-3.72a.75.75 0 111.06 1.06L11.06 10l3.72 3.72a.75.75 0 11-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 11-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;

