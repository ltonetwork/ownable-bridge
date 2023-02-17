import { Module } from '@nestjs/common';
import { jszipProviders } from './jszip.providers';

@Module({
  providers: [...jszipProviders],
  exports: [...jszipProviders],
})
export class JszipModule {}
