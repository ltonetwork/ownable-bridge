import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '../config/config.service';
import * as abis from './abi';

type NetworkSettings = {
  id: number;
  name: string;
  provider: 'infura' | 'jsonrpc';
  url?: string;
};

@Injectable()
export class EthersService implements OnModuleInit {
  private wallet: ethers.Wallet;
  private infuraKey: string;
  private readonly providers: Map<string | number, ethers.providers.Provider> = new Map();

  constructor(private config: ConfigService) {}

  onModuleInit(): void {
    this.wallet = new ethers.Wallet(this.config.get('eth.seed'));
    this.infuraKey = this.config.get('eth.infura.key');
    this.initProviders();
  }

  private initProviders() {
    const networks = this.config.get('eth.networks');

    for (const network of networks) {
      const provider = this.createProvider(network);
      this.providers.set(network.id, provider);
      this.providers.set(network.name, provider);
    }
  }

  private createProvider(network: NetworkSettings): ethers.providers.Provider {
    switch (network.provider) {
      case 'infura':
        return new ethers.providers.InfuraProvider(network.id, this.infuraKey);
      case 'jsonrpc':
        return new ethers.providers.JsonRpcProvider(network.url, {
          name: network.name,
          chainId: network.id,
        });
    }
  }

  public getContract(name: string, network: number | string, address: string): ethers.Contract {
    if (!(name in abis)) throw new Error(`No ABI for ${name}`);
    return new ethers.Contract(address, abis[name], this.providers.get(network));
  }

  public signMessage(message: string | ArrayLike<number>) {
    return this.wallet.signMessage(message);
  }
}
