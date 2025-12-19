import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateActiveSurveyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  startPoints: number;

  @IsInt()
  @Min(0)
  pointsPerAnswer: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  questionIds: string[];
}
