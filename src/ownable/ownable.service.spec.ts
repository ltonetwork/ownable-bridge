import { Test, TestingModule } from '@nestjs/testing';
import { OwnableService } from './ownable.service';
import { ConfigModule } from '../common/config/config.module';
import { PackageService } from '../package/package.service';
import { CosmWasmService } from '../cosmwasm/cosmwasm.service';
import { NFTService } from '../nft/nft.service';
import { LtoIndexService } from '../common/lto-index/lto-index.service';
import { LTO, EventChain, Binary, Event } from '@ltonetwork/lto';
import { LtoModule } from '../common/lto/lto.module';
import { NFTInfo } from '../interfaces/OwnableInfo';
import { HttpService } from '@nestjs/axios';
import { expect, jest } from '@jest/globals';
import fsModule from 'fs/promises';

const fs = jest.mocked(fsModule);
jest.mock('fs/promises');

describe('OwnableService', () => {
  const lto = new LTO('T');

  let service: OwnableService;
  let mockPackageService: any;
  let mockCosmWasmService: any;
  let mockNFTService: any;
  let mockLtoIndexService: any;
  let mockHttpService: any;

  beforeEach(async () => {
    mockPackageService = {
      exists: jest.fn<(cid: string) => Promise<boolean>>(),
      file: jest.fn<(cid: string, filename?: string) => string>(),
      zipped: jest.fn<(cid: string) => any>(),
    };
    mockCosmWasmService = {
      load: jest.fn<(moduleFile: string, wasmFile: string) => any>(),
    };
    mockNFTService = {
      getUnlockProof: jest.fn<(nft: NFTInfo) => Promise<string>>(),
    };
    mockLtoIndexService = {
      verifyAnchors: jest.fn<(anchors: Array<{ key: Binary; value: Binary; signer: string }>) => any>(),
    };
    mockHttpService = {
      post: jest.fn(),
    };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, LtoModule],
      providers: [
        OwnableService,
        { provide: PackageService, useValue: mockPackageService },
        { provide: CosmWasmService, useValue: mockCosmWasmService },
        { provide: NFTService, useValue: mockNFTService },
        { provide: LtoIndexService, useValue: mockLtoIndexService },
        { provide: LTO, useValue: lto },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<OwnableService>(OwnableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('accept()', () => {
    const issuer = lto.account({ seed: 'issuer' });
    const owner = lto.account({ seed: 'owner' });

    it('should accept a valid chain', async () => {
      const nftInfo: NFTInfo = {
        network: 'testNetwork',
        address: '8bC9f9f4aAe458E268516558e3972c5F01BbC18e',
        id: '1',
      };

      const nonce = Binary.concat(Binary.fromHex(nftInfo.address), Binary.fromInt32(Number(nftInfo.id)));

      const mockContract = {
        instantiate: jest.fn(),
        execute: jest.fn(),
        externalEvent: jest.fn(),
        query: jest
          .fn<() => any>()
          .mockResolvedValueOnce({ owner: owner.address, issuer: issuer.address, nft: nftInfo }) // get_info
          .mockResolvedValueOnce(true), // is_locked
      };

      mockPackageService.exists.mockResolvedValue(true);
      mockPackageService.file.mockImplementation((packageCid, filename) => `${packageCid}/${filename}`);
      mockCosmWasmService.load.mockResolvedValue(mockContract);
      mockNFTService.getUnlockProof.mockResolvedValue('unlockProof');
      mockLtoIndexService.verifyAnchors.mockResolvedValue({ verified: true });

      const chain = new EventChain(issuer, nonce);
      new Event({ '@context': 'instantiate_msg.json', package: 'packageCid' }).addTo(chain).signWith(issuer);
      new Event({ '@context': 'execute_msg.json', transfer: { to: owner.address } }).addTo(chain).signWith(issuer);
      new Event({ '@context': 'execute_msg.json', lock: {} }).addTo(chain).signWith(owner);

      const result = await service.accept(chain, owner);

      expect(mockPackageService.exists).toBeCalledWith('packageCid');
      expect(mockCosmWasmService.load).toBeCalledWith('packageCid/ownable.js', 'packageCid/ownable_bg.wasm');
      expect(mockContract.instantiate).toBeCalledWith(
        { package: 'packageCid' },
        {
          sender: issuer.publicKey,
          funds: [],
        },
      );
      expect(mockContract.execute).toHaveBeenNthCalledWith(
        1,
        { transfer: { to: owner.address } },
        { sender: issuer.publicKey, funds: [] },
      );
      expect(mockContract.execute).toHaveBeenNthCalledWith(2, { lock: {} }, { sender: owner.publicKey, funds: [] });
      expect(mockContract.query).toHaveBeenNthCalledWith(1, { get_info: {} });
      expect(mockContract.query).toHaveBeenNthCalledWith(2, { is_locked: {} });
      expect(mockNFTService.getUnlockProof).toBeCalledWith(nftInfo);
      expect(mockLtoIndexService.verifyAnchors).toBeCalledWith(chain.anchorMap);
      expect(mockHttpService.post).toBeCalledWith('https://example.com/webhook', {
        chain: chain.toJSON(),
        ownable: { owner: owner.address, issuer: issuer.address, nft: nftInfo },
        packageCid: 'packageCid',
      });

      expect(fs.writeFile).toBeCalledWith(`storage/chains/${chain.id}.json`, JSON.stringify(chain.toJSON()));

      expect(result).toEqual({
        owner: owner.address,
        issuer: issuer.address,
        nft: nftInfo,
        proof: 'unlockProof',
      });
    });

    it('should reject a chain with failed integrity verification', async () => {
      const issuer = lto.account({ seed: 'issuer' });

      const nftInfo: NFTInfo = {
        network: 'testNetwork',
        address: '8bC9f9f4aAe458E268516558e3972c5F01BbC18e',
        id: '1',
      };

      const nonce = Binary.concat(Binary.fromHex(nftInfo.address), Binary.fromInt32(Number(nftInfo.id)));

      const mockContract = {
        instantiate: jest.fn(),
        execute: jest.fn(),
        externalEvent: jest.fn(),
        query: jest
          .fn<() => any>()
          .mockResolvedValueOnce({ owner: issuer.address, issuer: issuer.address, nft: nftInfo }),
      };

      mockPackageService.exists.mockResolvedValue(true);
      mockCosmWasmService.load.mockResolvedValue(mockContract);
      mockLtoIndexService.verifyAnchors.mockResolvedValue({ verified: false });

      const chain = new EventChain(issuer, nonce);
      new Event({ '@context': 'instantiate_msg.json', package: 'packageCid' }).addTo(chain).signWith(issuer);

      await expect(service.accept(chain, issuer)).rejects.toThrow(
        'Chain integrity could not be verified: Mismatch in anchor map',
      );

      expect(mockLtoIndexService.verifyAnchors).toBeCalledWith(chain.anchorMap);
    });

    it('should reject if the ownable is not locked', async () => {
      const issuer = lto.account({ seed: 'issuer' });

      const nftInfo: NFTInfo = {
        network: 'testNetwork',
        address: '8bC9f9f4aAe458E268516558e3972c5F01BbC18e',
        id: '1',
      };

      const nonce = Binary.concat(Binary.fromHex(nftInfo.address), Binary.fromInt32(Number(nftInfo.id)));

      const mockContract = {
        instantiate: jest.fn(),
        execute: jest.fn(),
        externalEvent: jest.fn(),
        query: jest
          .fn<() => any>()
          .mockResolvedValueOnce({ owner: issuer.address, issuer: issuer.address, nft: nftInfo }) // get_info
          .mockResolvedValueOnce(false), // is_locked
      };

      mockPackageService.exists.mockResolvedValue(true);
      mockCosmWasmService.load.mockResolvedValue(mockContract);
      mockLtoIndexService.verifyAnchors.mockResolvedValue({ verified: true });

      const chain = new EventChain(issuer, nonce);
      new Event({ '@context': 'instantiate_msg.json', package: 'packageCid' }).addTo(chain).signWith(issuer);

      await expect(service.accept(chain, issuer)).rejects.toThrow('Ownable is not locked');

      expect(mockContract.query).toBeCalledWith({ is_locked: {} });
    });

    it('should reject if the HTTP request is not signed', async () => {
      const issuer = lto.account({ seed: 'issuer' });

      const nftInfo: NFTInfo = {
        network: 'testNetwork',
        address: '8bC9f9f4aAe458E268516558e3972c5F01BbC18e',
        id: '1',
      };

      const nonce = Binary.concat(Binary.fromHex(nftInfo.address), Binary.fromInt32(Number(nftInfo.id)));

      const mockContract = {
        instantiate: jest.fn(),
        execute: jest.fn(),
        externalEvent: jest.fn(),
        query: jest
          .fn<() => any>()
          .mockResolvedValueOnce({ owner: issuer.address, issuer: issuer.address, nft: nftInfo }),
      };

      mockPackageService.exists.mockResolvedValue(true);
      mockCosmWasmService.load.mockResolvedValue(mockContract);
      mockLtoIndexService.verifyAnchors.mockResolvedValue({ verified: true });

      const chain = new EventChain(issuer, nonce);
      new Event({ '@context': 'instantiate_msg.json', package: 'packageCid' }).addTo(chain).signWith(issuer);

      await expect(service.accept(chain, null)).rejects.toThrow(
        'HTTP Request is not signed by the owner of the Ownable',
      );
    });

    it('should reject if the HTTP request has an incorrect signature', async () => {
      const issuer = lto.account({ seed: 'issuer' });
      const wrongSigner = lto.account({ seed: 'wrongSigner' });

      const nftInfo: NFTInfo = {
        network: 'testNetwork',
        address: '8bC9f9f4aAe458E268516558e3972c5F01BbC18e',
        id: '1',
      };

      const nonce = Binary.concat(Binary.fromHex(nftInfo.address), Binary.fromInt32(Number(nftInfo.id)));

      const mockContract = {
        instantiate: jest.fn(),
        execute: jest.fn(),
        externalEvent: jest.fn(),
        query: jest
          .fn<() => any>()
          .mockResolvedValueOnce({ owner: issuer.address, issuer: issuer.address, nft: nftInfo }),
      };

      mockPackageService.exists.mockResolvedValue(true);
      mockCosmWasmService.load.mockResolvedValue(mockContract);
      mockLtoIndexService.verifyAnchors.mockResolvedValue({ verified: true });

      const chain = new EventChain(issuer, nonce);
      new Event({ '@context': 'instantiate_msg.json', package: 'packageCid' }).addTo(chain).signWith(issuer);

      await expect(service.accept(chain, wrongSigner)).rejects.toThrow(
        'HTTP Request is not signed by the owner of the Ownable',
      );
    });

    it('should reject if there is a mismatch between the chain id and nft info', async () => {
      const issuer = lto.account({ seed: 'issuer' });

      const nftInfo: NFTInfo = {
        network: 'testNetwork',
        address: '8bC9f9f4aAe458E268516558e3972c5F01BbC18e',
        id: '1',
      };

      const nonce = Binary.concat(Binary.fromHex(nftInfo.address), Binary.fromInt32(999));

      const mockContract = {
        instantiate: jest.fn(),
        execute: jest.fn(),
        externalEvent: jest.fn(),
        query: jest
          .fn<() => any>()
          .mockResolvedValueOnce({ owner: issuer.address, issuer: issuer.address, nft: nftInfo }) // get_info
          .mockResolvedValueOnce(true), // is_locked
      };

      mockPackageService.exists.mockResolvedValue(true);
      mockCosmWasmService.load.mockResolvedValue(mockContract);
      mockLtoIndexService.verifyAnchors.mockResolvedValue({ verified: true });

      const chain = new EventChain(issuer, nonce);
      new Event({ '@context': 'instantiate_msg.json', package: 'packageCid' }).addTo(chain).signWith(issuer);

      await expect(service.accept(chain, issuer)).rejects.toThrow(
        'Chain id mismatch: Unable to confirm the Ownable was forged for specified NFT',
      );
    });
  });

  describe('claim()', () => {
    const issuer = lto.account({ seed: 'issuer' });
    const owner = lto.account({ seed: 'owner' });
    const nftInfo: NFTInfo = {
      network: 'testNetwork',
      address: '8bC9f9f4aAe458E268516558e3972c5F01BbC18e',
      id: '1',
    };

    let chain: EventChain;

    beforeEach(() => {
      const nonce = Binary.concat(Binary.fromHex(nftInfo.address), Binary.fromInt32(Number(nftInfo.id)));

      chain = new EventChain(issuer, nonce);
      new Event({ '@context': 'instantiate_msg.json', package: 'packageCid' }).addTo(chain).signWith(issuer);
      new Event({ '@context': 'execute_msg.json', transfer: { to: owner.address } }).addTo(chain).signWith(issuer);
      new Event({ '@context': 'execute_msg.json', lock: {} }).addTo(chain).signWith(owner);
    });

    it('should return the event chain package', async () => {
      const mockZip = {
        file: jest.fn<(path: string, data: string) => void>(),
        generateAsync: jest.fn<() => Uint8Array>().mockReturnValue(new Uint8Array([1, 2, 3])),
      };

      fs.readFile.mockResolvedValue(JSON.stringify(chain.toJSON()));
      mockPackageService.zipped.mockReturnValue(mockZip);

      const zip = await service.claim(chain.id, owner);
      expect(zip).toEqual(new Uint8Array([1, 2, 3]));

      expect(mockZip.file).toBeCalledWith('chain.json', JSON.stringify(chain.toJSON()));
    });
  });
});
