import { EthereumService } from './ethereum.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EthersModule } from '../../common/ethers/ethers.module';
import { EthersService } from '../../common/ethers/ethers.service';
import { NFTInfo } from '../../interfaces/OwnableInfo';
import { ethers } from 'ethers';

describe('EthereumService', () => {
  let service: EthereumService;
  let ethersService: EthersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EthersModule],
      providers: [EthereumService],
    }).compile();
    await module.init();

    service = module.get<EthereumService>(EthereumService);
    ethersService = module.get<EthersService>(EthersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return unlock proof', async () => {
    const nft: NFTInfo = {
      network: 'ein155:1',
      address: '0x123',
      id: '456',
    };
    const challenge = 'challenge';
    const dummyContract = {
      unlockChallenge: jest.fn().mockResolvedValue(challenge),
    } as any as ethers.Contract;
    const getContractSpy = jest.spyOn(ethersService, 'getContract').mockReturnValue(dummyContract);
    const signMessageSpy = jest.spyOn(ethersService, 'signMessage').mockResolvedValue('unlock-proof');

    const unlockProof = await service.getUnlockProof(nft);

    expect(getContractSpy).toHaveBeenCalledWith('IERC721Lockable', nft.network, nft.address);
    expect(dummyContract.unlockChallenge).toHaveBeenCalledWith(nft.id);
    expect(signMessageSpy).toHaveBeenCalledWith(challenge);
    expect(unlockProof).toBe('unlock-proof');
  });
});
