"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[40vh] card p-6">
      <div className="text-xl font-semibold mb-2">Something went wrong</div>
      <div className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{String(error?.message || "Unknown error")}</div>
      <button className="btn" onClick={() => reset()}>Try again</button>
    </div>
  );
}
