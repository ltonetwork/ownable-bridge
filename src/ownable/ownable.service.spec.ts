import { Test, TestingModule } from '@nestjs/testing';
import { OwnableService } from './ownable.service';
import { ConfigModule } from '../common/config/config.module';
import { CosmWasmModule } from '../cosmwasm/cosmwasm.module';
import { LtoModule } from '../common/lto/lto.module';
import { PackageService } from '../package/package.service';
import JSZip from 'jszip';

describe('OwnableService', () => {
  let service: OwnableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, LtoModule, CosmWasmModule],
      providers: [OwnableService, PackageService, { provide: JSZip, useValue: {} }, { provide: 'IPFS', useValue: {} }],
    }).compile();
    await module.init();

    service = module.get<OwnableService>(OwnableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
