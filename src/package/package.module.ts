import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { ConfigModule } from '../common/config/config.module';
import { IpfsModule } from '../common/ipfs/ipfs.module';

@Module({
  imports: [ConfigModule, IpfsModule],
  providers: [PackageService],
  controllers: [PackageController],
  exports: [PackageService],
})
export class PackageModule {}
