'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailPasswordFormProps {
  mode?: 'signin' | 'signup';
}

export default function EmailPasswordForm({ mode = 'signin' }: EmailPasswordFormProps) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // Sign up with email verification
        const result = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (result.error) {
          setMessage(`Error: ${result.error.message}`);
        } else {
          setMessage('Account created! Please check your email for verification link.');
        }
      } else {
        // Sign in
        const result = await authClient.signIn.email({
          email,
          password,
        });

        if (result.error) {
          setMessage(`Error: ${result.error.message}`);
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700 p-1">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isSignUp
                ? 'bg-blue-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isSignUp
                ? 'bg-blue-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            minLength={6}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
        </Button>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
              : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}