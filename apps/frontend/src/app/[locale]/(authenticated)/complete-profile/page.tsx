'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/auth-context';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
import { FormField } from '@/components/ui/form-field';
import { FormError } from '@/components/ui/form-error';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import {
  completeProfileSchema,
  type CompleteProfileFormData,
} from '@/lib/validations/profile';
import { MapPin, Phone } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { isProfileIncomplete } from '@/lib/profile-utils';
import { AuthenticatedHeader } from '../_components/authenticated-header';

export default function CompleteProfilePage() {
  const t = useTranslations('profileCompletion');
  const tAuth = useTranslations('auth');
  const tProfile = useTranslations('profile');
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const updateProfile = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      city: user?.city || '',
      street: user?.street || '',
      building: user?.building || '',
      apartment: user?.apartment || '',
      isPrivateHouse: false, // Default to false (apartment required by default)
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const isPrivateHouse = useWatch({ control, name: 'isPrivateHouse' });

  // Redirect if profile is already complete or user is not authenticated
  useEffect(() => {
    if (!authLoading && user) {
      if (!isProfileIncomplete(user)) {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: CompleteProfileFormData) => {
    setError(null);

    try {
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city,
        street: data.street,
        building: data.building,
        apartment: data.isPrivateHouse ? undefined : data.apartment, // Don't send apartment for private houses
        phoneNumber: data.phoneNumber || undefined,
      };

      await updateProfile.mutateAsync(updateData);
      // Redirect to dashboard after successful update
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedHeader />
      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {t('title')}
            </h1>
            <p className="mt-2 text-base sm:text-lg text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('formTitle')}</CardTitle>
              <CardDescription>{t('formDescription')}</CardDescription>
              <div className="mt-4 rounded-md bg-blue-50 p-4 border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  {t('confirmLeaseMessage')}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label={
                      <>
                        {tAuth('firstName')}{' '}
                        <span className="text-red-500">*</span>
                      </>
                    }
                    htmlFor="firstName"
                    error={errors.firstName?.message}
                    t={tAuth}
                  >
                    <Input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      {...register('firstName')}
                      className="mt-1"
                      required
                    />
                  </FormField>

                  <FormField
                    label={
                      <>
                        {tAuth('lastName')}{' '}
                        <span className="text-red-500">*</span>
                      </>
                    }
                    htmlFor="lastName"
                    error={errors.lastName?.message}
                    t={tAuth}
                  >
                    <Input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      {...register('lastName')}
                      className="mt-1"
                      required
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label={
                      <>
                        {tProfile('city')}{' '}
                        <span className="text-red-500">*</span>
                      </>
                    }
                    htmlFor="city"
                    error={errors.city?.message}
                    t={tAuth}
                  >
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city"
                        type="text"
                        autoComplete="address-level2"
                        {...register('city')}
                        className="pl-10 mt-1"
                        placeholder={tProfile('cityPlaceholder')}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={
                      <>
                        {tProfile('street')}{' '}
                        <span className="text-red-500">*</span>
                      </>
                    }
                    htmlFor="street"
                    error={errors.street?.message}
                    t={tAuth}
                  >
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="street"
                        type="text"
                        autoComplete="street-address"
                        {...register('street')}
                        className="pl-10 mt-1"
                        placeholder={tProfile('streetPlaceholder')}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={
                      <>
                        {tProfile('building')}{' '}
                        <span className="text-red-500">*</span>
                      </>
                    }
                    htmlFor="building"
                    error={errors.building?.message}
                    t={tAuth}
                  >
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="building"
                        type="text"
                        autoComplete="address-line1"
                        {...register('building')}
                        className="pl-10 mt-1"
                        placeholder={tProfile('buildingPlaceholder')}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label={
                      <>
                        {tProfile('apartment')}{' '}
                        {!isPrivateHouse && (
                          <span className="text-red-500">*</span>
                        )}
                      </>
                    }
                    htmlFor="apartment"
                    error={errors.apartment?.message}
                    t={tAuth}
                  >
                    <div className="space-y-2">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="apartment"
                          type="text"
                          autoComplete="address-line2"
                          {...register('apartment')}
                          className="pl-10 mt-1"
                          placeholder={tProfile('apartmentPlaceholder')}
                          disabled={isPrivateHouse}
                          aria-required={!isPrivateHouse}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPrivateHouse"
                          checked={isPrivateHouse}
                          onChange={(e) => {
                            setValue('isPrivateHouse', e.target.checked);
                            if (e.target.checked) {
                              setValue('apartment', ''); // Clear apartment if private house
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                        />
                        <label
                          htmlFor="isPrivateHouse"
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {t('isPrivateHouse')}
                        </label>
                      </div>
                      {isPrivateHouse && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('privateHouseNote')}
                        </p>
                      )}
                    </div>
                  </FormField>
                </div>

                <FormField
                  label={tProfile('phoneNumber')}
                  htmlFor="phoneNumber"
                  error={errors.phoneNumber?.message}
                  t={tAuth}
                >
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      {...register('phoneNumber')}
                      className="pl-10 mt-1"
                      placeholder={tProfile('phoneNumberPlaceholder')}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tProfile('phoneNumberHint')}
                  </p>
                </FormField>

                <FormError message={error || ''} t={tAuth} />

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending
                      ? t('completing')
                      : t('completeButton')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
