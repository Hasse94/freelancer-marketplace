"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as apiClient from "@/app/lib/api";
import { TOKEN_KEY } from "@/app/lib/api";
import type { ClientProfile, FreelancerProfile, User } from "@/app/lib/types";

interface AuthState {
  user: User | null;
  clientProfile: ClientProfile | null;
  freelancerProfile: FreelancerProfile | null;
  /** True while the initial session restore is in flight */
  loading: boolean;
  isLoggedIn: boolean;
  isClient: boolean;
  isFreelancer: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Re-fetch client/freelancer profiles (e.g. after creating one) */
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function fetchProfiles(): Promise<{
  clientProfile: ClientProfile | null;
  freelancerProfile: FreelancerProfile | null;
}> {
  // Both endpoints 404 when the profile doesn't exist — that's not an error
  const [clientProfile, freelancerProfile] = await Promise.all([
    apiClient.getMyClientProfile().catch(() => null),
    apiClient.getMyFreelancerProfile().catch(() => null),
  ]);
  return { clientProfile, freelancerProfile };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [freelancerProfile, setFreelancerProfile] =
    useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const me = await apiClient.getMe();
      const profiles = await fetchProfiles();
      setUser(me);
      setClientProfile(profiles.clientProfile);
      setFreelancerProfile(profiles.freelancerProfile);
    } catch {
      // Token missing, expired or invalid — clear the session
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setClientProfile(null);
      setFreelancerProfile(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    loadSession().finally(() => setLoading(false));
  }, [loadSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await apiClient.login(email, password);
      localStorage.setItem(TOKEN_KEY, access_token);
      await loadSession();
    },
    [loadSession]
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      await apiClient.register(email, password);
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setClientProfile(null);
    setFreelancerProfile(null);
  }, []);

  const refreshProfiles = useCallback(async () => {
    const profiles = await fetchProfiles();
    setClientProfile(profiles.clientProfile);
    setFreelancerProfile(profiles.freelancerProfile);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      clientProfile,
      freelancerProfile,
      loading,
      isLoggedIn: user !== null,
      isClient: clientProfile !== null,
      isFreelancer: freelancerProfile !== null,
      login,
      signup,
      logout,
      refreshProfiles,
    }),
    [user, clientProfile, freelancerProfile, loading, login, signup, logout, refreshProfiles]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
