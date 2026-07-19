import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { loginRequest, logoutRequest } from "../../api/authApi";
import { AuthResponse, Employee } from "../../types";

type AuthContextValue = {
  user: Employee | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentUser: (user: Employee) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "ems_user";
const TOKEN_KEY = "ems_token";

const readStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as Employee) : null;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<Employee | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }, [token, user]);

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await loginRequest(email, password);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  const setCurrentUser = (nextUser: Employee) => {
    setUser(nextUser);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      setCurrentUser
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
