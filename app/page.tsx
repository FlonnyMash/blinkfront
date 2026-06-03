import { UrlInputForm } from "@/components/dashboard/url-input-form";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl space-y-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Generate your high-performance site
        </h1>
        <UrlInputForm />
      </div>
    </main>
  );
}
