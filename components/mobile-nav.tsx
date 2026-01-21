'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, User, CreditCard, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  user?: {
    name?: string;
    email: string;
    image?: string;
    subscription?: {
      plan: string;
      status: string;
    };
  };
  onSignOut?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and quick actions',
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Manage your account',
  },
  {
    title: 'Subscription',
    href: '/subscription',
    icon: CreditCard,
    description: 'Billing and plans',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App preferences',
  },
];

export function MobileNav({ user, onSignOut }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden h-9 w-9 p-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-bold">Navigation</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* User Info Section */}
          {user && (
            <div className="py-6 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.image} alt={user.name || user.email} />
                  <AvatarFallback className="text-sm">
                    {user.name?.[0] || user.email[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                  {user.subscription && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {user.subscription.plan} Plan
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 py-6">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                      "min-h-[48px]", // Touch-friendly height
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="border-t pt-4 space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-3">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>

            {/* Sign Out Button */}
            {user && onSignOut && (
              <Button
                variant="ghost"
                onClick={() => {
                  onSignOut();
                  setOpen(false);
                }}
                className="w-full justify-start min-h-[48px] text-sm font-medium"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </Button>
            )}

            {/* Sign In Button for non-authenticated users */}
            {!user && (
              <Button asChild className="w-full min-h-[48px]">
                <Link href="/auth/signin" onClick={handleLinkClick}>
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;