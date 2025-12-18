'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/auth-context';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from '@/i18n';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { FormError } from '@/components/ui/form-error';
import { Avatar, getInitials } from '@/components/ui/avatar';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import { useUploadAvatar } from '@/hooks/use-upload-avatar';
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from '@/lib/validations/profile';
import { User, Mail, MapPin, Camera, ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);

  // Store initial values to compare for changes
  // Derived from user data, updated after successful save
  const userBasedValues = useMemo<UpdateProfileFormData>(
    () => ({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      address: user?.address || '',
    }),
    [user?.firstName, user?.lastName, user?.address],
  );

  // Track values saved to server (only updated on successful save)
  const [savedValues, setSavedValues] = useState<UpdateProfileFormData | null>(
    null,
  );

  // Initial values come from saved values (if exists) or user data
  const initialValues = useMemo<UpdateProfileFormData>(() => {
    return savedValues || userBasedValues;
  }, [savedValues, userBasedValues]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onBlur',
    defaultValues: initialValues,
  });

  // Watch form values to detect changes
  const watchedValues = useWatch({ control });
  const hasChanges = useMemo(() => {
    return (
      watchedValues.firstName !== initialValues.firstName ||
      watchedValues.lastName !== initialValues.lastName ||
      watchedValues.address !== initialValues.address
    );
  }, [watchedValues, initialValues]);

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset(userBasedValues);
    }
  }, [user, userBasedValues, reset]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    setError(null);
    setSuccess(false);

    try {
      // Filter out empty strings for optional fields
      const updateData: UpdateProfileFormData = {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address || undefined,
      };

      await updateProfile.mutateAsync(updateData);
      // Update saved values after successful save
      const newInitialValues = {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address || '',
      };
      setSavedValues(newInitialValues);
      setSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCancel = () => {
    reset(initialValues);
    setError(null);
    setSuccess(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - only JPEG, PNG, and WebP are supported
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      setAvatarError(t('avatarInvalidFileType'));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setAvatarError(t('avatarFileTooLarge'));
      return;
    }

    setAvatarError(null);
    setAvatarSuccess(false);

    try {
      await uploadAvatar.mutateAsync(file);
      setAvatarSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setAvatarSuccess(false), 3000);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : t('avatarUploadError'),
      );
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const initials = getInitials(user.firstName, user.lastName);

  return (
    <main className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToDashboard')}
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {t('myProfile')}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground">
            {t('editProfileDescription')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label={t('clickToChangeAvatar')}
                />
                <Avatar
                  src={user.avatarUrl || undefined}
                  alt={displayName}
                  fallback={initials}
                  size="lg"
                  className="cursor-pointer"
                  onClick={handleAvatarClick}
                />
                <div
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={handleAvatarClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleAvatarClick();
                    }
                  }}
                  aria-label={t('clickToChangeAvatar')}
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>
                {uploadAvatar.isPending && (
                  <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                    <Spinner />
                  </div>
                )}
              </div>
              <div>
                <CardTitle>{displayName}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
                {user.pointsBalance !== undefined && (
                  <div className="mt-2 text-sm font-medium text-primary">
                    {t('pointsBalance')}: {user.pointsBalance}
                  </div>
                )}
              </div>
            </div>
            <CardDescription>{t('editProfileInfo')}</CardDescription>
            {avatarError && (
              <div className="mt-4 rounded-md bg-red-50 p-3" role="alert">
                <p className="text-sm text-red-800">{avatarError}</p>
              </div>
            )}
            {avatarSuccess && (
              <div className="mt-4 rounded-md bg-green-50 p-3" role="alert">
                <p className="text-sm text-green-800">
                  {t('avatarUploadSuccess')}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label={tAuth('firstName')}
                  htmlFor="firstName"
                  error={errors.firstName?.message}
                  t={tAuth}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      {...register('firstName')}
                      className="pl-10 mt-1"
                    />
                  </div>
                </FormField>

                <FormField
                  label={tAuth('lastName')}
                  htmlFor="lastName"
                  error={errors.lastName?.message}
                  t={tAuth}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      {...register('lastName')}
                      className="pl-10 mt-1"
                    />
                  </div>
                </FormField>
              </div>

              <FormField
                label={t('address')}
                htmlFor="address"
                error={errors.address?.message}
                t={tAuth}
              >
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    {...register('address')}
                    className="pl-10 mt-1"
                    rows={3}
                    placeholder={t('addressPlaceholder')}
                  />
                </div>
              </FormField>

              <FormError message={error || ''} t={tAuth} />

              {success && (
                <div className="rounded-md bg-green-50 p-4" role="alert">
                  <p className="text-sm text-green-800">{t('updateSuccess')}</p>
                </div>
              )}

              {hasChanges && (
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateProfile.isPending}
                  >
                    {t('cancel')}
                  </Button>
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? t('updating') : t('saveChanges')}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
