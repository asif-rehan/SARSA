import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CreditCard, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header with theme toggle - Mobile optimized */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold truncate">SaaS Platform</h2>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Build Your SaaS in Minutes
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Complete SaaS platform with authentication, payments, and dashboard
          </p>
          
          {/* Mobile-first button layout with touch-friendly sizing */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto px-4">
            <Link href="/auth/signin">
              <Button size="lg" className="min-h-[48px] text-base w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="min-h-[48px] text-base w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/subscription">
              <Button size="lg" variant="secondary" className="min-h-[48px] text-base w-full sm:w-auto">
                Subscribe
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Mobile-optimized feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Authentication</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base">
                Secure OAuth with Google integration
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Payments</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base">
                Stripe integration for subscriptions
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Dashboard</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base">
                User-friendly management interface
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
