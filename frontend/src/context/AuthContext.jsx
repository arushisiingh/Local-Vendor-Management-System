import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("service_platform_token") || "");
  const [role, setRole] = useState(localStorage.getItem("service_platform_role") || "");
  const [account, setAccount] = useState(() => {
    const raw = localStorage.getItem("service_platform_account");
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo(
    () => ({
      token,
      role,
      account,
      isAuthenticated: Boolean(token),
      login(session) {
        setToken(session.token);
        setRole(session.role);
        setAccount(session.account);
        localStorage.setItem("service_platform_token", session.token);
        localStorage.setItem("service_platform_role", session.role);
        localStorage.setItem("service_platform_account", JSON.stringify(session.account));
      },
      updateAccount(nextAccount) {
        setAccount(nextAccount);
        localStorage.setItem("service_platform_account", JSON.stringify(nextAccount));
      },
      logout() {
        setToken("");
        setRole("");
        setAccount(null);
        localStorage.removeItem("service_platform_token");
        localStorage.removeItem("service_platform_role");
        localStorage.removeItem("service_platform_account");
      }
    }),
    [account, role, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
