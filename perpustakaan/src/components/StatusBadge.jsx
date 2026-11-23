const STYLES = {
  "Menunggu Konfirmasi": "bg-yellow-900 text-yellow-200",
  "Sedang Dipinjam": "bg-blue-900 text-blue-200",
  Selesai: "bg-green-900 text-green-200",
  Ditolak: "bg-red-900 text-red-200",
  Draft: "bg-slate-700 text-slate-200",
  Published: "bg-green-900 text-green-200",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs ${
        STYLES[status] ?? "bg-slate-700 text-slate-200"
      }`}
    >
      {status}
    </span>
  );
}
