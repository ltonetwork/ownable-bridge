import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PackageModule } from './package/package.module';
import { OwnableModule } from './ownable/ownable.module';

@Module({
  imports: [PackageModule, OwnableModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
