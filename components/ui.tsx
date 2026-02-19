import Link from "next/link";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  children,
  className,
  href,
  type = "button",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition border " +
    "bg-black text-white border-black hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed";
  if (href) {
    return (
      <Link className={cn(base, className)} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cn(base, className)}>
      {children}
    </button>
  );
}

export function OutlineButton(props: Parameters<typeof Button>[0]) {
  return (
    <Button
      {...props}
      className={cn("bg-white text-black border-gray-200 hover:bg-gray-50", props.className)}
    />
  );
}

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-gray-700">{label}</div> : null}
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none",
          "focus:ring-2 focus:ring-black/10 focus:border-gray-300",
          props.className || ""
        )}
      />
    </label>
  );
}

export function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-gray-700">{label}</div> : null}
      <textarea
        {...props}
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none",
          "focus:ring-2 focus:ring-black/10 focus:border-gray-300",
          props.className || ""
        )}
      />
    </label>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">{children}</div>;
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
      {children}
    </span>
  );
}
