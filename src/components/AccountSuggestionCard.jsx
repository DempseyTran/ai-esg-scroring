const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

const AccountSuggestionCard = ({ suggestion, onIntegrate, loading }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-5">
      <div>
        <div className="text-sm font-medium text-brand-700">
          {suggestion.bankName}
        </div>
        <div className="text-lg font-semibold text-slate-800">
          {suggestion.maskedAccount}
        </div>
        <p className="text-sm text-slate-500">
          Số dư hiện tại:{' '}
          <span className="font-semibold">
            {currencyFormatter.format(suggestion.balance || 0)} {suggestion.currency}
          </span>
        </p>
        <p className="text-xs text-slate-400">
          Cập nhật lần cuối: {new Date(suggestion.lastUpdated).toLocaleString('vi-VN')}
        </p>
      </div>
      <button
        onClick={() => onIntegrate(suggestion)}
        disabled={loading}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Đang kết nối...' : 'Kết nối ngay'}
      </button>
    </div>
  );
};

export default AccountSuggestionCard;

