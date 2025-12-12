import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import NotificationCenter from "../components/NotificationCenter.jsx";

const NotificationContext = createContext(null);

const NotificationProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const generateId = useCallback(() => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
  }, []);

  const notify = useCallback(
    (payload) => {
      const {
        title,
        message,
        type = "info",
        duration = 4000,
        actionLabel,
        onAction,
      } = payload;

      const id = generateId();
      const toast = {
        id,
        title,
        message,
        type,
        actionLabel,
        onAction,
      };

      setItems((prev) => [...prev, toast]);

      if (duration > 0) {
        const timeout = setTimeout(() => {
          dismiss(id);
        }, duration);
        timeoutsRef.current.set(id, timeout);
      }

      return id;
    },
    [dismiss, generateId]
  );

  const contextValue = useMemo(
    () => ({
      notify,
      dismiss,
    }),
    [notify, dismiss]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationCenter toasts={items} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
};

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification phải được sử dụng bên trong NotificationProvider"
    );
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { NotificationProvider, useNotification };
