import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    await app.get<ConfigService>(ConfigService).onModuleInit();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the info', async () => {
      const info = await appController.getInfo();
      expect(info.name).toBe('@ltonetwork/ownable-bridge');
      expect(info.env).toBe('test');
    });
  });
});
