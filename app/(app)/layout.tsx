export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col antialiased text-slate-900 md:h-full md:min-h-0">
      {children}
    </div>
  );
}
