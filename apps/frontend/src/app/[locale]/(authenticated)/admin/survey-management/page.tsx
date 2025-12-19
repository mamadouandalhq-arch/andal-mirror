'use client';

import { useTranslations } from 'next-intl';
import { QuestionBuilder } from './_components/question-builder';
import { SurveyBuilder } from './_components/survey-builder';

export default function SurveyManagementPage() {
  const t = useTranslations('admin.surveyManagement');

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          {t('title')}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="space-y-8">
        <QuestionBuilder />
        <SurveyBuilder />
      </div>
    </div>
  );
}
