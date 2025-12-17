import {
  GetSurveyQuestionByOrderDto,
  GetSurveyQuestionByQuestionDto,
} from '../dto';

export type GetUniqueSurveyQuestionType =
  | GetSurveyQuestionByQuestionDto
  | GetSurveyQuestionByOrderDto;
