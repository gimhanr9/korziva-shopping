"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { apiClient } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("korziva_token") || localStorage.getItem("shopflow_token")
          : null;
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await apiClient<{ user: User }>("/auth/me");
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        // Token might be expired, remove it
        localStorage.removeItem("korziva_token");
        localStorage.removeItem("shopflow_token");
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient<{ user: User; accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data) {
        localStorage.setItem("korziva_token", res.data.accessToken);
        setUser(res.data.user);
        return { success: true };
      }

      return {
        success: false,
        error: res.error?.message || "Invalid credentials. Please try again.",
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error during login",
      };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const res = await apiClient<{ user: User; accessToken: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (res.success && res.data) {
        localStorage.setItem("korziva_token", res.data.accessToken);
        setUser(res.data.user);
        return { success: true };
      }

      return {
        success: false,
        error: res.error?.message || "Registration failed. Please try again.",
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error during registration",
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("korziva_token");
      localStorage.removeItem("shopflow_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
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
