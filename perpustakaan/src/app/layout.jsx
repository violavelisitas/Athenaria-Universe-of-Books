
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { Cormorant_Garamond } from "next/font/google";
import AppFrame from "@/components/AppFrame";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata = {
  title: "Athenaria | Universe of Books",
  description:
    "Perpustakaan digital: temukan buku, ajukan pinjam, pantau denda.",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="id">
      <body className={`${display.variable} flex min-h-screen w-full flex-col overflow-x-clip`}>
        <Navbar user={user} />

        <AppFrame user={user}>
          {children}
        </AppFrame>
      </body>
    </html>
  );
}
