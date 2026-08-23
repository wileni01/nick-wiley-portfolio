import Link from "next/link";
import { Mail } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin-icon";
import { siteConfig, mailtoUrl } from "@/lib/site";

const footerLinks = [
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Products" },
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
              Product and delivery leadership for AI in government.
              Systems people can trust and actually use.
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
                href={siteConfig.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-md"
              >
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a
                href={mailtoUrl()}
                aria-label="Email"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-md"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {siteConfig.location}
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
