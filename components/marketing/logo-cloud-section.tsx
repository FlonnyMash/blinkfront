import { cn } from "@/lib/utils";

const logos = [
  { name: "Northwind", initials: "NW" },
  { name: "Brightpath", initials: "BP" },
  { name: "Studio Kova", initials: "SK" },
  { name: "Meridian", initials: "ME" },
  { name: "Atlas Works", initials: "AW" },
  { name: "Clearline", initials: "CL" },
] as const;

export function LogoCloudSection() {
  return (
    <section className="border-y border-slate-200/80 bg-slate-50/50 py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-center text-sm font-medium tracking-wide text-slate-500">
          Built with Blinkfront
        </p>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo) => (
            <li key={logo.name}>
              <div
                className={cn(
                  "flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 shadow-sm",
                  "transition-colors duration-150 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5",
                )}
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-semibold tracking-tight text-slate-600"
                  aria-hidden
                >
                  {logo.initials}
                </span>
                <span className="truncate text-sm font-medium text-slate-700">
                  {logo.name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
