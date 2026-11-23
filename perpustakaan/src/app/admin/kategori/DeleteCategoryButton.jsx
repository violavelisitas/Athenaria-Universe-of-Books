"use client";

import { deleteCategoryAction } from "./actions";

export default function DeleteCategoryButton({ id, name }) {
  return (
    <form
      action={deleteCategoryAction.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`Hapus kategori "${name}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm text-red-400 hover:underline">
        Hapus
      </button>
    </form>
  );
}