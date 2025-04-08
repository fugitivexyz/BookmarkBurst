import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import BookmarkManager from "@/components/BookmarkManager";

export default function Home() {
  return (
    <div className="min-h-screen font-inter">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AddBookmarkForm />
        <BookmarkManager />
      </main>
      
      <Footer />
    </div>
  );
}
