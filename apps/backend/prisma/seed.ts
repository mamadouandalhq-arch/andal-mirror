import { FeedbackType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seed() {
  const coreQuestions = [
    { serialNumber: 1, type: FeedbackType.single },
    { serialNumber: 2, type: FeedbackType.single },
    { serialNumber: 3, type: FeedbackType.single },
  ];

  const translations = {
    en: [
      {
        serialNumber: 1,
        text: 'How would you rate your apartment condition?',
        options: ['1', '2', '3', '4', '5'],
      },
      {
        serialNumber: 2,
        text: 'How would you rate your relationship with the landlord?',
        options: ['1', '2', '3', '4', '5'],
      },
      {
        serialNumber: 3,
        text: 'Do you have any complaints about your life in the apartment/complex?',
        options: ['Yes, a lot', 'Yes, a few', 'No'],
      },
    ],
    fr: [
      {
        serialNumber: 1,
        text: "Comment évalueriez-vous l'état de votre appartement ?",
        options: ['1', '2', '3', '4', '5'],
      },
      {
        serialNumber: 2,
        text: 'Comment évalueriez-vous votre relation avec le propriétaire ?',
        options: ['1', '2', '3', '4', '5'],
      },
      {
        serialNumber: 3,
        text: "Avez-vous des plaintes concernant votre vie dans l'appartement/le complexe ?",
        options: ['Oui, beaucoup', 'Oui, un peu', 'Non'],
      },
    ],
  };

  for (const q of coreQuestions) {
    const exists = await prisma.feedbackQuestion.findUnique({
      where: { serialNumber: q.serialNumber },
    });

    if (!exists) {
      const created = await prisma.feedbackQuestion.create({
        data: {
          serialNumber: q.serialNumber,
          type: q.type,
        },
      });

      console.log(`Created core question #${q.serialNumber} (${created.id})`);
    } else {
      console.log(
        `Core question #${q.serialNumber} already exists (${exists.id}), skipping`,
      );
    }
  }

  for (const lang of Object.keys(translations)) {
    for (const tr of translations[lang]) {
      const parent = await prisma.feedbackQuestion.findUnique({
        where: { serialNumber: tr.serialNumber },
      });

      if (!parent) {
        console.error(
          `Core question #${tr.serialNumber} missing - cannot add translation`,
        );
        continue;
      }

      await prisma.feedbackQuestionTranslation.upsert({
        where: {
          questionId_lang: {
            questionId: parent.id,
            lang,
          },
        },
        update: {},
        create: {
          questionId: parent.id,
          lang,
          text: tr.text,
          options: tr.options,
        },
      });

      console.log(
        `Ensured translation for question #${tr.serialNumber} in ${lang}`,
      );
    }
  }
}

seed()
  .catch((err) => console.error(err))
  .finally(async () => prisma.$disconnect());
