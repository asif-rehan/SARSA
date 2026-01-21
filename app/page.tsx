import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CreditCard, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Build Your SaaS in Minutes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete SaaS platform with authentication, payments, and dashboard
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/subscription">Subscribe</Link>
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Authentication</CardTitle>
              </div>
              <CardDescription>Secure OAuth with Google integration</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-primary" />
                <CardTitle>Payments</CardTitle>
              </div>
              <CardDescription>Stripe integration for subscriptions</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                <CardTitle>Dashboard</CardTitle>
              </div>
              <CardDescription>User-friendly management interface</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
