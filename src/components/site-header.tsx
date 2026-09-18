import Link from "next/link";
import { Sparkles } from "lucide-react";
import GithubIcon from "@/components/github-icon";
import { site } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <span className="chip grid h-8 w-8 place-items-center rounded-lg">
            <Sparkles className="h-4 w-4" />
          </span>
          {site.name}
        </Link>

        <nav aria-label="External links" className="flex items-center gap-1 text-sm">
          <a
            href={site.portfolio}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-3 py-2 text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            Portfolio
          </a>
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer"
            aria-label="Source code on GitHub"
            className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
