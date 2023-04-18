import { Injectable } from '@nestjs/common';
import { EthersService } from '../../common/ethers/ethers.service';
import { NFTInfo } from '../../interfaces/OwnableInfo';

@Injectable()
export class Erc721Service {
  constructor(private ethers: EthersService) {}

  public async getUnlockProof(nft: NFTInfo): Promise<string> {
    const nftContract = this.ethers.getContract('IERC721Lockable', nft.network, nft.address);
    const challenge = await nftContract.query({ challenge: { token_id: nft.id } });

    return await this.ethers.signMessage(challenge);
  }
}
