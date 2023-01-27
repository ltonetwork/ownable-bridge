import { Injectable } from '@nestjs/common';
import fs from 'fs/promises';
import * as vm from 'vm';
import Contract from './contract';

@Injectable()
export class CosmWasmService {
  async load(moduleFile: string, wasmFile: string): Promise<Contract> {
    const module = await import(moduleFile);
    const wasmBuffer = await fs.readFile(wasmFile);

    const sandbox = vm.createContext({
      contract: module,
    });

    const contract = new Contract(sandbox);
    await contract.init(wasmBuffer);

    return contract;
  }
}
