import { Test, TestingModule } from '@nestjs/testing';
import { OwnableService } from './ownable.service';

describe('OwnableService', () => {
  let service: OwnableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OwnableService],
    }).compile();

    service = module.get<OwnableService>(OwnableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
