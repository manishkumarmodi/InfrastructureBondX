import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "investor" | "issuer" | "admin" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  kycCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
  completeKYC: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, role: UserRole, name?: string) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name: name || email.split("@")[0],
      email,
      role: role!,
      kycCompleted: false,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const completeKYC = () => {
    if (user) {
      setUser({ ...user, kycCompleted: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        completeKYC,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
