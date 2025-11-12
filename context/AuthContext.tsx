"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Get user from backend
        const userData = await authAPI.me();
        setUser(userData as User);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Menggunakan DUMMY LOGIN sementara
      console.log("LOGIN DUMMY DIMULAI DENGAN:", { email, password });

      const dummyUser: User = {
        id: 1,
        name: "Admin Dummy",
        email: email,
        role: "admin",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Response API dummy
      const response = {
        token: "ini-adalah-token-dummy-12345",
        user: dummyUser,
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user as User);

      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);
      throw new Error(error instanceof Error ? error.message : "Login gagal");
    }
  };

  // Mengubah fungsi register agar memanggil API sesungguhnya
  const register = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      // PANGGIL API REGISTRASI SESUNGGUHNYA
      const response = await authAPI.register(data);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user as User);

      toast.success("Registrasi Berhasil!", {
        description: "Anda telah didaftarkan dan login otomatis.",
      });
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Registration error:", error);
      // Menggunakan getErrorMessage dari lib/api.ts untuk menangani error dari Golang backend
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin }}
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
