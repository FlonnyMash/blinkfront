export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col antialiased text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-slate-50" />
        <div className="absolute -top-32 left-1/4 size-[28rem] rounded-full bg-blue-400/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 size-[32rem] rounded-full bg-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 size-[26rem] rounded-full bg-indigo-400/10 blur-3xl" />
      </div>
      {children}
    </div>
  );
}
