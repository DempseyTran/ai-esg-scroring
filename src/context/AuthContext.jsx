import { createContext, useContext, useEffect, useState } from "react";
import authApi from "../api/authApi.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "pfob_token";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authApi.getProfile();
        setUser(profile);
      } catch (err) {
        console.error("Không lấy được hồ sơ người dùng:", err);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const persistToken = (value) => {
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const login = async (credentials) => {
    setError(null);
    const result = await authApi.login(credentials);
    persistToken(result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const register = async (payload) => {
    setError(null);
    const result = await authApi.register(payload);
    persistToken(result.token);
    setToken(result.token);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    persistToken(null);
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };
