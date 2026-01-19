'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Dashboard({ session }: { session: { user?: { name: string, email: string, image?: string } } }) {
  const router = useRouter();
  const user = session?.user || { name: 'Guest', email: '' };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="bg-white dark:bg-zinc-900 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Dashboard
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a href="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                Dashboard
              </a>
              <a href="/profile" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                Profile
              </a>
              <a href="/subscription" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                Subscription
              </a>
              <a href="/settings" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                Settings
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Welcome back!
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {user.name === 'Guest' ? 'Sign in to access your dashboard' : `Hello, ${user.name}!`}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-12 w-full items-center justify-center rounded-full bg-red-600 px-8 text-white font-medium transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  0
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Active Projects
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  12
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Tasks Completed
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Project Created</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Just now</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-blue-600" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Google Login</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
