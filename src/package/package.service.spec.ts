import { Test, TestingModule } from '@nestjs/testing';
import { PackageService } from './package.service';
import { ConfigModule } from '../config/config.module';
import { IpfsModule } from '../common/ipfs/ipfs.module';

describe('PackageService', () => {
  let service: PackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, IpfsModule],
      providers: [PackageService],
    }).compile();

    service = module.get<PackageService>(PackageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
