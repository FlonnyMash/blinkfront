export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col antialiased text-slate-900">
      {children}
    </div>
  );
}
