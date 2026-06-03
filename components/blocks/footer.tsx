import type { WebsiteTheme } from "@/lib/validations/website";

type FooterProps = {
  copyrightText: string;
  bottomLinks: string[];
  theme: WebsiteTheme;
};

export function Footer({ copyrightText, bottomLinks, theme }: FooterProps) {
  return (
    <footer
      className="w-full"
      style={{
        backgroundColor: theme.textColor,
        color: theme.backgroundColor,
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <p className="text-sm opacity-80">{copyrightText}</p>
        <nav className="flex flex-wrap items-center justify-center gap-6">
          {bottomLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm opacity-80 transition-opacity hover:opacity-100"
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
