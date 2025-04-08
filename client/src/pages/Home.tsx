import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import BookmarkManager from "@/components/BookmarkManager";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen font-inter">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username}!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your bookmarks below. Add new ones, organize with tags, and find them easily with search.
          </p>
        </div>
        
        <AddBookmarkForm />
        <BookmarkManager />
      </main>
      
      <Footer />
    </div>
  );
}
