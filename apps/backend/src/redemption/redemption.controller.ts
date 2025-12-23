import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RedemptionService } from './redemption.service';
import { JwtGuard } from '../auth/guards';
import { Roles, RolesGuard } from '../common';
import { User } from '../user/decorators';
import { UserDto } from '../common';
import {
  CreateRedemptionDto,
  GetRedemptionsQueryDto,
  RejectRedemptionDto,
} from './dto';
import {
  CreateRedemptionDocs,
  GetUserRedemptionsDocs,
  AdminGetRedemptionsDocs,
  AdminGetRedemptionDocs,
  AdminApproveRedemptionDocs,
  AdminCompleteRedemptionDocs,
  AdminRejectRedemptionDocs,
} from './swagger';

@UseGuards(JwtGuard)
@Controller('redemption')
export class RedemptionController {
  constructor(private readonly redemptionService: RedemptionService) {}

  @CreateRedemptionDocs()
  @Post()
  async createRedemption(
    @User() user: UserDto,
    @Body() dto: CreateRedemptionDto,
  ) {
    return await this.redemptionService.createRedemption(user.sub, dto);
  }

  @GetUserRedemptionsDocs()
  @Get()
  async getUserRedemptions(@User() user: UserDto) {
    return await this.redemptionService.getUserRedemptions(user.sub);
  }
}

@Roles('admin')
@UseGuards(JwtGuard, RolesGuard)
@Controller('admin/redemptions')
export class AdminRedemptionController {
  constructor(private readonly redemptionService: RedemptionService) {}

  @AdminGetRedemptionsDocs()
  @Get()
  async getAllRedemptions(@Query() query: GetRedemptionsQueryDto) {
    return await this.redemptionService.getAllRedemptions(query);
  }

  @AdminGetRedemptionDocs()
  @Get(':id')
  async getRedemptionById(@Param('id') id: string) {
    return await this.redemptionService.getRedemptionById(id);
  }

  @AdminApproveRedemptionDocs()
  @Patch(':id/approve')
  async approveRedemption(@Param('id') id: string) {
    return await this.redemptionService.approveRedemption(id);
  }

  @AdminCompleteRedemptionDocs()
  @Patch(':id/complete')
  async completeRedemption(@Param('id') id: string) {
    return await this.redemptionService.completeRedemption(id);
  }

  @AdminRejectRedemptionDocs()
  @Patch(':id/reject')
  async rejectRedemption(
    @Param('id') id: string,
    @Body() dto: RejectRedemptionDto,
  ) {
    return await this.redemptionService.rejectRedemption(id, dto);
  }
}
