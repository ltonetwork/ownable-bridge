import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { ltoProviders } from './lto.providers';

export const LtoModuleConfig = {
  imports: [ConfigModule],
  controllers: [],
  providers: [...ltoProviders],
  exports: [...ltoProviders],
};

@Module(LtoModuleConfig)
export class LtoModule {}
