"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { adminApi, type User } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const userData = await adminApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is authenticated on mount
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const result = await adminApi.login({ email, password });
    setUser(result.user);
    // Small delay to ensure cookie is set
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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

