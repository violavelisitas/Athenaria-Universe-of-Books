import { BookOpen, ClipboardCheck, Megaphone, Star } from "lucide-react";

const FEATURES = [
  { icon: BookOpen, title: "Koleksi Lengkap", text: "Dari buku klasik hingga modern" },
  { icon: ClipboardCheck, title: "Pinjam Online", text: "Ajukan dari mana saja, ambil di perpustakaan" },
  { icon: Megaphone, title: "Info Terkini", text: "Pengumuman layanan dan acara" },
  { icon: Star, title: "Ulasan Pembaca", text: "Pilih buku lewat rating dan ulasan" },
];

export default function FeatureStrip() {
  return (
    <section className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 py-8 lg:grid-cols-4">
      {FEATURES.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-start gap-3">
          <Icon className="mt-1 h-6 w-6 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-slate-100">{title}</p>
            <p className="text-xs text-slate-400">{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}