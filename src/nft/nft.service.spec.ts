import { NFTService } from './nft.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EthersModule } from '../common/ethers/ethers.module';
import { NFTInfo } from '../interfaces/OwnableInfo';
import { EthereumService } from './ethereum/ethereum.service';

describe('NFTService', () => {
  let service: NFTService;
  let ethereumService: EthereumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EthersModule],
      providers: [NFTService, EthereumService],
    }).compile();
    await module.init();

    service = module.get<NFTService>(NFTService);
    ethereumService = module.get<EthereumService>(EthereumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call unlock proof for ethereum', async () => {
    const nft: NFTInfo = {
      network: 'eip155:1',
      address: '0x123',
      id: '456',
    };
    const getContractSpy = jest
      .spyOn(ethereumService, 'getUnlockProof')
      .mockReturnValue(Promise.resolve('unlock-proof'));

    const unlockProof = await service.getUnlockProof(nft);

    expect(getContractSpy).toHaveBeenCalledWith(nft);
    expect(unlockProof).toBe('unlock-proof');
  });
});
