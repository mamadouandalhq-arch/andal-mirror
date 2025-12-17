-- Enforces business rule: only one active survey (isActive=true)
-- Prisma does not support partial unique indexes.

CREATE UNIQUE INDEX "only_one_active_feedback_survey"
    ON "FeedbackSurvey" ("isActive")
    WHERE "isActive" = true;