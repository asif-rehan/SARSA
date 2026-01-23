import { redirect } from 'next/navigation';

interface SignInPageProps {
  searchParams: { redirect?: string };
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const redirectParam = searchParams.redirect;
  const targetUrl = redirectParam 
    ? `/auth?mode=signin&redirect=${encodeURIComponent(redirectParam)}`
    : '/auth?mode=signin';
  
  redirect(targetUrl);
}
