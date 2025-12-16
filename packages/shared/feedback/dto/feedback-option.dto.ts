export class FeedbackOptionDto {
  key!: string;
  label!: string;

  static create(data: FeedbackOptionDto): FeedbackOptionDto {
    return Object.assign(new FeedbackOptionDto(), data);
  }
}
