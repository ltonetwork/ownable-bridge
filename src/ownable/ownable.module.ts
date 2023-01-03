import { Module } from '@nestjs/common';
import { OwnableService } from './ownable.service';
import { OwnableController } from './ownable.controller';
import { LtoModule } from '../common/lto/lto.module';

@Module({
  imports: [LtoModule],
  providers: [OwnableService],
  controllers: [OwnableController],
})
export class OwnableModule {}
