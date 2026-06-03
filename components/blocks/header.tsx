import { cn } from "@/lib/utils";
import type { WebsiteTheme } from "@/lib/validations/website";

type HeaderProps = {
  logoText: string;
  navLinks: string[];
  theme: WebsiteTheme;
};

export function Header({ logoText, navLinks, theme }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur supports-[backdrop-filter]:bg-background/80",
        theme.stylePreset === "apple" && "border-black/5 bg-white/80",
      )}
      style={{ backgroundColor: `${theme.backgroundColor}f2` }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span
          className="text-lg font-bold tracking-tight"
          style={{ color: theme.textColor }}
        >
          {logoText}
        </span>
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: theme.mutedTextColor }}
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
