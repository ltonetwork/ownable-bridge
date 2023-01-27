import { Module } from '@nestjs/common';
import { CosmWasmService } from './cosmwasm.service';

@Module({
  providers: [CosmWasmService],
})
export class CosmWasmModule {}
