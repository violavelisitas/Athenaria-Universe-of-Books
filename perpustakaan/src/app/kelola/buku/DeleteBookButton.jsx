"use client";

import { deleteBookAction } from "./actions";

export default function DeleteBookButton({ id, title }) {
  return (
    <form
      action={deleteBookAction.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`Hapus buku "${title}"?`)) {
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