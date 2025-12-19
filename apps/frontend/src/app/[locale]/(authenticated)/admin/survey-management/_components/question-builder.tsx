'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { useCreateQuestion } from '@/hooks/use-questions';
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { locales } from '@/i18n/config';

const optionTranslationSchema = z.object({
  language: z.string(),
  label: z.string().min(1, 'Label is required'),
});

const optionSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  order: z.number().int().min(1),
  score: z.number().int().nullable().optional(),
  translations: z
    .array(optionTranslationSchema)
    .min(1, 'At least one translation is required'),
});

const questionTranslationSchema = z.object({
  language: z.string(),
  text: z.string().min(1, 'Question text is required'),
});

const createQuestionSchema = z.object({
  type: z.enum(['single', 'multiple']),
  translations: z
    .array(questionTranslationSchema)
    .min(1, 'At least one translation is required'),
  options: z.array(optionSchema).min(2, 'At least two options are required'),
});

type CreateQuestionFormData = z.infer<typeof createQuestionSchema>;

export function QuestionBuilder() {
  const t = useTranslations('admin.surveyManagement.questionBuilder');
  const createQuestion = useCreateQuestion();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateQuestionFormData>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      type: 'single',
      translations: locales.map((lang) => ({
        language: lang,
        text: '',
      })),
      options: [
        {
          key: 'option1',
          order: 1,
          score: null,
          translations: locales.map((lang) => ({
            language: lang,
            label: '',
          })),
        },
        {
          key: 'option2',
          order: 2,
          score: null,
          translations: locales.map((lang) => ({
            language: lang,
            label: '',
          })),
        },
      ],
    },
  });

  const watchedType = watch('type');
  const watchedTranslations = watch('translations');
  const watchedOptions = watch('options');

  const addOption = () => {
    const currentOptions = watchedOptions || [];
    const newOption = {
      key: `option${currentOptions.length + 1}`,
      order: currentOptions.length + 1,
      score: null,
      translations: locales.map((lang) => ({
        language: lang,
        label: '',
      })),
    };
    setValue('options', [...currentOptions, newOption]);
  };

  const removeOption = (index: number) => {
    const currentOptions = watchedOptions || [];
    if (currentOptions.length <= 2) return; // Must have at least 2 options
    const newOptions = currentOptions.filter((_, i) => i !== index);
    // Reorder
    newOptions.forEach((opt, i) => {
      opt.order = i + 1;
    });
    setValue('options', newOptions);
  };

  const onSubmit = async (data: CreateQuestionFormData) => {
    try {
      await createQuestion.mutateAsync(data);
      reset();
    } catch (error) {
      console.error('Failed to create question:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Question Type */}
            <FormField
              label={t('questionType')}
              htmlFor="type"
              error={errors.type?.message}
            >
              <Select
                value={watchedType}
                onValueChange={(value: 'single' | 'multiple') =>
                  setValue('type', value)
                }
              >
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue placeholder={t('selectQuestionType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">{t('singleChoice')}</SelectItem>
                  <SelectItem value="multiple">
                    {t('multipleChoice')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* Question Translations */}
            <div>
              <Label className="mb-2 block">{t('questionText')}</Label>
              <div className="space-y-3">
                {watchedTranslations?.map((translation, index) => (
                  <div key={translation.language}>
                    <Label
                      htmlFor={`translation-${translation.language}`}
                      className="text-sm"
                    >
                      {translation.language.toUpperCase()}
                    </Label>
                    <Textarea
                      id={`translation-${translation.language}`}
                      {...register(`translations.${index}.text`)}
                      placeholder={t('questionTextPlaceholder', {
                        language: translation.language,
                      })}
                      className="mt-1"
                    />
                    {errors.translations?.[index]?.text && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.translations[index]?.text?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {errors.translations && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.translations.message}
                </p>
              )}
            </div>

            {/* Options */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label>{t('options')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('addOption')}
                </Button>
              </div>
              <div className="space-y-4">
                {watchedOptions?.map((option, optionIndex) => (
                  <Card key={optionIndex}>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>
                          {t('option')} {option.order}
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(optionIndex)}
                          disabled={watchedOptions.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          label={t('key')}
                          htmlFor={`option-${optionIndex}-key`}
                          error={errors.options?.[optionIndex]?.key?.message}
                        >
                          <Input
                            id={`option-${optionIndex}-key`}
                            {...register(`options.${optionIndex}.key`)}
                            placeholder={t('keyPlaceholder')}
                            className="mt-1"
                          />
                        </FormField>

                        <FormField
                          label={t('score')}
                          htmlFor={`option-${optionIndex}-score`}
                          error={errors.options?.[optionIndex]?.score?.message}
                        >
                          <Input
                            id={`option-${optionIndex}-score`}
                            type="number"
                            {...register(`options.${optionIndex}.score`, {
                              valueAsNumber: true,
                              setValueAs: (v) => (v === '' ? null : Number(v)),
                            })}
                            placeholder={t('scorePlaceholder')}
                            className="mt-1"
                          />
                        </FormField>
                      </div>

                      {/* Option Translations */}
                      <div>
                        <Label className="mb-2 block text-sm">
                          {t('optionLabels')}
                        </Label>
                        <div className="space-y-3">
                          {option.translations.map(
                            (translation, transIndex) => (
                              <div key={translation.language}>
                                <Label
                                  htmlFor={`option-${optionIndex}-translation-${translation.language}`}
                                  className="text-sm"
                                >
                                  {translation.language.toUpperCase()}
                                </Label>
                                <Input
                                  id={`option-${optionIndex}-translation-${translation.language}`}
                                  {...register(
                                    `options.${optionIndex}.translations.${transIndex}.label`,
                                  )}
                                  placeholder={t('optionLabelPlaceholder', {
                                    language: translation.language,
                                  })}
                                  className="mt-1"
                                />
                                {errors.options?.[optionIndex]?.translations?.[
                                  transIndex
                                ]?.label && (
                                  <p className="mt-1 text-sm text-destructive">
                                    {
                                      errors.options[optionIndex]
                                        ?.translations?.[transIndex]?.label
                                        ?.message
                                    }
                                  </p>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {errors.options && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.options.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={createQuestion.isPending}>
                {createQuestion.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('creating')}
                  </>
                ) : (
                  t('create')
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
