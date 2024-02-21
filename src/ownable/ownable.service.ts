import { Injectable, OnModuleInit } from '@nestjs/common';
import { PackageService } from '../package/package.service';
import { Account, Binary, EventChain, Event, LTO } from '@ltonetwork/lto';
import { ConfigService } from '../common/config/config.service';
import { CosmWasmService } from '../cosmwasm/cosmwasm.service';
import Contract from '../cosmwasm/contract';
import fs from 'fs/promises';
import { NFTInfo, OwnableInfo } from '../interfaces/OwnableInfo';
import { NFTService } from '../nft/nft.service';
import { LtoIndexService } from '../common/lto-index/lto-index.service';
import { HttpService } from '@nestjs/axios';
import { AuthError, UserError } from '../interfaces/error';
import fileExists from '../utils/fileExists';

interface InfoWithProof extends OwnableInfo {
  proof?: string;
}

@Injectable()
export class OwnableService implements OnModuleInit {
  private readonly path: string;

  constructor(
    private packages: PackageService,
    private config: ConfigService,
    private cosmWasm: CosmWasmService,
    private nft: NFTService,
    private lto: LTO,
    private ltoIndex: LtoIndexService,
    private http: HttpService,
  ) {
    this.path = this.config.get('path.chains');
  }

  async onModuleInit() {
    await fs.mkdir(this.path, { recursive: true });
  }

  private async applyEvent(contract: Contract, event: Event): Promise<void> {
    const info: { sender: string; funds: [] } = {
      sender: event.signKey?.publicKey.base58,
      funds: [],
    };
    const { '@context': context, ...msg } = event.parsedData;

    switch (context) {
      case 'instantiate_msg.json':
        await contract.instantiate(msg, info);
        break;
      case 'execute_msg.json':
        await contract.execute(msg, info);
        break;
      case 'external_event_msg.json':
        await contract.externalEvent(msg, info);
        break;
      default:
        throw new UserError(`Unknown event type: ${context}`);
    }
  }

  private async loadContract(packageCid: string, chain: EventChain) {
    if (!(await this.packages.exists(packageCid))) {
      throw new UserError('Unknown ownable package');
    }

    const contract = await this.cosmWasm.load(
      this.packages.file(packageCid, 'ownable.js'),
      this.packages.file(packageCid, 'ownable_bg.wasm'),
    );

    for (const event of chain.events) {
      await this.applyEvent(contract, event);
    }

    return contract;
  }

  private verifyChainId(chain: EventChain, nft: NFTInfo): boolean {
    const { publicKey, keyType } = chain.events[0].signKey as { publicKey: Binary; keyType: 'ed25519' | 'secp256k1' };
    const account = this.lto.account({ publicKey: publicKey.base58, keyType });
    const nonce = Binary.concat(
      Binary.fromHex(nft.address),
      nft.id.match(/^\d+$/) ? Binary.fromInt32(Number(nft.id)) : new Binary(nft.id),
    );

    const expectedId = new EventChain(account, nonce).id;

    return chain.id === expectedId;
  }

  private async verifyChainOwner(chain: EventChain, nft: NFTInfo): Promise<boolean> {
    const { publicKey, keyType } = chain.events[0].signKey as { publicKey: Binary; keyType: 'ed25519' | 'secp256k1' };
    const account = this.lto.account({ publicKey: publicKey.base58, keyType });

    const issuer = await this.nft.getIssuer(nft);

    return issuer === account.getAddressOnNetwork(nft.network);
  }

  private async unlock(chain: EventChain, info: OwnableInfo): Promise<string> {
    if (!info.nft) {
      throw new UserError('Ownable is not associated with an NFT');
    }

    if (
      this.config.get('verify.chainId') &&
      !(await this.verifyChainOwner(chain, info.nft)) &&
      !this.verifyChainId(chain, info.nft)
    ) {
      throw new UserError('Chain id mismatch: Unable to confirm the Ownable was forged for specified NFT');
    }

    return await this.nft.getUnlockProof(info.nft);
  }

  private postToWebhook(chain: EventChain, info: OwnableInfo, packageCid: string) {
    const webhook = this.config.get('accept.webhook');
    if (!webhook) return;

    this.http.post(webhook, { chain: chain.toJSON(), ownable: info, packageCid });
  }

  async exists(chainId: string): Promise<boolean> {
    return await fileExists(`${this.path}/${chainId}.json`);
  }

  async accept(chain: EventChain, signer: Account | undefined): Promise<InfoWithProof> {
    try {
      chain.validate();
    } catch (e) {
      throw new UserError('Invalid event chain');
    }

    const packageCid: string = chain.events[0].parsedData.package;
    const contract = await this.loadContract(packageCid, chain);

    const info = (await contract.query({ get_info: {} })) as OwnableInfo;

    if (this.config.get('verify.signer') && info.owner !== signer?.address) {
      throw new AuthError('HTTP Request is not signed by the owner of the Ownable');
    }

    if (this.config.get('verify.integrity')) {
      const { verified } = await this.ltoIndex.verifyAnchors(chain.anchorMap);
      if (!verified) throw new UserError('Chain integrity could not be verified: Mismatch in anchor map');
    }

    const isLocked = await contract.query({ is_locked: {} });
    if (!isLocked) throw new UserError('Ownable is not locked');

    const proof = this.config.get('accept.unlockNFT') ? await this.unlock(chain, info) : undefined;

    await fs.writeFile(`${this.path}/${chain.id}.json`, JSON.stringify(chain));
    this.postToWebhook(chain, info, packageCid);

    return { ...info, proof };
  }

  async claim(chainId: string, signer: Account): Promise<Uint8Array> {
    const zip = await this.packages.zipped(chainId);
    const json = await fs.readFile(`${this.path}/${chainId}.json`, 'utf-8');

    // Is the signer the current owner of the Ownable? No, then return a 403

    zip.file(`chain.json`, json);

    return await zip.generateAsync({ type: 'uint8array' });
  }
}
