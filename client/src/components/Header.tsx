import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookmarkIcon, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountInfoDialog } from "@/components/AccountInfoDialog";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [accountInfoOpen, setAccountInfoOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleMyAccountClick = () => {
    setAccountInfoOpen(true);
  };

  return (
    <header className="bg-primary text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookmarkIcon className="h-6 w-6" />
          <h1 className="text-xl font-bold">Bookmarko</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-white hover:bg-primary/90">
                    <User className="h-4 w-4" />
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleMyAccountClick} className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <AccountInfoDialog
                open={accountInfoOpen}
                onOpenChange={setAccountInfoOpen}
              />
            </>
          )}

          {!user && (
            <Link href="/auth">
              <Button variant="secondary">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}