export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[rgb(9,4,24)] px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-400">
          ATHENARIA
        </p>
        <p className="text-xs text-slate-500">
          &copy; 2026 Athenaria. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}