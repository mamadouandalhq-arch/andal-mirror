import { Prisma } from '@prisma/client';

export type FeedbackResultWithCurrentQuestion =
  Prisma.FeedbackResultGetPayload<{
    include: { currentQuestion: true };
  }>;
