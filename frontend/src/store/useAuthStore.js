import { create } from "zustand";
import { apiClient, registerUnauthorizedHandler } from "../services/apiClient";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  async checkAuth() {
    try {
      const response = await apiClient.get("/auth");

      if (response.data?.isAuth && response.data?.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return response.data.user;
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return null;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return null;
    }
  },

  async login(credentials) {
    set({ isLoading: true });

    try {
      const response = await apiClient.post("/auth/login", credentials);

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return response.data.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async signup(payload) {
    set({ isLoading: true });

    try {
      const response = await apiClient.post("/auth/signup", payload);

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return response.data.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Always clear local state, even if the session already expired.
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  handleSessionExpired() {
    const state = get();

    if (!state.isAuthenticated && !state.user) {
      set({ isLoading: false });
      return;
    }

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));

registerUnauthorizedHandler(() => {
  useAuthStore.getState().handleSessionExpired();
});
