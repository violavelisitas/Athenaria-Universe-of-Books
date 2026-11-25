"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "rounded-lg bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-400 [color-scheme:dark]";

export default function CatalogFilters({
  keyword,
  categoryId,
  sortKey,
  hasSort,
  categories,
  sorts,
}) {
  const router = useRouter();
  const formRef = useRef(null);
  const timer = useRef(null);

  function apply() {
    const data = new FormData(formRef.current);
    const params = new URLSearchParams();
    for (const [key, value] of data) {
      if (String(value).trim()) params.set(key, String(value).trim());
    }
    router.replace(`/katalog?${params.toString()}`);
  }

  function onTextChange() {
    clearTimeout(timer.current);
    timer.current = setTimeout(apply, 300);
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="mb-6 grid gap-3 sm:grid-cols-4"
    >
      <input
        name="q"
        defaultValue={keyword ?? ""}
        onChange={onTextChange}
        placeholder="Cari judul atau pengarang..."
        autoComplete="off"
        className={`${inputClass} sm:col-span-2`}
      />

      <select
        name="category"
        defaultValue={categoryId ? String(categoryId) : ""}
        onChange={apply}
        className={inputClass}
      >
        <option value="">Semua kategori</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nama}
          </option>
        ))}
      </select>

      <select
        name="sort"
        defaultValue={hasSort ? sortKey : ""}
        onChange={apply}
        className={inputClass}
      >
        <option value="">Urutkan</option>
        {sorts.map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}