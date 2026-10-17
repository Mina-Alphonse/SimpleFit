"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface Profile {
  id: string;
  age: number;
  biologicalSex: "male" | "female";
  heightCm: string;
  currentWeightKg: string;
  goalWeightKg?: string | null;
  activityLevel: string;
  fitnessExperience: string;
  trainingEnvironment: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatsG: number;
  bmr: number;
  tdee: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  activeMealPlan: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeMealPlan, setActiveMealPlan] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setProfile(data.profile || null);
          setActiveMealPlan(data.activeMealPlan || null);
        } else {
          setUser(null);
          setProfile(null);
          setActiveMealPlan(null);
        }
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Authentication failed" };
      }
      setUser(data.user);
      setIsAuthModalOpen(false);
      await refreshSession();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error during login" };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }
      setUser(data.user);
      setIsAuthModalOpen(false);
      await refreshSession();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error during registration" };
    }
  };

  const loginAsDemo = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setProfile(data.profile || null);
        setIsAuthModalOpen(false);
        await refreshSession();
      }
    } catch (err) {
      console.error("Demo login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    document.cookie = "simplefit_token=; Max-Age=0; path=/;";
    setUser(null);
    setProfile(null);
    setActiveMealPlan(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeMealPlan,
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
        refreshSession,
        isAuthModalOpen,
        setIsAuthModalOpen,
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
