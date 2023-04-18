import { Injectable } from '@nestjs/common';
import { Erc721Service } from './ethereum/erc721.service';
import { NFTInfo } from '../interfaces/OwnableInfo';

@Injectable()
export class NFTService {
  constructor(private ethereum: Erc721Service) {}

  async getUnlockProof(nft: NFTInfo): Promise<string> {
    if (nft.network.startsWith('eip155:')) {
      return await this.ethereum.getUnlockProof(nft);
    }

    throw new Error(`Unknown network ${nft.network}`);
  }
}
