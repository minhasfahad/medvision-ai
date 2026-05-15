import { create, StateCreator } from 'zustand';
import { PersistOptions } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  age?: number;
  image?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  updateUser: (data: Partial<User>) => void;
  setAuth: (user: User, token: string) => void;
  clear: () => void;
}

const authCreator: StateCreator<AuthState> = (set) => {
  
  const initValue: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    
    setAuth: function(user: User, token: string) {
      const isAuthenticated = user != null && token != null;
      set({ user, token, isAuthenticated });
    },
    
    clear: function() {
      set({ user: null, token: null, isAuthenticated: false });
    },

    // --- NEW: This updates the user's data in the browser's memory ---
    updateUser: function(data: Partial<User>) {
      set((state) => ({
        // If user exists, merge the old data with the new data. Otherwise, keep it null.
        user: state.user ? { ...state.user, ...data } : null
      }));
    }
  };

  return initValue;
};

const options: PersistOptions<AuthState> = {
  name: 'auth-storage',
  storage: createJSONStorage(() => localStorage)
};

const persistState = persist(authCreator, options);

export const useAuthStore = create<AuthState>()(persistState);