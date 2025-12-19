import { FeedbackQuestionDto } from '@shared/feedback';

export class ActiveSurveyDto {
  id!: string;
  name!: string;
  isActive!: boolean;
  startPoints!: number;
  pointsPerAnswer!: number;
  questions!: FeedbackQuestionDto[];

  static create(data: ActiveSurveyDto): ActiveSurveyDto {
    return Object.assign(new ActiveSurveyDto(), data);
  }
}
