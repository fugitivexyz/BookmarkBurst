import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Loader2, Mail, AlertCircle, BookmarkIcon, TagIcon, Search, RefreshCw, Smartphone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Email and password validation schema
const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation, emailVerificationSent, clearEmailVerificationState } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Define login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Define register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  // Handle register form submission
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      // Remove confirmPassword as it's not needed by the API
      const { confirmPassword, ...userData } = data;
      await registerMutation.mutateAsync(userData);
      
      // Toast is already shown by the mutation's onSuccess handler
      // No need to show another toast here
    } catch (error) {
      // The error will be handled by the mutation's onError handler
      console.error("Registration error:", error);
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "login") {
      clearEmailVerificationState();
    }
  };
  
  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/"); // Force navigation to home
    }
  }, [user, setLocation]);

  // If login is successful but user isn't present yet, don't render any content
  // This prevents the flash of login page when user is actually logged in
  if (loginMutation.isSuccess && !user && !emailVerificationSent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8f3e8]">
      {/* Left section with forms */}
      <div className="flex flex-col justify-center w-full md:w-1/2 p-4 md:p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold">Bookmarko</h1>
            <p className="text-gray-700">
              Login or create an account to manage your bookmarks
            </p>
          </div>
          
          {emailVerificationSent && (
            <Alert className="mb-4 neo-brutal-box">
              <Mail className="h-4 w-4" />
              <AlertTitle>Verification Email Sent</AlertTitle>
              <AlertDescription>
                Please check your email for a verification link to complete your registration.
                You can close this page and click the link when you receive it.
              </AlertDescription>
            </Alert>
          )}
          
          {loginMutation.isError && (
            <Alert variant="destructive" className="mb-4 neo-brutal-box">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                {loginMutation.error?.message || "There was an error logging in. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          <div className="border-3 border-black">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-0 rounded-none h-auto bg-white">
                <TabsTrigger 
                  value="login" 
                  className="py-3 border-r-3 border-black rounded-none data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="py-3 rounded-none data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login" className="border-t-3 border-black mt-0 p-4">
                <h2 className="font-bold text-xl mb-2">Login</h2>
                <p className="text-gray-600 mb-4 text-sm">
                  Enter your email and password to access your bookmarks
                </p>
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email" 
                              {...field} 
                              className="border-3 border-black focus-visible:ring-0 focus-visible:ring-offset-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              {...field} 
                              className="border-3 border-black focus-visible:ring-0 focus-visible:ring-offset-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#ff5050] text-black hover:bg-[#ff5050]/90 border-3 border-black" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Registration Form */}
              <TabsContent value="register" className="border-t-3 border-black mt-0 p-4">
                <h2 className="font-bold text-xl mb-2">Create an account</h2>
                <p className="text-gray-600 mb-4 text-sm">
                  Enter your details to create a new account
                </p>
                
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email" 
                              {...field} 
                              className="border-3 border-black focus-visible:ring-0 focus-visible:ring-offset-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Choose a username" 
                              {...field} 
                              className="border-3 border-black focus-visible:ring-0 focus-visible:ring-offset-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Create a password" 
                              {...field} 
                              className="border-3 border-black focus-visible:ring-0 focus-visible:ring-offset-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm your password" 
                              {...field} 
                              className="border-3 border-black focus-visible:ring-0 focus-visible:ring-offset-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#ff5050] text-black hover:bg-[#ff5050]/90 border-3 border-black" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Right section hero */}
      <div className="hidden md:flex md:w-1/2 bg-[#f8f3e8] flex-col justify-center items-center p-8">
        <div className="max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Organize Your Web</h1>
            <p className="text-xl">
              Keep your favorite websites organized with our powerful bookmark manager. Save, tag, and find your bookmarks easily.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="neo-brutal-box bg-white p-4 text-center">
              <div className="flex justify-center mb-2">
                <TagIcon className="h-6 w-6" />
              </div>
              <h3 className="font-bold mb-1">Smart Tags</h3>
              <p className="text-sm">Organize with custom filters</p>
            </div>
            
            <div className="neo-brutal-box bg-white p-4 text-center">
              <div className="flex justify-center mb-2">
                <BookmarkIcon className="h-6 w-6" />
              </div>
              <h3 className="font-bold mb-1">Auto Metadata</h3>
              <p className="text-sm">Titles and descriptions generated</p>
            </div>
            
            <div className="neo-brutal-box bg-white p-4 text-center">
              <div className="flex justify-center mb-2">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-bold mb-1">Search</h3>
              <p className="text-sm">Find your bookmarks instantly</p>
            </div>
            
            <div className="neo-brutal-box bg-white p-4 text-center">
              <div className="flex justify-center mb-2">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="font-bold mb-1">Cross-Platform</h3>
              <p className="text-sm">Access from any device</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="neo-brutal-box bg-[#b8a6ff] p-6 pt-8 w-full max-w-md relative">
              <div className="absolute -top-4 -right-4 bg-[#ffcb45] neo-brutal-box p-3 transform rotate-12">
                <BookmarkIcon className="h-8 w-8 transform -rotate-12" />
              </div>
              <div className="text-2xl font-bold mb-2">BOOKMARKO</div>
              <p className="mb-0">Save links. Tag them. Search instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}