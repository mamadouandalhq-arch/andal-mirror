/**
 * Database seed script - Safe for production use
 *
 * This seed is idempotent and safe to run multiple times:
 * - Checks if default survey already exists before creating
 * - Preserves existing active survey (won't create new active survey if one exists)
 * - Skips questions that already exist (checks by translation text)
 * - Won't create duplicates or overwrite existing data
 *
 * Usage:
 * - Development: Set RUN_SEED=true in docker-compose or .env
 * - Production: Only run manually when needed (e.g., initial setup)
 */

import { FeedbackType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const QUESTIONS = [
  {
    serialNumber: 1,
    type: FeedbackType.single,
    translations: {
      en: 'How would you rate your apartment condition?',
      fr: "Comment évalueriez-vous l'état de votre appartement ?",
    },
    options: [
      { en: '1', fr: '1', score: 0 },
      { en: '2', fr: '2', score: 1 },
      { en: '3', fr: '3', score: 2 },
      { en: '4', fr: '4', score: 3 },
      { en: '5', fr: '5', score: 4 },
    ],
  },
  {
    serialNumber: 2,
    type: FeedbackType.single,
    translations: {
      en: 'How would you rate your relationship with the landlord?',
      fr: 'Comment évalueriez-vous votre relation avec le propriétaire ?',
    },
    options: [
      { en: '1', fr: '1', score: 0 },
      { en: '2', fr: '2', score: 1 },
      { en: '3', fr: '3', score: 2 },
      { en: '4', fr: '4', score: 3 },
      { en: '5', fr: '5', score: 4 },
    ],
  },
  {
    serialNumber: 3,
    type: FeedbackType.single,
    translations: {
      en: 'Do you have any complaints about your life in the apartment/complex?',
      fr: "Avez-vous des plaintes concernant votre vie dans l'appartement/le complexe ?",
    },
    options: [
      { en: 'Yes, a lot', fr: 'Oui, beaucoup', score: 0 },
      { en: 'Yes, a few', fr: 'Oui, un peu', score: 1 },
      { en: 'No', fr: 'Non', score: 2 },
    ],
  },
];

async function seed() {
  // Check if default survey already exists
  const existingSurvey = await prisma.feedbackSurvey.findFirst({
    where: {
      name: 'Default feedback survey',
    },
  });

  if (existingSurvey) {
    console.log(
      `Survey "${existingSurvey.name}" already exists. Skipping seed to preserve existing data.`,
    );
    return;
  }

  // Check if there's already an active survey - don't create new active survey if one exists
  const activeSurvey = await prisma.feedbackSurvey.findFirst({
    where: {
      isActive: true,
    },
  });

  if (activeSurvey) {
    console.log(
      `Active survey "${activeSurvey.name}" already exists. Creating default survey as inactive to preserve active survey.`,
    );
  }

  const survey = await prisma.feedbackSurvey.create({
    data: {
      name: 'Default feedback survey',
      // Only set as active if no active survey exists
      isActive: !activeSurvey,
      startPoints: 100,
      pointsPerAnswer: 100,
    },
  });

  console.log(`Created survey: ${survey.name} (isActive: ${survey.isActive})`);

  // Create questions only if they don't exist
  // Check by comparing translations to avoid duplicates
  const existingQuestions = await prisma.feedbackQuestion.findMany({
    include: {
      translations: true,
    },
  });

  for (const questionData of QUESTIONS) {
    // Check if question with same translations already exists
    const questionExists = existingQuestions.some((q) => {
      const enTranslation = q.translations.find((t) => t.language === 'en');
      return enTranslation?.text === questionData.translations.en;
    });

    if (questionExists) {
      console.log(
        `Question "${questionData.translations.en}" already exists. Skipping.`,
      );
      continue;
    }

    const question = await prisma.feedbackQuestion.create({
      data: {
        type: questionData.type,
      },
    });

    await prisma.feedbackQuestionTranslation.createMany({
      data: Object.entries(questionData.translations).map(
        ([language, text]) => ({
          questionId: question.id,
          language,
          text,
        }),
      ),
    });

    for (let i = 0; i < questionData.options.length; i++) {
      const optionData = questionData.options[i];

      const option = await prisma.feedbackOption.create({
        data: {
          questionId: question.id,
          key: `option${i + 1}`,
          order: i + 1,
          score: optionData.score,
        },
      });

      await prisma.feedbackOptionTranslation.createMany({
        data: [
          { optionId: option.id, language: 'en', label: optionData.en },
          { optionId: option.id, language: 'fr', label: optionData.fr },
        ],
      });
    }

    await prisma.surveyQuestion.create({
      data: {
        surveyId: survey.id,
        questionId: question.id,
        order: questionData.serialNumber,
      },
    });
  }

  console.log('Feedback questions + survey seeded');
}

seed()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
