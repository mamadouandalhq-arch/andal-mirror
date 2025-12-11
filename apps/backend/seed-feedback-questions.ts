import { FeedbackType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedFeedbackQuestions() {
  const questions = [
    {
      serialNumber: 1,
      text: 'How would you rate your apartment condition?',
      type: FeedbackType.single,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      serialNumber: 2,
      text: 'How would you rate your relationship with the landlord?',
      type: FeedbackType.single,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      serialNumber: 3,
      text: 'Do you have any complaints about your life in the apartment/complex?',
      type: FeedbackType.single,
      options: ['Yes, a lot', 'Yes, a few', 'No'],
    },
  ];

  for (const q of questions) {
    const exists = await prisma.feedbackQuestion.findFirst({
      where: { serialNumber: q.serialNumber },
    });

    if (!exists) {
      await prisma.feedbackQuestion.create({
        data: q,
      });
      console.log(`Created question #${q.serialNumber}`);
    } else {
      console.log(`Question #${q.serialNumber} already exists, skipping`);
    }
  }
}

seedFeedbackQuestions()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
