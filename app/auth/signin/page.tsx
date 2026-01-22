import Link from "next/link";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import EmailPasswordForm from "@/components/EmailPasswordForm";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            Sign In
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Welcome back! Please sign in to your account
          </p>
        </div>

        <div className="space-y-6">
          <GoogleLoginButton />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-50 px-2 text-zinc-500 dark:bg-black dark:text-zinc-500">
                or continue with email
              </span>
            </div>
          </div>

          <EmailPasswordForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/subscription"
              className="flex h-12 w-full items-center justify-center rounded-full border-2 border-zinc-300 bg-blue-600 px-6 text-white transition-all hover:border-blue-400 hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
            >
              Subscribe Now
            </Link>

            <Link
              href="/"
              className="flex h-12 w-full items-center justify-center rounded-full border-2 border-zinc-300 bg-white px-6 text-zinc-900 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
