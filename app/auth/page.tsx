import Link from "next/link";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import EmailPasswordForm from "@/components/EmailPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

interface AuthPageProps {
  searchParams: { mode?: 'signin' | 'signup' };
}

export default function AuthPage({ searchParams }: AuthPageProps) {
  const mode = searchParams.mode || 'signin';
  const isSignUp = mode === 'signup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl sm:text-2xl font-bold hover:opacity-80 transition">
              SaaS Template
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Sign up to get started with your SaaS'
                  : 'Please sign in to your account'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Social Login */}
              <GoogleLoginButton />
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <EmailPasswordForm mode={mode} />

              {/* Toggle between sign in/up */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                </span>
                <Link 
                  href={`/auth?mode=${isSignUp ? 'signin' : 'signup'}`} 
                  className="text-primary hover:underline font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t">
                <Link
                  href="/subscription"
                  className="flex h-12 w-full items-center justify-center rounded-md bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {isSignUp ? 'View Plans' : 'Subscribe Now'}
                </Link>

                <Link
                  href="/"
                  className="flex h-12 w-full items-center justify-center rounded-md border border-input bg-background px-6 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Info Box for Sign Up */}
          {isSignUp && (
            <Card className="mt-6 bg-muted/50 border-muted">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">What happens next?</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">1.</span>
                    <span>Create your account with email or Google</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">2.</span>
                    <span>Verify your email address (if using email signup)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">3.</span>
                    <span>Choose your subscription plan</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">4.</span>
                    <span>Start using your SaaS immediately</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}