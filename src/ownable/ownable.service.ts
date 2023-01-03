import { Injectable, OnModuleInit } from '@nestjs/common';
import { PackageService } from '../package/package.service';
import { Account, EventChain, LTO } from '@ltonetwork/lto';
import { ConfigService } from '../config/config.service';

@Injectable()
export class OwnableService implements OnModuleInit {
  private account: Account;

  constructor(
    private packages: PackageService,
    private config: ConfigService,
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
    const ownable = {
      isBridged: (address: string) => true,
      owner: '3Msoe9ZvqXqKDtsXzwmfama2KHxPMDwosTF',
    };

    // Apply event chain to ownable

    if (!ownable.isBridged(this.account.address)) {
      throw Error('Ownable not bridged');
    }
  }
}
