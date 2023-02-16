import { Test, TestingModule } from '@nestjs/testing';
import { OwnableService } from './ownable.service';
import { PackageModule } from '../package/package.module';
import { ConfigModule } from '../config/config.module';
import { CosmWasmModule } from '../cosmwasm/cosmwasm.module';
import { LtoModule } from '../common/lto/lto.module';

describe('OwnableService', () => {
  let service: OwnableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, LtoModule, PackageModule, CosmWasmModule],
      providers: [OwnableService],
    }).compile();
    await module.init();

    service = module.get<OwnableService>(OwnableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
