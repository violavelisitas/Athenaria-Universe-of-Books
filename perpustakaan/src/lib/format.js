export function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRupiah(amount) {
  return `Rp ${Number(amount ?? 0).toLocaleString("id-ID")}`;
}

// Format:YYYY-MM-DD
export function toDateInputValue(value) {
  const date = value ? new Date(value) : new Date();
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}