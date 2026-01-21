import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/signin');
  }

  return <ProfileClient user={session.user} />;
}

export const metadata = {
  title: 'Profile Settings',
  description: 'Manage your profile information and account settings',
};