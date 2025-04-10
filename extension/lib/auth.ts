import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

// Chrome API type declarations for TypeScript
declare const chrome: {
  runtime: {
    lastError?: Error;
  };
  storage: {
    local: {
      get: (keys: string | string[] | null, callback: (items: Record<string, any>) => void) => void;
      set: (items: Record<string, any>, callback?: () => void) => void;
      remove: (keys: string | string[], callback?: () => void) => void;
    };
  };
};

const SESSION_KEY = 'supabase_session';

// Save session to Chrome storage
export const saveSession = (session: Session): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [SESSION_KEY]: session }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

// Get session from Chrome storage
export const getSession = (): Promise<Session | null> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([SESSION_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[SESSION_KEY] || null);
      }
    });
  });
};

// Clear session from Chrome storage
export const clearSession = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove([SESSION_KEY], () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await getSession();
    
    // If no session is stored, user is not authenticated
    if (!session) return false;
    
    // Get Supabase client
    const supabase = await getSupabaseClient();
    if (!supabase) return false;
    
    // Check if session is valid and refresh if needed
    const { data, error } = await supabase.auth.refreshSession(session);
    
    if (error || !data.session) {
      await clearSession();
      return false;
    }
    
    // Save updated session
    await saveSession(data.session);
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<boolean> => {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not configured');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error || !data.session) {
      throw error || new Error('No session returned');
    }
    
    // Save session
    await saveSession(data.session);
    return true;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    const supabase = await getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    await clearSession();
  } catch (error) {
    console.error('Sign out error:', error);
    // Still clear the session even if there's an error with the API
    await clearSession();
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const session = await getSession();
    if (!session) return null;
    
    const supabase = await getSupabaseClient();
    if (!supabase) return null;
    
    const { data, error } = await supabase.auth.getUser(session.access_token);
    
    if (error || !data.user) {
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Store user in Chrome storage
export const storeUser = (user: User | null): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ user }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

// Get user from Chrome storage
export async function getUser(): Promise<User | null> {
  return new Promise<User | null>((resolve, reject) => {
    chrome.storage.local.get(['user'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.user || null);
      }
    });
  });
}

// Get user and refresh session if needed
export async function getUserWithFreshSession() {
  try {
    const session = await getSession();
    
    if (session) {
      const supabase = await getSupabaseClient();
      if (!supabase) return null;
      
      // Set the session in Supabase
      const { data, error } = await supabase.auth.setSession(session);
      
      if (error) {
        await clearAuth();
        return null;
      }
      
      if (data.session) {
        await saveSession(data.session);
        await storeUser(data.user);
        return data.user;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user with fresh session:', error);
    return null;
  }
}

// Clear auth data from storage
export const clearAuth = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove([SESSION_KEY, 'user'], () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

// Initialize authentication system
export async function initAuth(): Promise<void> {
  try {
    // Check if there's an existing session and validate it
    const session = await getSession();
    if (session) {
      const supabase = await getSupabaseClient();
      if (supabase) {
        // Set the session in the Supabase client
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        
        // Get and store the user
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          await storeUser(data.user);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    // Clear auth data if there was an error
    await clearAuth();
  }
}

// Sign up a new user
export async function signUp(email: string, password: string): Promise<void> {
  const supabase = await getSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
} 