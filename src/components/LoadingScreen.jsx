const LoadingScreen = ({ message = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-brand-600" />
        <span className="text-sm text-slate-600">{message}</span>
      </div>
    </div>
  );
};

export default LoadingScreen;

