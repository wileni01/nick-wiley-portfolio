import Link from "next/link";
import { Linkedin, Mail } from "lucide-react";

const footerLinks = [
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/resume", label: "Resume" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-12 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-lg font-bold text-foreground"
            >
              Nick Wiley
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI Solutions Architect — human-in-the-loop decision support for
              high-stakes public sector work.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Navigation
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Connect
            </h3>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com/in/nicholas-a-wiley-975b3136"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-md"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:wileni01@gmail.com"
                aria-label="Email"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-md"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Alexandria, VA
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Nicholas A. Wiley. Built with
            Next.js and Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
}
