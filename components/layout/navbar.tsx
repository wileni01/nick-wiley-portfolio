"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

const links = [
  { href: "/work", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Résumé" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="site-header no-print">
      <div className="site-shell header-inner">
        <Link href="/" className="wordmark">Nick Wiley</Link>
        <nav aria-label="Main navigation">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}>{label}</Link>
          ))}
          <button type="button" aria-label="Search site" onClick={() => document.dispatchEvent(new Event("open-site-search"))}>
            <Search size={17} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  );
}
