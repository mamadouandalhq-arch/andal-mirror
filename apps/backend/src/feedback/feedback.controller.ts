import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtGuard } from '../auth/guards';
import { User } from '../user/decorators';
import { UserDto } from '../common';
import { AnswerQuestionDto } from './dto';
import { FeedbackStateResponse } from '@shared/feedback';
import { AnswerQuestionDocs, GetStateDocs, StartFeedbackDocs } from './docs';

@UseGuards(JwtGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // TODO: change http-code to 200
  @AnswerQuestionDocs()
  @Post('answer-question')
  answerQuestion(
    @User() user: UserDto,
    @Body() dto: AnswerQuestionDto,
  ): Promise<FeedbackStateResponse> {
    return this.feedbackService.answerQuestion(user.sub, dto);
  }

  @StartFeedbackDocs()
  @Post('start')
  start(@User() user: UserDto) {
    return this.feedbackService.startFeedback(user.sub);
  }

  @GetStateDocs()
  @Get('state')
  getState(@User() user: UserDto) {
    return this.feedbackService.getState(user.sub);
  }
}
