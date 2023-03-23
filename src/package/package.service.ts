import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../common/config/config.service';
import JSZip from 'jszip';
import * as fs from 'fs/promises';
import * as multihash from '../utils/multihash';
import fileExists from '../utils/fileExists';
import path from 'path';

@Injectable()
export class PackageService implements OnModuleInit {
  private uploads: string;
  private path: string;

  constructor(
    private readonly config: ConfigService,
    private readonly zip: JSZip,
    @Inject('IPFS') private readonly ipfs: IPFS,
  ) {}

  async onModuleInit() {
    this.uploads = this.config.get('packages.uploads');
    this.path = this.config.get('packages.path');

    await fs.mkdir(this.path, { recursive: true });
  }

  private async unzip(data: Uint8Array, dest: string): Promise<void> {
    const archive = await this.zip.loadAsync(data, { createFolders: true });
    await fs.mkdir(dest, { recursive: true });

    await Promise.all(
      Object.entries(archive.files).map(async ([filename, file]) => {
        if (filename === 'event_chain.json') return;
        const content = await file.async('nodebuffer');
        return fs.writeFile(`${dest}/${filename}`, content);
      }),
    );
  }

  private async getCid(path: string): Promise<string> {
    const { cid } = await this.ipfs.add(path, { onlyHash: true, cidVersion: 1 });
    return cid.toString();
  }

  private async storeByCid(dir: string): Promise<string> {
    const cid = await this.getCid(dir);
    const packageDir = `${this.path}/${cid}`;

    if (await fileExists(packageDir)) {
      // package already uploaded, with different zip file
      await fs.rm(dir, { recursive: true, force: true });
    } else {
      await fs.rename(dir, packageDir);
    }

    const target = path.relative(path.resolve(path.dirname(dir)), path.resolve(packageDir));
    await fs.symlink(target, dir);

    return cid;
  }

  async store(data: Uint8Array): Promise<string> {
    const dir = this.uploads + '/' + multihash.sha256(data);

    if (await fileExists(dir)) {
      const link = await fs.readlink(dir);
      return link.split('/').pop();
    }

    await this.unzip(data, dir);

    return await this.storeByCid(dir);
  }

  async exists(cid: string): Promise<boolean> {
    return await fileExists(`${this.path}/${cid}`);
  }

  file(cid: string, filename: string): string {
    return `${this.path}/${cid}/${filename}`;
  }
}
