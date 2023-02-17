import { Injectable, OnModuleInit } from '@nestjs/common';
import { PackageService } from '../package/package.service';
import { Account, EventChain, LTO } from '@ltonetwork/lto';
import { ConfigService } from '../common/config/config.service';
import { CosmWasmService } from '../cosmwasm/cosmwasm.service';

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

  async accept(chain: EventChain): Promise<void> {
    const packageId: string = chain.events[0].parsedData.package;

    if (!(await this.packages.exists(packageId))) {
      throw new Error('Unknown ownable package');
    }

    // Load ownable from WASM. Some test data for now.
    const contract = await this.cosmWasm.load(
      this.packages.file(packageId, 'ownable.js'),
      this.packages.file(packageId, 'ownable_bg.wasm'),
    );

    const state = await contract.query({
      get_ownable_config: {},
    });

    if (!state.isLocked) {
      throw Error('Ownable not lock');
    }
  }
}
