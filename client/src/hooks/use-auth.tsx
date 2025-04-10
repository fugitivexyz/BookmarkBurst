import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { z } from "zod";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

const userSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export type UserData = z.infer<typeof userSchema>;

type AuthContextType = {
  user: UserData | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
  emailVerificationSent: boolean;
  clearEmailVerificationState: () => void;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  username: string;
};

function useLoginMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ email, password }: LoginData) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw new Error(error.message);
      
      // Check if the user has a profile
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
        
        // If no profile exists, create one
        if (!profileData && (!profileError || profileError.message.includes("contains 0 rows"))) {
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: email.split('@')[0],
              updated_at: new Date().toISOString(),
            });
        }
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Force a session check and user profile fetch
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useRegisterMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ email, password, username }: RegisterData) => {
      // Get the current URL origin for redirect
      // Use the production URL explicitly for email redirects
      const productionSiteUrl = "https://bookmarko.engn.dev";
      
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: productionSiteUrl,
          data: {
            username,
          }
        }
      });
      
      if (authError) throw new Error(authError.message);
      
      // 2. Create a profile with the username
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username,
            updated_at: new Date().toISOString(),
          });
          
        if (profileError) throw new Error(profileError.message);
      }
      
      return authData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      
      toast({
        title: "Registration successful",
        description: "Please check your email for a verification link. Check your spam folder if you don't see it within a few minutes.",
        variant: "default", 
        className: "border-green-500 bg-green-50",
        duration: 10000, // Show for 10 seconds
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useLogoutMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      try {
        // Explicitly set scope to global to ensure all devices are logged out
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        
        if (error) throw new Error(error.message);
        
        // Clear any local state if needed
        return { success: true };
      } catch (error) {
        console.error("Logout error:", error);
        // Try a fallback local signout if the global one fails
        try {
          await supabase.auth.signOut({ scope: 'local' });
          return { success: true, fallback: true };
        } catch (fallbackError) {
          console.error("Fallback logout failed:", fallbackError);
          throw error; // Re-throw the original error
        }
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      
      if (data.fallback) {
        toast({
          title: "Logged out (local only)",
          description: "You've been logged out on this device.",
        });
      } else {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
      }
      
      // Force a redirect to home page
      window.location.href = '/';
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Auth session missing!",
        variant: "destructive",
      });
      
      // Even if server-side logout failed, invalidate local auth state
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const registerMutation = useRegisterMutation();
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  
  // Get the current session and user
  const {
    data,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      // Handle any auth redirect parameters in the URL
      if (window.location.hash && window.location.hash.includes('access_token')) {
        await supabase.auth.getSession();
      }
      
      // First check if the session is healthy
      const isHealthy = await checkSessionHealth();
      
      if (!isHealthy) {
        // Session is invalid, return null session
        return { session: null, user: null };
      }
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        return { session: null, user: null };
      }
      
      // Get the user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', sessionData.session.user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        
        // Check if the error is because no rows were found
        if (profileError.message.includes("contains 0 rows")) {
          // Create a profile for the user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: sessionData.session.user.id,
              username: sessionData.session.user.email?.split('@')[0] || 'user',
              updated_at: new Date().toISOString(),
            });
            
          if (insertError) {
            console.error("Error creating user profile:", insertError);
            return { session: sessionData.session, user: null };
          }
          
          // Fetch the newly created profile
          const { data: newProfileData, error: newProfileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (newProfileError) {
            console.error("Error fetching new user profile:", newProfileError);
            return { session: sessionData.session, user: null };
          }
          
          return { 
            session: sessionData.session,
            user: {
              id: sessionData.session.user.id,
              username: newProfileData.username,
            } 
          };
        }
        
        return { session: sessionData.session, user: null };
      }
      
      return { 
        session: sessionData.session,
        user: {
          id: sessionData.session.user.id,
          username: profileData.username,
        } 
      };
    },
  });
  
  const clearEmailVerificationState = () => {
    setEmailVerificationSent(false);
  };
  
  // Listen for auth changes
  useEffect(() => {
    // First check if there's a hash in the URL that indicates email verification
    const handleVerificationResponse = async () => {
      if (window.location.hash.includes('#access_token=')) {
        try {
          // Process the hash fragment from the URL
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Verification error:', error);
            toast({
              title: "Verification failed",
              description: error.message,
              variant: "destructive",
            });
          } else if (data?.session) {
            // Successfully verified and logged in
            queryClient.invalidateQueries({ queryKey: ["auth-user"] });
            toast({
              title: "Email verified",
              description: "Your email has been verified and you're now logged in.",
            });
            
            // Redirect to home page after successful verification
            window.location.href = '/';
          }
        } catch (err) {
          console.error('Error processing verification:', err);
        }
      }
    };
    
    // Handle the verification if present in URL
    handleVerificationResponse();
    
    // Set up the regular auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      
      console.log('Auth state change event:', event);
      
      // Check for sign up event to track email verification status
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // When the user completes email verification, they'll be signed in
        const isJustCreated = loginMutation.isIdle && registerMutation.isSuccess;
        if (isJustCreated) {
          setEmailVerificationSent(true);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [loginMutation.isIdle, registerMutation.isSuccess, queryClient, toast]);
  
  return (
    <AuthContext.Provider
      value={{
        user: data?.user ?? null,
        session: data?.session ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        emailVerificationSent,
        clearEmailVerificationState,
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

// Utility function to check session health and recover if needed
export async function checkSessionHealth() {
  try {
    // Get the current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session health check error:", error);
      return false;
    }
    
    if (!data.session) {
      console.warn("No session found during health check");
      return false;
    }
    
    // Check if the session is valid by making a small authenticated request
    const { error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error("Session validity test failed:", testError);
      
      // If it's an auth error, clear the session
      if (testError.code === 'PGRST301' || testError.code === '401') {
        await supabase.auth.signOut({ scope: 'local' });
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error("Unexpected error during session health check:", err);
    return false;
  }
}