import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useUserStore = create<UserState>()(persist(
  (set, get) => ({
    user: null,
    session: null,
    isLoading: false,
    isInitialized: false,
    
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session, user: session?.user || null }),
    setIsLoading: (isLoading) => set({ isLoading }),
    
    signOut: async () => {
      set({ isLoading: true });
      try {
        await supabase.auth.signOut();
        set({ user: null, session: null });
      } catch (error) {
        console.error('Sign out error:', error);
      } finally {
        set({ isLoading: false });
      }
    },
    
    initialize: async () => {
      if (get().isInitialized) return;
      
      set({ isLoading: true });
      try {
        const { data: { session } } = await supabase.auth.getSession();
        set({ session, user: session?.user || null, isInitialized: true });
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
          set({ session, user: session?.user || null });
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        set({ isLoading: false });
      }
    }
  }),
  {
    name: 'user-store',
    partialize: (state) => ({ 
      user: state.user,
      session: state.session 
    })
  }
));
