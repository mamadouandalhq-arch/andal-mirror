import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles, RolesGuard } from '../common';
import { JwtGuard } from '../auth/guards';
import { GetReceiptsQueryDto, ReviewReceiptDto } from './dto';
import {
  AdminGetReceiptDocs,
  AdminGetReceiptsDocs,
  ReviewReceiptDocs,
} from './swagger/docs';

@Roles('admin')
@UseGuards(JwtGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ReviewReceiptDocs()
  @Patch('/receipts/review')
  @HttpCode(200)
  async reviewReceipt(@Body() dto: ReviewReceiptDto) {
    return await this.adminService.reviewReceipt(dto);
  }

  @AdminGetReceiptsDocs()
  @Get('receipts')
  async getPendingReceipts(@Query() query: GetReceiptsQueryDto) {
    return await this.adminService.getReceipts(query);
  }

  @AdminGetReceiptDocs()
  @Get('/receipts/:id')
  async getReceipt(@Param('id') id: string) {
    return await this.adminService.getReceipt(id);
  }
}
