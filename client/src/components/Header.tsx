import { BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-primary transform rotate-12 p-2 neo-brutal-box">
              <BookmarkIcon className="h-8 w-8 transform -rotate-12" />
            </div>
            <h1 className="ml-3 text-3xl font-bold font-space tracking-tight">Bookmarko</h1>
          </div>
          <div>
            <Button className="neo-brutal-box bg-secondary hover:bg-secondary/90 px-4 py-2 font-bold">
              Login
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
