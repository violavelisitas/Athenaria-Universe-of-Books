import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { Cormorant_Garamond } from "next/font/google";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata = {
  title: "Athenaria | Universe of Books",
  description: "Perpustakaan digital: temukan buku, ajukan pinjam, pantau denda.",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html
      lang="id"
    >
      <body className={`${display.variable} flex min-h-screen flex-col`}>
        <Navbar user={user} />
        
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pt-16">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  );
}
