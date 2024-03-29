import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './common/config/config.module';
import { LtoModule } from './common/lto/lto.module';
import { PackageModule } from './package/package.module';
import { OwnableModule } from './ownable/ownable.module';
import { OwnableController } from './ownable/ownable.controller';
import { VerifySignatureMiddleware } from './common/http-signature/verify-signature.middleware';

@Module({
  imports: [ConfigModule, PackageModule, OwnableModule, LtoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifySignatureMiddleware).forRoutes(OwnableController);
  }
}
