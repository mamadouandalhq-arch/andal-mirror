import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtGuard } from '../auth/guards';
import { User } from '../user/decorators';
import { UserDto } from '../common';
import { AnswerQuestionDto, ReturnBackDto, StartFeedbackDto } from './dto';
import { FeedbackStateResponse } from '@shared/feedback';
import {
  AnswerQuestionDocs,
  GetStateDocs,
  ReturnBackDocs,
  StartFeedbackDocs,
} from './swagger';

@UseGuards(JwtGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @HttpCode(HttpStatus.OK)
  @ReturnBackDocs()
  @Post('back')
  async returnBack(@User() user: UserDto, @Body() dto: ReturnBackDto) {
    return await this.feedbackService.returnBack(user.sub, dto);
  }

  @HttpCode(HttpStatus.OK)
  @AnswerQuestionDocs()
  @Post('answer-question')
  async answerQuestion(
    @User() user: UserDto,
    @Body() dto: AnswerQuestionDto,
  ): Promise<FeedbackStateResponse> {
    return await this.feedbackService.answerQuestion(user.sub, dto);
  }

  @StartFeedbackDocs()
  @Post('start')
  async start(@User() user: UserDto, @Body() dto: StartFeedbackDto) {
    return await this.feedbackService.startFeedback(user.sub, dto);
  }

  @GetStateDocs()
  @Get('state')
  async getState(@User() user: UserDto, @Query('language') language: string) {
    return await this.feedbackService.getState(user.sub, language);
  }
}
