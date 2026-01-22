import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import VerifyEmailClient from './VerifyEmailClient';

interface VerifyEmailPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token as string;
  const callbackURL = params.callbackURL as string;

  // If there's a token, verify it automatically
  if (token) {
    try {
      await auth.api.verifyEmail({
        headers: await headers(),
        query: { token, callbackURL },
      });
      
      // Redirect to dashboard or callback URL after successful verification
      redirect(callbackURL || '/dashboard');
    } catch (error) {
      console.error('Email verification failed:', error);
      // Continue to show the verification page with error
    }
  }

  // Check if user is already authenticated and verified
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.emailVerified) {
    redirect('/dashboard');
  }

  return <VerifyEmailClient user={session?.user} token={token} />;
}

export const metadata = {
  title: 'Verify Your Email',
  description: 'Please verify your email address to continue',
};