export const feedbackQuestionWithRelationsIncludeConst = {
  translations: true,
  options: {
    orderBy: { order: 'asc' as const },
    include: {
      translations: true,
    },
  },
} as const;
