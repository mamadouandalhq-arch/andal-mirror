import { Module } from '@nestjs/common';
import { RedemptionService } from './redemption.service';
import { RedemptionController, AdminRedemptionController } from './redemption.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RedemptionController, AdminRedemptionController],
  providers: [RedemptionService],
  exports: [RedemptionService],
})
export class RedemptionModule {}

