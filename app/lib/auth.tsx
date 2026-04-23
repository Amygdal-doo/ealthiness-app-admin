import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import type { Role, User } from "./types";
import { demoAccounts } from "./mock-data";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });

  const navigate = useNavigate();

  const login = useCallback(
    async (email: string, _password: string) => {
      // Look up demo account by email
      const account = demoAccounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );
      if (!account) {
        return { error: "Invalid email. Use one of the demo accounts." };
      }

      localStorage.setItem("auth_user", JSON.stringify(account));
      setUser(account);
      navigate("/");
      return {};
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireRole(...roles: Role[]) {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
}
