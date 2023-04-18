import { Module } from '@nestjs/common';
import { NFTService } from './nft.service';
import { Erc721Service } from './ethereum/erc721.service';

@Module({
  providers: [NFTService, Erc721Service],
  exports: [NFTService],
})
export class NFTModule {}
