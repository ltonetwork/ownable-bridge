import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '../config/config.service';
import * as abis from './abi';
import { Networkish } from '@ethersproject/networks';

type NetworkSettings = {
  id: number;
  name: string;
  provider: 'jsonrpc' | 'etherscan' | 'infura' | 'alchemy' | 'cloudflare' | 'pocket' | 'ankr';
  url?: string;
};

@Injectable()
export class EthersService implements OnModuleInit {
  private wallet: ethers.Wallet;
  private readonly providers: Map<string | number, ethers.providers.Provider> = new Map();

  constructor(private config: ConfigService) {}

  onModuleInit(): void {
    this.wallet = ethers.Wallet.fromMnemonic(this.config.get('account.seed'));
    this.initProviders();
  }

  private initProviders() {
    const networks = this.config.get('eth.networks');
    const providerKeys = this.config.get('eth.providers');

    for (const network of networks) {
      const provider = this.createProvider(network, providerKeys);
      this.providers.set(network.id, provider);
      this.providers.set(network.name, provider);
    }
  }

  private createProvider(network: NetworkSettings, providerKeys: { [_: string]: string }): ethers.providers.Provider {
    switch (network.provider) {
      case 'jsonrpc':
        return new ethers.providers.JsonRpcProvider(network.url, {
          name: network.name,
          chainId: network.id,
        });
      case 'etherscan':
        return new ethers.providers.EtherscanProvider(network.id, providerKeys.etherscan);
      case 'infura':
        return new ethers.providers.InfuraProvider(network.id, providerKeys.infura);
      case 'alchemy':
        return new ethers.providers.AlchemyProvider(network.id, providerKeys.alchemy);
      case 'cloudflare':
        return new ethers.providers.CloudflareProvider(network.id, providerKeys.cloudflare);
      case 'pocket':
        return new ethers.providers.PocketProvider(network.id, providerKeys.pocket);
      case 'ankr':
        return new ethers.providers.AnkrProvider(network.id, providerKeys.ankr);
    }
  }

  public getContract(type: keyof typeof abis, network: Networkish, address: string): ethers.Contract {
    if (!(type in abis)) throw new Error(`No ABI for ${type}`);

    const networkId = typeof network === 'object' ? network.chainId : network;
    const provider = this.providers.get(networkId);
    if (!provider) throw new Error(`No provider for network ${networkId}`);

    return new ethers.Contract(address, abis[type], provider);
  }

  public signMessage(message: string | ArrayLike<number>): Promise<string> {
    return this.wallet.signMessage(message);
  }
}
