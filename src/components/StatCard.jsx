const StatCard = ({ label, value, helper, tone = 'default' }) => {
  const toneStyles = {
    default: 'bg-white border-slate-100',
    positive: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200'
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition hover:shadow ${toneStyles[tone]}`}
    >
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {helper && <div className="mt-2 text-sm text-slate-500">{helper}</div>}
    </div>
  );
};

export default StatCard;

