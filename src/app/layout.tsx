import "./globals.css";
import Link from "next/link";
import UserMenu from "@/components/UserMenu";

const NavItem = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="px-3 py-2 rounded-lg hover:bg-zinc-900 active:bg-zinc-800 transition border border-transparent hover:border-zinc-800 text-sm"
  >
    {label}
  </Link>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <header className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xl font-semibold">Organize.ia</span>
              <span className="text-sm text-zinc-500">
                Organização • Rotina • Desempenho
              </span>
            </div>

            <div className="flex items-center gap-3">
              <nav className="flex gap-1">
                <NavItem href="/organization" label="Organização" />
                <NavItem href="/routine" label="Rotina" />
                <NavItem href="/performance" label="Desempenho" />
              </nav>

              <UserMenu />
            </div>
          </header>

          <main className="mt-6">{children}</main>

          <footer className="mt-10 text-xs text-zinc-500">
            MVP gratuito — Next.js + Supabase
          </footer>
        </div>
      </body>
    </html>
  );
}