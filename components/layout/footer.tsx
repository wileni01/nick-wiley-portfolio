import Link from "next/link";
import { Code2, Github, Linkedin, Mail } from "lucide-react";

const footerLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/chat", label: "Chat with AI" },
  { href: "/experience", label: "Experience" },
  { href: "/skills", label: "Skills" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  {
    href: "https://github.com/nickwiley",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "https://linkedin.com/in/nickwiley",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "mailto:nick@example.com",
    label: "Email",
    icon: Mail,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-12 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="gradient-text">Nick Wiley</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Full-Stack Engineer & AI Solutions Architect. Building
              production-grade web applications with AI integration.
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

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Connect
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-md"
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Nick Wiley. Built with Next.js, Tailwind CSS, and AI.</p>
        </div>
      </div>
    </footer>
  );
}
