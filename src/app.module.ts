import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { PackageModule } from './package/package.module';

@Module({
  imports: [ConfigModule, PackageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
