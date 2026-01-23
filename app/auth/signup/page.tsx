import { redirect } from 'next/navigation';

interface SignUpPageProps {
  searchParams: { redirect?: string };
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  const redirectParam = searchParams.redirect;
  const targetUrl = redirectParam 
    ? `/auth?mode=signup&redirect=${encodeURIComponent(redirectParam)}`
    : '/auth?mode=signup';
  
  redirect(targetUrl);
}
