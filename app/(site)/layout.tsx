import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />

      {/* Main content shifted right */}
      <main className="min-h-screen max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}