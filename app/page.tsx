"use client";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image 
                src="/logo.png" 
                alt="UniBro Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-amber-600 bg-clip-text text-transparent">
              UniBro
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/application" className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
              Log in
            </Link>
            <Link href="/application" className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 font-title">Your College Application Copilot</h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Plan, write, and refine your applications with an AI assistant designed for students.
          </p>
        </section>

        <section className="py-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card-solid p-6 bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-lg font-semibold mb-2">Plan</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create a timeline and stay on track.</p>
          </div>
          <div className="card-solid p-6 bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-lg font-semibold mb-2">Write</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Draft and iterate on standout essays.</p>
          </div>
          <div className="card-solid p-6 bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-lg font-semibold mb-2">Decide</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get guidance on your college list.</p>
          </div>
        </section>

        <section className="py-6">
          <div className="rounded-2xl p-6 sm:p-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <h2 className="text-2xl font-bold mb-2 text-green-800 dark:text-green-300 font-title">Free and built to level the playing field</h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-3xl">
              UniBro is free for students. We believe great guidance shouldn’t depend on where you live or what you can afford. 
              Our goal is to make high‑quality application support accessible to everyone so more students can reach the opportunities they deserve.
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-10 py-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} UniBro
      </footer>
    </div>
  );
}
