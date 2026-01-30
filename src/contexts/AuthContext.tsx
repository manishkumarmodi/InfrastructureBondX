import React, { createContext, useContext, useState, ReactNode } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

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
  login: (email: string, password: string, role: UserRole, name?: string) => boolean;
  loginWithGoogle: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  completeKYC: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "123456";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string, role: UserRole, name?: string) => {
    if (!role) {
      return false;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (role === "admin") {
      if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return false;
      }
    }

    setUser({
      id: normalizedEmail || Math.random().toString(36).substr(2, 9),
      name: name || email.split("@")[0],
      email: normalizedEmail || email,
      role,
      kycCompleted: role === "investor" ? false : undefined,
    });
    return true;
  };

  const loginWithGoogle = async (role: UserRole) => {
    if (!role) {
      return false;
    }

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = credential.user;
      const normalizedEmail = (firebaseUser.email || "").trim().toLowerCase();

      if (role === "admin" && normalizedEmail !== ADMIN_EMAIL) {
        return false;
      }

      setUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Investor",
        email: normalizedEmail || firebaseUser.email || "",
        role,
        kycCompleted: role === "investor" ? false : undefined,
      });

      return true;
    } catch (error) {
      console.error("Google login failed", error);
      return false;
    }
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
        loginWithGoogle,
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
