import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-inner">
        <div><Link href="/" className="wordmark">Nick Wiley</Link><p>{siteConfig.location}</p></div>
        <nav aria-label="Contact links">
          <Link href="/contact">Contact</Link>
          <a href={siteConfig.linkedin}>LinkedIn</a>
        </nav>
      </div>
    </footer>
  );
}
