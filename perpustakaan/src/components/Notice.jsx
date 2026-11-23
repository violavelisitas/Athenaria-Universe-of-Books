const TONES = {
  success: "bg-green-950 text-green-300",
  error: "bg-red-950 text-red-300",
  info: "bg-slate-800 text-slate-200",
};

export default function Notice({ tone = "info", children }) {
  return (
    <p className={`mb-4 rounded-lg px-3 py-2 text-sm ${TONES[tone] ?? TONES.info}`}>
      {children}
    </p>
  );
}
