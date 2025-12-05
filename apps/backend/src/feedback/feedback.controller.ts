import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtGuard } from '../auth/guards';
import { User } from '../user/decorators';
import { UserDto } from '../common';

@UseGuards(JwtGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('start')
  start(@User() user: UserDto) {
    return this.feedbackService.startFeedback(user.sub);
  }

  @Get('state')
  getState(@User() user: UserDto) {
    return this.feedbackService.getState(user.sub);
  }
}
