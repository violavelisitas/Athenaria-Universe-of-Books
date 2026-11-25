"use client";

import { useFormStatus } from "react-dom";

// Submit button that disables itself while its parent form is submitting
export default function SubmitButton({
  children,
  pendingText = "Memproses...",
  className = "",
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
