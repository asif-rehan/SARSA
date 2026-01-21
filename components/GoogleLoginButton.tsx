'use client';

import { useState } from 'react';
import { authClient } from '../lib/auth-client';
import { LoadingButton } from './loading/loading-button';
import { ErrorMessage } from './forms/error-message';
import { AnimatedButton } from './interactions/animated-button';

interface GoogleLoginButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
}

export default function GoogleLoginButton({ isLoading = false, disabled = false }: GoogleLoginButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsAuthenticating(true);
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <LoadingButton
        type="button"
        onClick={handleGoogleLogin}
        loading={isLoading || isAuthenticating}
        loadingText="Signing in..."
        disabled={disabled}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full border-2 border-zinc-300 bg-white px-6 text-zinc-900 transition-all hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        aria-label="Sign in with Google"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 2.53-1.77 0-3.38-.8-3.38-2.5v-2.87h5.24c.06-.52.08-1.06.08-1.6 0-5.25-4.25-9.5-9.5-9.5-5.25 0-9.5 4.25-9.5 9.5 0 .44.04.87.08 1.3l3.15-3.15c-.62-1.2-1.37-2.31-2.21-3.22 2.33 2.38 5.61 3.87 9.26 3.87zM12 23c-5.79 0-10.88-3.11-13.67-7.73l3.67-3.67c1.52 2.05 3.97 3.38 6.67 3.38 2.7 0 5.1-1.33 6.67-3.38l3.67 3.67C22.88 19.89 19.79 23 14 23z"
            fill="#4285F4"
          />
          <path
            d="M5.26 14.13c-.45-1.39-.71-2.87-.71-4.39 0-1.52.26-3 .71-4.39L0 10.25l2.67-2.67C3.83 10.47 3.53 13.05 3.53 15.91c0 1.52.26 3 .71 4.39.45 1.39.71 2.87.71 4.39zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 9.79 0 7.72 1.09 6.16 3.03l-3.15 3.15C5.88 5.94 7.93 5.38 10.11 5.38 1.63 0 3.06-.56 4.21-1.64z"
            fill="#34A853"
          />
          <path
            d="M5.26 14.13c.71-1.52 1.11-3.21 1.11-5 0-1.79-.4-3.47-1.11-5L0 10.25c1.39-2.76 4.24-4.65 7.58-4.65 3.33 0 6.18 1.89 7.57 4.65l3.15-3.15c-1.52-2.05-3.97-3.38-6.67-3.38-2.7 0-5.1 1.33-6.67 3.38l-3.67 3.67z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c3.33 0 6.18 1.89 7.57 4.65l-3.15 3.15C14.97 15.61 13.52 13.39 13.52 10c0-1.79-.4-3.47-1.11-5l3.15-3.15c1.52 2.05 3.97 3.38 6.67 3.38 2.7 0 5.1-1.33 6.67-3.38l3.67-3.67c-.62-1.2-1.37-2.31-2.21-3.22 2.33 2.38 5.61 3.87 9.26 3.87z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </LoadingButton>
      
      {error && (
        <ErrorMessage message={error} variant="inline" />
      )}
    </div>
  );
}
