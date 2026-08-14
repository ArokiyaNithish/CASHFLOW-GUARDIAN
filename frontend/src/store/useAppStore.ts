import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Snapshot, Forecast, User } from '../types';

interface AppState {
  user: User | null;
  token: string | null;
  companyId: string | null;
  snapshot: Snapshot | null;
  latestForecast: Forecast | null;

  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setSnapshot: (snap: Snapshot) => void;
  setForecast: (fc: Forecast) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      companyId: null,
      snapshot: null,
      latestForecast: null,

      setAuth: (user, token) => set({
        user,
        token,
        companyId: user?.company_id || null,
      }),
      logout: () => set({
        user: null,
        token: null,
        companyId: null,
        snapshot: null,
        latestForecast: null,
      }),
      setSnapshot: (snap) => set({ snapshot: snap }),
      setForecast: (fc) => set({ latestForecast: fc }),
    }),
    {
      name: 'cashflow-guardian-v3',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        companyId: state.companyId,
      }),
    }
  )
);
