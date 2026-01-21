'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingButton } from '@/components/loading/loading-button';
import { FormStatus } from '@/components/forms/form-status';
import { authClient } from '@/lib/auth-client';

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

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

interface ProfileFormProps {
  user?: UserProfile;
  onUpdate?: (user: UserProfile) => void;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    },
  });

  // Reset form when user prop changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        bio: user.bio || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      setSuccess('Profile updated successfully!');
      
      if (onUpdate && result.user) {
        onUpdate(result.user);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormStatus 
          error={error}
          success={success}
          onClearError={() => setError('')}
          onClearSuccess={() => setSuccess('')}
        />

        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.image || undefined} alt={user?.name || user?.email} />
            <AvatarFallback className="text-lg">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{user?.name || user?.email}</h3>
            <p className="text-sm text-muted-foreground">
              {user?.email}
              {user?.emailVerified && (
                <span className="ml-2 text-green-600">✓ Verified</span>
              )}
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              Change Avatar
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter your display name"
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about yourself..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={4}
              aria-describedby="bio-help"
            />
            <p id="bio-help" className="text-sm text-muted-foreground">
              Maximum 500 characters
            </p>
            {errors.bio && (
              <p className="text-sm text-destructive">
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={loading || !isDirty}
            >
              Reset
            </Button>
            <LoadingButton
              type="submit"
              loading={loading}
              disabled={!isDirty}
              loadingText="Updating..."
            >
              Update Profile
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}