import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateFeedbackQuestionDto } from './dto';
import { Roles } from '../common';
import { UserRole } from '@prisma/client';
import {
  AdminCreateQuestionDocs,
  AdminGetQuestionByIdDocs,
  AdminGetQuestionsDocs,
} from './swagger';

@Roles(UserRole.admin)
@Controller('admin/questions')
export class AdminQuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @AdminGetQuestionsDocs()
  @Get()
  getAll() {
    return this.questionService.getAll();
  }

  @AdminGetQuestionByIdDocs()
  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.questionService.getUniqueOrThrow(id);
  }

  @AdminCreateQuestionDocs()
  @Post()
  create(@Body() dto: CreateFeedbackQuestionDto) {
    return this.questionService.create(dto);
  }
}
