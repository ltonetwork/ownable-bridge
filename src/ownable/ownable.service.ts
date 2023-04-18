import { Injectable, OnModuleInit } from '@nestjs/common';
import { PackageService } from '../package/package.service';
import { Binary, EventChain, LTO } from '@ltonetwork/lto';
import { ConfigService } from '../common/config/config.service';
import { CosmWasmService } from '../cosmwasm/cosmwasm.service';
import Contract from '../cosmwasm/contract';
import fs from 'fs/promises';
import { NFTInfo, OwnableInfo } from '../interfaces/OwnableInfo';
import { integerToByteArray } from '@ltonetwork/lto/lib/utils/convert';
import { NFTService } from '../nft/nft.service';

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
    private lto: LTO,
    private nft: NFTService,
  ) {
    this.path = this.config.get('chains.path');
  }

  async onModuleInit() {
    await fs.mkdir(this.path, { recursive: true });
  }

  private async apply(contract: Contract, chain: EventChain): Promise<void> {
    for (const event of chain.events) {
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

    await this.apply(contract, chain);

    return contract;
  }

  private verifyChainId(chain: EventChain, nft: NFTInfo): boolean {
    const { publicKey, keyType } = chain.events[0].signKey as { publicKey: Binary; keyType: 'ed25519' | 'secp256k1' };
    const account = this.lto.account({ publicKey: publicKey.base58, keyType });
    const nonce = Binary.concat(
      Binary.fromHex(nft.address),
      nft.id.match(/^\d+$/) ? integerToByteArray(Number(nft.id)) : new Binary(nft.id),
    );

    const expectedId = new EventChain(account, nonce).id;

    return chain.id === expectedId;
  }

  async accept(chain: EventChain): Promise<InfoWithProof> {
    const contract = await this.loadContract(chain);

    const isLocked = await contract.query({ is_locked: {} });
    if (!isLocked) throw Error("Ownable isn't locked");

    const info = (await contract.query({ get_info: {} })) as OwnableInfo;
    if (!info.nft) {
      throw new Error('Ownable is not associated with an NFT');
    }

    if (!this.verifyChainId(chain, info.nft)) {
      throw new Error('Chain id mismatch: Unable to confirm the Ownable was forged for specified NFT');
    }

    await fs.writeFile(`${this.path}/${chain.id}.json`, JSON.stringify(chain));

    const proof = this.config.get('unlockNFT') ? await this.nft.getUnlockProof(info.nft) : undefined;

    return { ...info, proof };
  }
}
