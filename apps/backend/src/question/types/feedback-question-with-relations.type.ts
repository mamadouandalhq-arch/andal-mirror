import { Prisma } from '@prisma/client';
import { feedbackQuestionWithRelationsIncludeConst } from '../consts';

export type FeedbackQuestionWithRelationsType =
  Prisma.FeedbackQuestionGetPayload<{
    include: typeof feedbackQuestionWithRelationsIncludeConst;
  }>;
