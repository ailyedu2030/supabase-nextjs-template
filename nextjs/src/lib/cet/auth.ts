import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createSPAClient } from '@/lib/supabase/client';

// Create a singleton supabase client for browser
const supabase = typeof window !== 'undefined' ? createSPAClient() : null;
// Auth state
const authState = {
  user: null as User | null,
  loading: true,
};

// Listeners
const listeners = new Set<(user: User | null, loading: boolean) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener(authState.user, authState.loading));
}

// Initialize auth state on mount (client-side only)
if (typeof window !== 'undefined') {
  // Get initial session
  supabase?.auth.getSession().then(({ data: { session } }) => {
    authState.user = session?.user ?? null;
    authState.loading = false;
    notifyListeners();
  });

  // Listen for auth changes
  supabase?.auth.onAuthStateChange((_event, session) => {
    authState.user = session?.user ?? null;
    authState.loading = false;
    notifyListeners();
  });
}

// Custom hook to use auth - works without provider
export function useAuth() {
  const [user, setUser] = useState<User | null>(authState.user);
  const [loading, setLoading] = useState(authState.loading);

  useEffect(() => {
    const listener = (newUser: User | null, newLoading: boolean) => {
      setUser(newUser);
      setLoading(newLoading);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { user, loading };
}

// Sign in function
export async function signIn(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase not initialized') };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

// Sign up function
export async function signUp(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase not initialized') };
  const { error } = await supabase.auth.signUp({ email, password });
  return { error };
}

// Sign out function
export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// Reset password function
export async function resetPassword(email: string) {
  if (!supabase) return { error: new Error('Supabase not initialized') };
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
}

// Get current session (server-side compatible)
export async function getSession() {
  if (!supabase) return { session: null, error: null };
  return await supabase.auth.getSession();
}

// Get current user
export async function getUser() {
  if (!supabase) return { user: null, error: null };
  return await supabase.auth.getUser();
}
