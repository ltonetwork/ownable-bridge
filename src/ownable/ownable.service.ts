import { Injectable, OnModuleInit } from '@nestjs/common';
import { PackageService } from '../package/package.service';
import { Account, Binary, EventChain, Event, LTO } from '@ltonetwork/lto';
import { ConfigService } from '../common/config/config.service';
import { CosmWasmService } from '../cosmwasm/cosmwasm.service';
import Contract from '../cosmwasm/contract';
import fs from 'fs/promises';
import { NFTInfo, OwnableInfo } from '../interfaces/OwnableInfo';
import { NFTService } from '../nft/nft.service';
import { LtoIndexService } from '../common/lto-index/lto-index.service';

interface InfoWithProof extends OwnableInfo {
  proof?: string;
}

@Injectable()
export class OwnableService implements OnModuleInit {
  private readonly path: string;

  constructor(
    private packages: PackageService,
    private config: ConfigService,
    private cosmWasm: CosmWasmService,
    private nft: NFTService,
    private lto: LTO,
    private ltoIndex: LtoIndexService,
  ) {
    this.path = this.config.get('path.chains');
  }

  async onModuleInit() {
    await fs.mkdir(this.path, { recursive: true });
  }

  private async applyEvent(contract: Contract, event: Event): Promise<void> {
    const info: { sender: string; funds: [] } = {
      sender: event.signKey?.publicKey.base58,
      funds: [],
    };
    const { '@context': context, ...msg } = event.parsedData;

    switch (context) {
      case 'instantiate_msg.json':
        await contract.instantiate(msg, info);
        break;
      case 'execute_msg.json':
        await contract.execute(msg, info);
        break;
      case 'external_event_msg.json':
        await contract.externalEvent(msg, info);
        break;
      default:
        throw new Error('Unknown event type');
    }
  }

  private async loadContract(chain: EventChain) {
    const packageCid: string = chain.events[0].parsedData.package;

    if (!(await this.packages.exists(packageCid))) {
      throw new Error('Unknown ownable package');
    }

    const contract = await this.cosmWasm.load(
      this.packages.file(packageCid, 'ownable.js'),
      this.packages.file(packageCid, 'ownable_bg.wasm'),
    );

    for (const event of chain.events) {
      await this.applyEvent(contract, event);
    }

    return contract;
  }

  private verifyChainId(chain: EventChain, nft: NFTInfo): boolean {
    const { publicKey, keyType } = chain.events[0].signKey as { publicKey: Binary; keyType: 'ed25519' | 'secp256k1' };
    const account = this.lto.account({ publicKey: publicKey.base58, keyType });
    const nonce = Binary.concat(
      Binary.fromHex(nft.address),
      nft.id.match(/^\d+$/) ? Binary.fromInt32(Number(nft.id)) : new Binary(nft.id),
    );

    const expectedId = new EventChain(account, nonce).id;

    return chain.id === expectedId;
  }

  private async unlock(chain: EventChain, info: OwnableInfo): Promise<string> {
    if (!info.nft) {
      throw new Error('Ownable is not associated with an NFT');
    }

    if (this.config.get('verify.chainId') && !this.verifyChainId(chain, info.nft)) {
      throw new Error('Chain id mismatch: Unable to confirm the Ownable was forged for specified NFT');
    }

    return await this.nft.getUnlockProof(info.nft);
  }

  async accept(chain: EventChain, signer: Account | undefined): Promise<InfoWithProof> {
    const contract = await this.loadContract(chain);

    if (this.config.get('verify.integrity')) {
      const { verified } = await this.ltoIndex.verifyAnchors(chain.anchorMap);
      if (!verified) throw new Error('Chain integrity could not be verified: Mismatch in anchor map');
    }

    const isLocked = await contract.query({ is_locked: {} });
    if (!isLocked) throw Error('Ownable is not locked');

    const info = (await contract.query({ get_info: {} })) as OwnableInfo;

    if (this.config.get('verify.signer') && info.owner !== signer?.address) {
      throw new Error('HTTP Request is not signed by the owner of the Ownable');
    }

    const proof = this.config.get('unlockNFT') ? await this.unlock(chain, info) : undefined;

    await fs.writeFile(`${this.path}/${chain.id}.json`, JSON.stringify(chain));

    return { ...info, proof };
  }
}
