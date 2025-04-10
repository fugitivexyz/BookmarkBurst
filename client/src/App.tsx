import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Auth callback handler component
function AuthCallbackHandler() {
  const { toast } = useToast();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process any hash parameters that might be present
        if (window.location.hash) {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            toast({
              title: "Authentication error",
              description: error.message,
              variant: "destructive",
            });
          } else if (data?.session) {
            toast({
              title: "Authentication successful",
              description: "You have been logged in successfully.",
              variant: "default",
              className: "border-green-500 bg-green-50",
            });
            // Redirect to home page
            window.location.href = "/";
            return;
          }
        }
      } catch (err) {
        console.error("Error processing auth callback:", err);
      }
    };
    
    handleAuthCallback();
  }, [toast]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Verifying your authentication...</h2>
        <p className="text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/callback" component={AuthCallbackHandler} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
