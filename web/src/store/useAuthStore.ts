import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  email: string | null;
  setEmail: (email: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      email: null,
      setEmail: (email: string) => set({ email }),
      logout: () => set({ email: null }),
      isAuthenticated: () => Boolean(get().email),
    }),
    {
      name: "auth-storage",
    },
  ),
);
