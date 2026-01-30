import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { apiRequest, ApiError } from "@/lib/api";

export type UserRole = "investor" | "issuer" | "admin" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, null>;
  organizationName?: string;
  kycCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole, name?: string) => Promise<boolean>;
  loginWithGoogle: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  completeKYC: () => Promise<void>;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Exclude<UserRole, null>;
    organizationName?: string;
    kycStatus?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "123456";
const TOKEN_STORAGE_KEY = "infrabondx_token";

const mapUser = (payload: AuthResponse["user"]): User => ({
  id: payload.id,
  name: payload.name,
  email: payload.email,
  role: payload.role,
  organizationName: payload.organizationName,
  kycCompleted: payload.kycStatus === "verified",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);

  const persistSession = (payload: AuthResponse) => {
    setUser(mapUser(payload.user));
    setToken(payload.token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const hydrateProfile = async () => {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const profile = await apiRequest<AuthResponse["user"]>("/auth/me", { authToken: token });
        if (!cancelled) {
          setUser(mapUser(profile));
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void hydrateProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const authenticateWithCredentials = async (
    email: string,
    password: string,
    role: Exclude<UserRole, null>,
    displayName?: string
  ) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email: normalizedEmail, password },
      });

      if (role === "admin" && response.user.role !== "admin") {
        return false;
      }

      persistSession(response);
      return true;
    } catch (error) {
      const shouldAutoProvision =
        error instanceof ApiError && (error.status === 401 || error.status === 404);

      if (role === "admin" && shouldAutoProvision) {
        try {
          const response = await apiRequest<AuthResponse>("/auth/register", {
            method: "POST",
            body: {
              name: displayName ?? "Platform Admin",
              email: normalizedEmail,
              password,
              role,
            },
          });
          persistSession(response);
          return true;
        } catch (provisionError) {
          console.error("Admin provisioning failed", provisionError);
          return false;
        }
      }

      if (!shouldAutoProvision || role === "admin") {
        console.error("Credential login failed", error);
        return false;
      }

      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: {
          name: displayName ?? normalizedEmail.split("@")[0],
          email: normalizedEmail,
          password,
          role,
        },
      });
      persistSession(response);
      return true;
    }
  };

  const login = async (email: string, password: string, role: UserRole, name?: string) => {
    if (!role) {
      return false;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (role === "admin") {
      if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return false;
      }
    }

    return authenticateWithCredentials(normalizedEmail, password, role, name);
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

      return authenticateWithCredentials(
        normalizedEmail,
        firebaseUser.uid,
        role,
        firebaseUser.displayName ?? firebaseUser.email ?? undefined
      );
    } catch (error) {
      console.error("Google login failed", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  const completeKYC = async () => {
    if (!token) {
      return;
    }

    try {
      await apiRequest("/auth/kyc", { method: "POST", authToken: token });
      setUser((prev) => (prev ? { ...prev, kycCompleted: true } : prev));
    } catch (error) {
      console.error("Failed to complete KYC", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
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
