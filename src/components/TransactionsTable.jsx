const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

const TransactionsTable = ({ transactions = [] }) => {
  if (!transactions.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">
          Chưa có giao dịch nào trong khoảng thời gian được chọn.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Thời gian
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ngân hàng
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Danh mục
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Mô tả
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Số tiền
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white text-sm">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {new Date(tx.date).toLocaleString('vi-VN')}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                <div className="font-medium text-slate-800">{tx.bankName}</div>
                <div className="text-xs text-slate-400">{tx.accountNumber}</div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {tx.category || 'Khác'}
              </td>
              <td className="px-4 py-3 text-slate-600">{tx.description || '—'}</td>
              <td
                className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                  tx.type === 'expense' ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {tx.type === 'expense' ? '-' : '+'}
                {currencyFormatter.format(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;

