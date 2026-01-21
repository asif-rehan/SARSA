'use client';

import { useState } from 'react';
import { ProfileForm } from '@/components/forms/profile-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Shield, Bell, Palette, User, Settings } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  bio?: string;
  emailVerified?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ProfileClientProps {
  user: UserProfile;
}

export default function ProfileClient({ user: initialUser }: ProfileClientProps) {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
    },
  });

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handlePreferenceChange = (category: string, key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Unknown';
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/dashboard">
                <Button variant="ghost">← Back to Dashboard</Button>
              </a>
              <h1 className="text-xl sm:text-2xl font-bold">Profile Settings</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileForm user={user} onUpdate={handleUserUpdate} />
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme-toggle">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-visible">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <Switch
                    id="profile-visible"
                    checked={preferences.privacy.profileVisible}
                    onCheckedChange={(checked: boolean) => 
                      handlePreferenceChange('privacy', 'profileVisible', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-email">Show Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your email address on your public profile
                    </p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={preferences.privacy.showEmail}
                    onCheckedChange={(checked: boolean) => 
                      handlePreferenceChange('privacy', 'showEmail', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked: boolean) => 
                      handlePreferenceChange('notifications', 'email', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked: boolean) => 
                      handlePreferenceChange('notifications', 'push', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing-notifications">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    id="marketing-notifications"
                    checked={preferences.notifications.marketing}
                    onCheckedChange={(checked: boolean) => 
                      handlePreferenceChange('notifications', 'marketing', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Your email address verification status
                    </p>
                  </div>
                  <Badge variant={user.emailVerified ? "default" : "destructive"}>
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                {!user.emailVerified && (
                  <Button variant="outline" size="sm">
                    Send Verification Email
                  </Button>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Account Information</Label>
                  <div className="text-sm space-y-1">
                    <p><strong>Account Created:</strong> {formatDate(user.createdAt)}</p>
                    <p><strong>Last Updated:</strong> {formatDate(user.updatedAt)}</p>
                    <p><strong>User ID:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">{user.id}</code></p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Password Management</Label>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Update your account password for better security
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-destructive">Delete Account</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}