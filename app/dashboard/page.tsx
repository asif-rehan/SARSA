'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
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
      {/* Mobile-optimized header with mobile navigation */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
            </div>
            
            {/* Desktop navigation - hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={user.image} alt={user.name || user.email} />
                  <AvatarFallback className="text-xs sm:text-sm">
                    {user.name?.[0] || user.email[0] || 'G'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <p className="text-sm font-medium truncate max-w-[120px] lg:max-w-none">
                    {user.name || user.email}
                  </p>
                  <Badge variant="secondary" className="text-xs">Pro Plan</Badge>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="min-h-[40px] px-3 sm:px-4"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Mobile-optimized dashboard cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl truncate">Profile Settings</CardTitle>
                  <CardDescription className="text-sm">
                    Manage your account information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl truncate">Subscription</CardTitle>
                  <CardDescription className="text-sm">
                    View and manage your plan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl truncate">Settings</CardTitle>
                  <CardDescription className="text-sm">
                    Configure your preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
