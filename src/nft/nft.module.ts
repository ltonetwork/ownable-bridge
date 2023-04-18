import { Module } from '@nestjs/common';
import { NFTService } from './nft.service';
import { EthereumService } from './ethereum/ethereum.service';

@Module({
  providers: [NFTService, EthereumService],
  exports: [NFTService],
})
export class NFTModule {}
