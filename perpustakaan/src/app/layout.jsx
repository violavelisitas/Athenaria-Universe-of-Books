import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Pustaka Senja",
  description: "Ruang baca dan perpustakaan komunitas",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html
      lang="id"
    >
      <body className="flex min-h-screen flex-col">
        <Navbar user={user} />
        
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  );
}
