'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: boolean;
}

interface VerifyEmailClientProps {
  user?: User;
  token?: string;
}

export default function VerifyEmailClient({ user, token }: VerifyEmailClientProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: `${window.location.origin}/auth/verify-email`,
      });
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold">Email Verification</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                {token && !error ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : error ? (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                ) : (
                  <Mail className="h-8 w-8 text-primary" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {token && !error ? 'Email Verified!' : 'Verify Your Email'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {token && !error ? (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Your email has been successfully verified. You can now access all features.
                  </p>
                  <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
                    Continue to Dashboard
                  </Button>
                </div>
              ) : error ? (
                <div className="text-center space-y-4">
                  <p className="text-destructive text-sm">{error}</p>
                  <p className="text-muted-foreground">
                    The verification link may have expired or is invalid.
                  </p>
                  {user?.email && (
                    <Button 
                      onClick={handleResendVerification} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send New Verification Email'
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {user ? (
                    <>
                      <div className="text-center space-y-2">
                        <p className="text-muted-foreground">
                          We've sent a verification email to:
                        </p>
                        <p className="font-medium">{user.email}</p>
                        <Badge variant={user.emailVerified ? "default" : "destructive"}>
                          {user.emailVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>Please check your email and click the verification link to continue.</p>
                        <p>If you don't see the email, check your spam folder.</p>
                      </div>

                      {message && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                          <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
                        </div>
                      )}

                      {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Button 
                          onClick={handleResendVerification} 
                          disabled={loading}
                          variant="outline"
                          className="w-full"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Resend Verification Email'
                          )}
                        </Button>
                        
                        <Button 
                          onClick={handleSignOut}
                          variant="ghost"
                          className="w-full"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">
                        Please sign in to verify your email address.
                      </p>
                      <Button onClick={() => window.location.href = '/auth/signin'} className="w-full">
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}