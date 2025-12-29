'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { useActiveSurvey, useCreateActiveSurvey } from '@/hooks/use-survey';
import { useQuestions } from '@/hooks/use-questions';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const publishSurveySchema = z.object({
  name: z.string().min(1, 'Survey name is required'),
  startPoints: z.number().int().min(0, 'Start points must be 0 or greater'),
  pointsPerAnswer: z
    .number()
    .int()
    .min(0, 'Points per answer must be 0 or greater'),
  questionIds: z
    .array(z.string().uuid())
    .min(1, 'At least one question is required'),
});

type PublishSurveyFormData = z.infer<typeof publishSurveySchema>;

export function SurveyBuilder() {
  const t = useTranslations('admin.surveyManagement.publishSurvey');
  const tCurrent = useTranslations('admin.surveyManagement.currentSurvey');
  const locale = useLocale();
  const { data: activeSurvey, isLoading: isLoadingSurvey } = useActiveSurvey();
  const { data: questions, isLoading: isLoadingQuestions } = useQuestions();
  const createSurvey = useCreateActiveSurvey();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] =
    useState<PublishSurveyFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PublishSurveyFormData>({
    resolver: zodResolver(publishSurveySchema),
    defaultValues: {
      name: '',
      startPoints: 100,
      pointsPerAnswer: 100,
      questionIds: [],
    },
  });

  const selectedQuestionIds = watch('questionIds');

  // Function to extract the base name (without the identifier)
  const extractBaseName = (name: string): string => {
    // Remove the identifier in the format (YYYY-MM-DD HH:mm) from the end
    const match = name.match(
      /^(.+?)\s*\(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\)\s*$/,
    );
    return match ? match[1].trim() : name.trim();
  };

  // Function to format the name with the identifier
  const formatSurveyNameWithIdentifier = (name: string): string => {
    const baseName = extractBaseName(name);
    if (!baseName) return baseName;

    // Add a new timestamp: YYYY-MM-DD HH:mm
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16).replace('T', ' ');
    return `${baseName} (${dateStr})`;
  };

  // Sync form with active survey when it loads
  useEffect(() => {
    if (activeSurvey) {
      const questionIds = activeSurvey.questions.map((q) => q.id);
      reset({
        name: extractBaseName(activeSurvey.name), // Extract the base name without the identifier
        startPoints: activeSurvey.startPoints,
        pointsPerAnswer: activeSurvey.pointsPerAnswer,
        questionIds,
      });
    }
  }, [activeSurvey, reset]);

  const availableQuestions = questions || [];

  const toggleQuestion = (questionId: string) => {
    const newIds = selectedQuestionIds.includes(questionId)
      ? selectedQuestionIds.filter((id) => id !== questionId)
      : [...selectedQuestionIds, questionId];
    setValue('questionIds', newIds);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIds = [...selectedQuestionIds];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newIds.length) return;

    [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
    setValue('questionIds', newIds);
  };

  const onSubmit = (data: PublishSurveyFormData) => {
    // Add a new identifier to the name
    const dataWithIdentifier = {
      ...data,
      name: formatSurveyNameWithIdentifier(data.name),
    };
    setFormDataToSubmit(dataWithIdentifier);
    setShowConfirmDialog(true);
  };

  const handleConfirmPublish = async () => {
    if (!formDataToSubmit) return;

    try {
      await createSurvey.mutateAsync(formDataToSubmit);
      setShowConfirmDialog(false);
      setFormDataToSubmit(null);
    } catch (error) {
      logger.error('Failed to publish survey:', error);
      setShowConfirmDialog(false);
    }
  };

  if (isLoadingSurvey || isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedQuestions = selectedQuestionIds
    .map((id) => availableQuestions.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => q !== undefined);

  return (
    <div className="space-y-6">
      {/* Current Survey Info */}
      {activeSurvey && (
        <Card>
          <CardHeader>
            <CardTitle>{tCurrent('title')}</CardTitle>
            <CardDescription>
              {tCurrent('name')}: {activeSurvey.name} |{' '}
              {tCurrent('startPoints')}: {activeSurvey.startPoints} |{' '}
              {tCurrent('pointsPerAnswer')}: {activeSurvey.pointsPerAnswer}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Publish New Survey Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>
              {activeSurvey
                ? t('descriptionWithActive')
                : t('descriptionWithoutActive')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Survey Name */}
            <FormField
              label={t('surveyName')}
              htmlFor="name"
              error={errors.name?.message}
            >
              <Input
                id="name"
                {...register('name')}
                placeholder={t('surveyNamePlaceholder')}
                className="mt-1"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                {t('surveyNameHelper')}
              </p>
            </FormField>

            {/* Points Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={t('startPoints')}
                htmlFor="startPoints"
                error={errors.startPoints?.message}
              >
                <Input
                  id="startPoints"
                  type="number"
                  min={0}
                  {...register('startPoints', { valueAsNumber: true })}
                  placeholder="100"
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('startPointsDescription')}
                </p>
              </FormField>

              <FormField
                label={t('pointsPerAnswer')}
                htmlFor="pointsPerAnswer"
                error={errors.pointsPerAnswer?.message}
              >
                <Input
                  id="pointsPerAnswer"
                  type="number"
                  min={0}
                  {...register('pointsPerAnswer', { valueAsNumber: true })}
                  placeholder="100"
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('pointsPerAnswerDescription')}
                </p>
              </FormField>
            </div>

            {/* Selected Questions */}
            <div>
              <Label className="mb-2 block">{t('selectedQuestions')}</Label>
              {selectedQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('noQuestionsSelected')}
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedQuestions.map((question, index) => {
                    const currentLocaleTranslation = question.translations.find(
                      (tr) => tr.language === locale,
                    );
                    return (
                      <div
                        key={question.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {index + 1}.{' '}
                            {currentLocaleTranslation?.text || t('untitled')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t('type')}: {question.type} | {t('options')}:{' '}
                            {question.options.length}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveQuestion(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveQuestion(index, 'down')}
                            disabled={index === selectedQuestions.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.questionIds && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.questionIds.message}
                </p>
              )}
            </div>

            {/* Available Questions */}
            <div>
              <Label className="mb-2 block">{t('availableQuestions')}</Label>
              <div className="space-y-2 max-h-90 overflow-y-auto">
                {availableQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('noQuestionsAvailable')}
                  </p>
                ) : (
                  availableQuestions.map((question) => {
                    const isSelected = selectedQuestionIds.includes(
                      question.id,
                    );
                    const currentLocaleTranslation = question.translations.find(
                      (tr) => tr.language === locale,
                    );
                    return (
                      <div
                        key={question.id}
                        className={cn(
                          'flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-accent',
                        )}
                        onClick={() => toggleQuestion(question.id)}
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {currentLocaleTranslation?.text || t('untitled')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t('type')}: {question.type} | {t('options')}:{' '}
                            {question.options.length}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                        >
                          {isSelected ? (
                            t('selected')
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              {t('add')}
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={createSurvey.isPending}>
                {createSurvey.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('publishing')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('publish')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Confirm Publish Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmPublish')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmPublishDescription', {
                message: activeSurvey
                  ? t('confirmPublishWithActive')
                  : t('confirmPublishNew'),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setFormDataToSubmit(null);
              }}
            >
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPublish}>
              {t('publish')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
