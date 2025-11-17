"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { User } from "@/types";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAdmin = user?.role === "admin";

  // Fetch user on mount
  useEffect(() => {
    const token = Cookies.get("access_token");

    if (token) {
      fetchUser();
    } else {
      console.log("AuthContext: No token found");
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log("AuthContext: Fetching user data...");
      const userData = await authAPI.me();

      console.log("AuthContext: User data received:", {
        id: userData.ID || userData.id,
        name: userData.name,
        username: userData.username,
        role: userData.role,
      });

      setUser(userData);
    } catch (error) {
      console.error(" AuthContext: Failed to fetch user:", error);
      Cookies.remove("access_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log("AuthContext: Attempting login...");
      const data = await authAPI.login(username, password);

      console.log("AuthContext: Login response:", {
        hasToken: !!data.token,
        hasUser: !!data.user,
        userId: data.user?.ID || data.user?.id,
      });

      if (data.token) {
        Cookies.set("access_token", data.token, { expires: 7 });
        console.log("AuthContext: Token saved to cookies");
      }

      if (data.user) {
        setUser(data.user);
        console.log(" AuthContext: User state updated");
      }

      await fetchUser(); // Refresh user data
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("AuthContext: Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("AuthContext: Logging out...");
      await authAPI.logout();
    } catch (error) {
      console.error("AuthContext: Logout API failed:", error);
    } finally {
      Cookies.remove("access_token");
      setUser(null);
      console.log("AuthContext: User cleared, redirecting to login");
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    console.log("AuthContext: Refreshing user...");
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, login, logout, refreshUser }}
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
