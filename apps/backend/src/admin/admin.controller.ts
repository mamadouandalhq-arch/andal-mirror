import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles, RolesGuard } from '../common';
import { JwtGuard } from '../auth/guards';
import { GetReceiptsQueryDto } from './dto';
import { AdminGetReceiptDocs, AdminGetReceiptsDocs } from './swagger/docs';

@Roles('admin')
@UseGuards(JwtGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @AdminGetReceiptsDocs()
  @Get('receipts')
  async getPendingReceipts(@Query() query: GetReceiptsQueryDto) {
    return this.adminService.getReceipts(query);
  }

  @AdminGetReceiptDocs()
  @Get('/receipts/:id')
  async getReceipt(@Param('id') id: string) {
    return this.adminService.getReceipt(id);
  }
}
