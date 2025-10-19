"use client";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f8fff8] to-[#e8f9e8] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-['Poppins'] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#a5f3a5] dark:bg-[#1a3d1a] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#7ee8fa] dark:bg-[#0f3a4a] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-[#80ff72] dark:bg-[#2a4a21] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      {/* Navigation Bar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/application" className="text-sm font-medium text-gray-700 hover:text-[#31BD01] dark:text-gray-300 dark:hover:text-[#5ae02a] transition-colors">
              My Application
            </Link>
            <Link href="/colleges" className="text-sm font-medium text-gray-700 hover:text-[#31BD01] dark:text-gray-300 dark:hover:text-[#5ae02a] transition-colors">
              My Colleges
            </Link>
            <Link href="/plan" className="text-sm font-medium text-gray-800 hover:text-[#31BD01] dark:text-gray-200 dark:hover:text-[#5ae02a] transition-all hover:scale-105">
              My Plan
            </Link>
            <Link href="/counselor" className="text-sm font-medium text-gray-700 hover:text-[#31BD01] dark:text-gray-300 dark:hover:text-[#5ae02a] transition-colors">
              Counselor
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/application" className="px-5 py-2.5 text-sm rounded-xl bg-white/90 backdrop-blur-sm border-2 border-[#31BD01] hover:bg-[#f0fff0] text-[#31BD01] font-semibold transition-all hover:scale-105 shadow-sm hover:shadow-md">
              Log in
            </Link>
            <Link 
              href="/application" 
              className="px-5 py-2.5 text-sm rounded-xl bg-gradient-to-r from-[#31BD01] to-[#2bd600] hover:from-[#2aa801] hover:to-[#1f8a00] text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Large Logo */}
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] -mt-16 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="relative w-full max-w-2xl mx-auto aspect-[16/9] mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#31BD01]/20 to-[#2bd600]/20 rounded-3xl blur-2xl -z-10 animate-pulse"></div>
            <Image 
              src="/logo.png" 
              alt="UniBro Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="mt-6 text-xl sm:text-2xl text-gray-800 dark:text-gray-200 text-center mb-10 max-w-2xl mx-auto font-medium bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
            Your AI-powered college application assistant
          </p>
          <div className="flex justify-center animate-bounce-slow">
            <Link 
              href="/application" 
              className="px-12 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#31BD01] to-[#2bd600] hover:from-[#2aa801] hover:to-[#1f8a00] text-white shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300 flex items-center gap-2 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started for Free
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            </Link>
          </div>
        </div>
        
      </div>

      <main id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <section className="py-20 sm:py-28 text-center relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#31BD01]/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#31BD01] to-[#2bd600] bg-clip-text text-transparent">
              Your College Application Copilot
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Plan, write, and refine your applications with an AI assistant designed for students.
            </p>
          </div>
        </section>

        <section className="py-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#31BD01]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-[#31BD01]/10 dark:bg-[#31BD01]/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#31BD01]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Plan</h3>
              <p className="text-gray-600 dark:text-gray-300">Create a timeline and stay on track with your college applications.</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#31BD01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#31BD01]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-[#31BD01]/10 dark:bg-[#31BD01]/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#31BD01]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Write</h3>
              <p className="text-gray-600 dark:text-gray-300">Craft compelling essays with AI-powered writing assistance and feedback.</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#31BD01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#31BD01]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-[#31BD01]/10 dark:bg-[#31BD01]/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#31BD01]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Decide</h3>
              <p className="text-gray-600 dark:text-gray-300">Get personalized college recommendations based on your profile and preferences.</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#31BD01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </section>

        <section className="py-6 relative">
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#31BD01]/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="relative bg-gradient-to-r from-[#31BD01]/5 to-[#2bd600]/5 dark:from-[#31BD01]/10 dark:to-[#2bd600]/10 backdrop-blur-lg rounded-2xl p-8 border border-[#31BD01]/20 dark:border-[#2bd600]/20">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#31BD01] to-[#2bd600] rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#31BD01] to-[#2bd600] bg-clip-text text-transparent">
                Free and built to level the playing field
              </h2>
              <p className="text-gray-700 dark:text-gray-300 max-w-3xl">
                UniBro is free for students. We believe great guidance shouldn't depend on where you live or what you can afford. 
                Our goal is to make high‑quality application support accessible to everyone so more students can reach the opportunities they deserve.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="px-3 py-1 text-sm rounded-full bg-[#31BD01]/10 text-[#31BD01] dark:bg-[#31BD01]/20 dark:text-[#5ae02a]">
                  🎓 Free for students
                </span>
                <span className="px-3 py-1 text-sm rounded-full bg-[#31BD01]/10 text-[#31BD01] dark:bg-[#31BD01]/20 dark:text-[#5ae02a]">
                  🌎 Available worldwide
                </span>
                <span className="px-3 py-1 text-sm rounded-full bg-[#31BD01]/10 text-[#31BD01] dark:bg-[#31BD01]/20 dark:text-[#5ae02a]">
                  ✨ AI-powered guidance
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 py-8 border-t border-gray-200/50 dark:border-gray-800/50 text-center text-sm text-gray-500 dark:text-gray-400 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center justify-center md:justify-start space-x-6 mb-4 md:mb-0">
              <Link href="/about" className="text-gray-500 hover:text-[#31BD01] dark:text-gray-400 dark:hover:text-[#5ae02a] transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-[#31BD01] dark:text-gray-400 dark:hover:text-[#5ae02a] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-[#31BD01] dark:text-gray-400 dark:hover:text-[#5ae02a] transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-[#31BD01] dark:text-gray-400 dark:hover:text-[#5ae02a] transition-colors">
                Contact
              </Link>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} UniBro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
