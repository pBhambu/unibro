"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="card p-6 max-w-lg w-full">
            <div className="text-2xl font-semibold mb-2">Something went wrong</div>
            <div className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{String(error?.message || "Unknown error")}</div>
            <button className="btn" onClick={() => reset()}>Try again</button>
          </div>
        </div>
      </body>
    </html>
  );
}
