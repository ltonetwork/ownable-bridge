import { Test, TestingModule } from '@nestjs/testing';
import { EthersService } from './ethers.service';
import { ConfigModule } from '../config/config.module';
import { ethers } from 'ethers';
import { ConfigService } from '../config/config.service';
import * as abis from './abi';

describe('EthersService', () => {
  let service: EthersService;
  let config: ConfigService;
  let testWallet: ethers.Wallet;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EthersService],
      imports: [ConfigModule],
    }).compile();

    service = module.get<EthersService>(EthersService);
    config = module.get<ConfigService>(ConfigService);

    await module.init();
  });

  beforeAll(() => {
    // Set up the test wallet
    const testSeed = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';
    testWallet = ethers.Wallet.fromMnemonic(testSeed);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initProviders', () => {
    const setupConfiguration = (providerType: string, url?: string) => {
      const networks = [{ id: 1, name: 'homestead', provider: providerType, url }];

      const providerKeys = {
        etherscan: 'dummyEtherscanKey',
        infura: 'dummyInfuraKey',
        alchemy: 'dummyAlchemyKey',
        pocket: 'dummyPocketKey',
        ankr: 'dummyAnkrKey',
      };

      jest.spyOn(config, 'get').mockImplementation((key: any): any => {
        switch (key) {
          case 'eth.networks':
            return networks;
          case 'eth.providers':
            return providerKeys;
          default:
            return undefined;
        }
      });

      service['initProviders']();
    };

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should have created a jsonrpc provider', () => {
      setupConfiguration('jsonrpc', 'http://localhost:8545');
      const provider = service['providers'].get(1) as ethers.providers.JsonRpcProvider;
      expect(provider).toBeDefined();
      expect(provider).toBeInstanceOf(ethers.providers.JsonRpcProvider);
      expect(provider.connection.url).toEqual('http://localhost:8545');
      expect(provider.network.name).toEqual('homestead');
      expect(provider.network.chainId).toEqual(1);
    });

    it('should have created an etherscan provider', () => {
      setupConfiguration('etherscan');
      const provider = service['providers'].get(1) as ethers.providers.EtherscanProvider;
      expect(provider).toBeDefined();
      expect(provider).toBeInstanceOf(ethers.providers.EtherscanProvider);
      expect(provider.apiKey).toEqual('dummyEtherscanKey');
      expect(provider.network.chainId).toEqual(1);
    });

    it('should have created an infura provider', () => {
      setupConfiguration('infura');
      const provider = service['providers'].get(1) as ethers.providers.InfuraProvider;
      expect(provider).toBeDefined();
      expect(provider).toBeInstanceOf(ethers.providers.InfuraProvider);
      expect(provider.apiKey).toEqual('dummyInfuraKey');
      expect(provider.network.chainId).toEqual(1);
    });

    it('should have created an alchemy provider', () => {
      setupConfiguration('alchemy');
      const provider = service['providers'].get(1) as ethers.providers.AlchemyProvider;
      expect(provider).toBeDefined();
      expect(provider).toBeInstanceOf(ethers.providers.AlchemyProvider);
      expect(provider.apiKey).toEqual('dummyAlchemyKey');
      expect(provider.network.chainId).toEqual(1);
    });

    it('should have created a cloudflare provider', () => {
      setupConfiguration('cloudflare');
      const provider = service['providers'].get(1) as ethers.providers.CloudflareProvider;
      expect(provider).toBeDefined();
      expect(provider).toBeInstanceOf(ethers.providers.CloudflareProvider);
      expect(provider.network.chainId).toEqual(1);
    });

    it('should have created a pocket provider', () => {
      setupConfiguration('pocket');
      const provider = service['providers'].get(1) as ethers.providers.PocketProvider;
      expect(provider).toBeDefined();
      expect(provider).toBeInstanceOf(ethers.providers.PocketProvider);
      expect(provider.applicationId).toEqual('dummyPocketKey');
      expect(provider.network.chainId).toEqual(1);
    });

    it('should have created an ankr provider', () => {
      setupConfiguration('ankr');
      const provider = service['providers'].get(1) as ethers.providers.AnkrProvider;
      expect(provider).toBeDefined();
      expect(provider).toBeInstanceOf(ethers.providers.AnkrProvider);
      expect(provider.apiKey).toEqual('dummyAnkrKey');
      expect(provider.network.chainId).toEqual(1);
    });
  });

  describe('getContract', () => {
    const contractAddress = '0x1234567890123456789012345678901234567890';

    it('should get the IERC721Lockable contract', () => {
      const contract = service.getContract('IERC721Lockable', 5, contractAddress);
      expect(contract).toBeDefined();
      expect(contract instanceof ethers.Contract).toBeTruthy();
      expect(contract.address).toEqual(contractAddress);

      const contractFunctions = contract.interface.fragments.filter((fragment) => fragment.type === 'function');
      const contractFunctionNames = contractFunctions.map((fragment) => fragment.name);
      const abiFunctions = abis.IERC721Lockable.filter((fragment) => fragment.type === 'function');
      const abiFunctionNames = abiFunctions.map((fragment) => fragment.name);

      expect(contractFunctionNames).toEqual(abiFunctionNames);

      expect(contract.provider).toBeInstanceOf(ethers.providers.InfuraProvider);
      expect((contract.provider as ethers.providers.InfuraProvider).network.chainId).toEqual(5);
    });

    it('should throw an error for an invalid contract type', () => {
      expect(() => service.getContract('InvalidContractType' as any, 5, contractAddress)).toThrowError(/No ABI for/);
    });

    it('should throw an error for an invalid network', () => {
      expect(() => service.getContract('IERC721Lockable', 9999, contractAddress)).toThrowError(
        /No provider for network/,
      );
    });
  });

  describe('signMessage', () => {
    it('should sign a message and recover the correct address', async () => {
      const message = 'Test message';
      const signedMessage = await service.signMessage(message);

      // Use ethers.utils.recoverAddress() to recover the address from the signed message
      const messageHash = ethers.utils.hashMessage(message);
      const recoveredAddress = ethers.utils.recoverAddress(messageHash, signedMessage);

      // Expect the recovered address to match the test wallet's address
      expect(recoveredAddress).toEqual(testWallet.address);
    });
  });
});
