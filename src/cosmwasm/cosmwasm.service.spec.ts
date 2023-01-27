import { Test, TestingModule } from '@nestjs/testing';
import { CosmWasmService } from './cosmwasm.service';

describe('CosmwasmService', () => {
  let service: CosmWasmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CosmWasmService],
    }).compile();

    service = module.get<CosmWasmService>(CosmWasmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
