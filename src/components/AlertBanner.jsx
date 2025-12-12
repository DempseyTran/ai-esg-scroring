const AlertBanner = ({ title, message, tone = 'warning' }) => {
  const toneStyles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  return (
    <div
      className={`rounded-xl border px-5 py-4 text-sm shadow-sm ${toneStyles[tone]}`}
    >
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-slate-600">{message}</div>
    </div>
  );
};

export default AlertBanner;

