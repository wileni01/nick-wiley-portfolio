import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { AnchorHTMLAttributes, ReactNode } from "react";

function MdxLink({
  href = "",
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  const isExternal = /^https?:\/\//.test(href);
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

const components = {
  a: MdxLink,
};

/**
 * Renders the body of a content/*.mdx file. Compiles real MDX (headings,
 * lists, links, emphasis, code, blockquotes) instead of the previous
 * regex-based converter, and never uses dangerouslySetInnerHTML.
 */
export function MdxContent({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
