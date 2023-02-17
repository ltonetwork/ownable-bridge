import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ltoProviders } from './lto.providers';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [...ltoProviders],
  exports: [...ltoProviders],
})
export class LtoModule {}
