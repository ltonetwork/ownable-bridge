import { Injectable, OnModuleInit } from '@nestjs/common';
import { PackageService } from '../package/package.service';
import { EventChain } from '@ltonetwork/lto';
import { ConfigService } from '../common/config/config.service';
import { CosmWasmService } from '../cosmwasm/cosmwasm.service';
import Contract from '../cosmwasm/contract';
import fs from 'fs/promises';

@Injectable()
export class OwnableService implements OnModuleInit {
  private readonly path: string;

  constructor(private packages: PackageService, private config: ConfigService, private cosmWasm: CosmWasmService) {
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

  async accept(chain: EventChain): Promise<void> {
    const packageCid: string = chain.events[0].parsedData.package;

    if (!(await this.packages.exists(packageCid))) {
      throw new Error('Unknown ownable package');
    }

    const contract = await this.cosmWasm.load(
      this.packages.file(packageCid, 'ownable.js'),
      this.packages.file(packageCid, 'ownable_bg.wasm'),
    );

    await this.apply(contract, chain);

    const isLocked = await contract.query({ is_locked: {} });
    if (!isLocked) throw Error("Ownable isn't locked");

    await fs.writeFile(`${this.path}/${chain.id}.json`, JSON.stringify(chain));

    // Generate proof to unlock NFT
    // The info contains the nft contract address and the token id.
    // Get the challenge from the NFT contract for this token id.
    // Sign the challenge to generate the proof.

    // const info = await contract.query({ info: {} });
    // const challenge = await nftContract.query({ challenge: { token_id: info.token_id } });
    // this.ethers.signMessage(challenge);
  }
}
