import { AuthForms } from "@/components/AuthForms";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function Auth() {
  // Redirect authenticated users to the homepage
  useAuthRedirect({ redirectAuthenticated: true });

  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      <AuthForms />
    </div>
  );
}