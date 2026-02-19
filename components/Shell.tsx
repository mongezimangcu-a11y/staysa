import Link from "next/link";
import { Badge } from "./ui";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            StaySA <span className="font-semibold text-gray-500">Business Travel</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link className="text-sm text-gray-700 hover:underline" href="/listings">Browse</Link>
            <Link className="text-sm text-gray-700 hover:underline" href="/list-property">List Property</Link>
            <Link className="text-sm text-gray-700 hover:underline" href="/admin/login">Admin</Link>
            <Badge>Gauteng MVP</Badge>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
          Gauteng only (MVP). Secure. Private. EFT supported.
        </div>
      </footer>
    </div>
  );
}
