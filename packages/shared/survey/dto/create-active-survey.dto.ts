export class CreateActiveSurveyDto {
  name!: string;
  startPoints!: number;
  pointsPerAnswer!: number;
  questionIds!: string[];

  static create(data: CreateActiveSurveyDto): CreateActiveSurveyDto {
    return Object.assign(new CreateActiveSurveyDto(), data);
  }
}
