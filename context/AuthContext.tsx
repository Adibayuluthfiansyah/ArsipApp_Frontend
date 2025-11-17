"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { User } from "@/types";
import { authAPI, getErrorMessage } from "@/lib/api";
import Cookies from "js-cookie";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: {
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);
  const isFetching = useRef(false);

  useEffect(() => {
    if (hasFetched.current || isFetching.current) {
      console.log("Auth check already done or in progress, skipping...");
      return;
    }

    const verifyUser = async () => {
      const token = Cookies.get("access_token");

      if (!token) {
        console.log("No token found, skipping auth check");
        setLoading(false);
        hasFetched.current = true;
        return;
      }

      try {
        isFetching.current = true;
        const userData = await authAPI.me();
        setUser(userData);
        setIsAdmin(userData.role === "admin");
      } catch (error) {
        console.error("Session invalid:", error);
        Cookies.remove("access_token");
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        hasFetched.current = true;
        isFetching.current = false;
      }
    };

    verifyUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Panggil authAPI.login, yang mengembalikan { token, user }
      const response = await authAPI.login(username, password);
      if (!response.token || !response.user) {
        throw new Error("Token atau data user tidak diterima dari server");
      }
      Cookies.set("access_token", response.token, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      setUser(response.user);
      setIsAdmin(response.user.role === "admin");

      toast.success("Login Berhasil!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(`Login Gagal: ${message}`);
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Register Section
  const register = async (data: {
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      await authAPI.register(data);

      toast.success("Registrasi Berhasil!", {
        description: "Silakan login dengan akun Anda.",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(`Registrasi Gagal: ${message}`);
      console.error("Registration failed:", error);
      throw error;
    }
  };

  // Logout Section
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      Cookies.remove("access_token");
      setUser(null);
      setIsAdmin(false);
      toast.success("Logout Berhasil");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, login, logout, register, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
