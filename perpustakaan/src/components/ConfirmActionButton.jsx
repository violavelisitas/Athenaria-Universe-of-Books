"use client";

// A form button that asks for confirmation before running a Server Action
export default function ConfirmActionButton({
  action,
  message,
  children,
  className = "text-sm text-red-400 hover:underline",
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
