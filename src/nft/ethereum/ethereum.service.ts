import { Injectable } from '@nestjs/common';
import { EthersService } from '../../common/ethers/ethers.service';
import { NFTInfo } from '../../interfaces/OwnableInfo';

@Injectable()
export class EthereumService {
  constructor(private ethers: EthersService) {}

  public async getUnlockProof(nft: NFTInfo): Promise<string> {
    const nftContract = this.ethers.getContract('IERC721Lockable', nft.network, nft.address);
    const challenge = await nftContract.unlockChallenge(nft.id);

    return await this.ethers.signMessage(challenge);
  }

  public async getIssuer(nft: NFTInfo): Promise<string> {
    const nftContract = this.ethers.getContract('Ownable', nft.network, nft.address);
    return await nftContract.owner();
  }
}
