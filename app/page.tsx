import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <header role="banner">
          <h1 className="max-w-sm text-4xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Build Your SaaS in Minutes
          </h1>
        </header>
        
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left my-8">
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Start building your SaaS application today. Sign in to get started or create a new account to explore our powerful features.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-white transition-colors hover:bg-blue-700 md:w-[180px]"
            href="/auth/signin"
          >
            Sign In
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-blue-600 px-8 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 md:w-[180px]"
            href="/auth/signup"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
