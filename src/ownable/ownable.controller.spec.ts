import { Test, TestingModule } from '@nestjs/testing';
import { OwnableController } from './ownable.controller';
import { PackageModule } from '../package/package.module';
import { OwnableService } from './ownable.service';
import { ConfigModule } from '../config/config.module';
import { CosmWasmModule } from '../cosmwasm/cosmwasm.module';
import { LtoModule } from '../common/lto/lto.module';

describe('OwnableController', () => {
  let controller: OwnableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PackageModule, ConfigModule, CosmWasmModule, LtoModule],
      providers: [OwnableService],
      controllers: [OwnableController],
    }).compile();

    controller = module.get<OwnableController>(OwnableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
