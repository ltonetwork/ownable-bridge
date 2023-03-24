import { Injectable, OnModuleInit } from '@nestjs/common';
import { PackageService } from '../package/package.service';
import { Account, EventChain, LTO } from '@ltonetwork/lto';
import { ConfigService } from '../common/config/config.service';
import { CosmWasmService } from '../cosmwasm/cosmwasm.service';
import Contract from '../cosmwasm/contract';

@Injectable()
export class OwnableService implements OnModuleInit {
  private account: Account;

  constructor(
    private packages: PackageService,
    private config: ConfigService,
    private cosmWasm: CosmWasmService,
    private lto: LTO,
  ) {}

  async onModuleInit() {
    this.account = this.lto.account({
      seed: this.config.get('lto.seed'),
    });
  }

  private async apply(contract: Contract, chain: EventChain): Promise<void> {
    for (const event of chain.events) {
      const info: { sender: string; funds: [] } = {
        sender: event.signKey!.publicKey.base58,
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

    const info = await contract.query({
      get_ownable_info: {},
    });

    if (!info.isLocked) {
      throw Error('Ownable not lock');
    }

    // Save event chain to DB

    // Generate proof to unlock NFT
    //   state.nft = {
    //     network: "eip115:5",
    //     address: "....",
    //     tokenId: "..."
    //   }
  }
}
