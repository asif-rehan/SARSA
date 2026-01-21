'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, CreditCard, Settings } from 'lucide-react';

export default function Dashboard({ session }: { session: { user?: { name: string, email: string, image?: string } } }) {
  const router = useRouter();
  const user = session?.user || { name: 'Guest', email: '' };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image} alt={user.name || user.email} />
                <AvatarFallback>
                  {user.name?.[0] || user.email[0] || 'G'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name || user.email}</p>
                <Badge variant="secondary">Pro Plan</Badge>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-primary" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-primary" />
                <CardTitle>Subscription</CardTitle>
              </div>
              <CardDescription>View and manage your plan</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-primary" />
                <CardTitle>Settings</CardTitle>
              </div>
              <CardDescription>Configure your preferences</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
