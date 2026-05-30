"use client";

import { useFormStatus } from "react-dom";

export function FormSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-highlight px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-highlight/85 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : label}
    </button>
  );
}
