import { Prisma } from '@prisma/client';

export type CurrentQuestionWithOptions = Prisma.FeedbackQuestionGetPayload<{
  include: {
    translations: true;
    options: {
      include: {
        translations: true;
      };
    };
  };
}>;
