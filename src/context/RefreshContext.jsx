import { createContext, useCallback, useContext, useMemo, useState } from "react";

const RefreshContext = createContext(null);

const RefreshProvider = ({ children }) => {
  const [transactionsVersion, setTransactionsVersion] = useState(0);

  const bumpTransactions = useCallback(() => {
    setTransactionsVersion((version) => version + 1);
  }, []);

  const value = useMemo(
    () => ({
      transactionsVersion,
      bumpTransactions
    }),
    [transactionsVersion, bumpTransactions]
  );

  return (
    <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>
  );
};

const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error("useRefresh phải được dùng bên trong RefreshProvider");
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { RefreshProvider, useRefresh };

