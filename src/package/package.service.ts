import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import JSZip from 'jszip';
import * as fs from 'fs/promises';
import multihash from '../utils/multihash';
import fileExists from '../utils/fileExists';

@Injectable()
export class PackageService implements OnModuleInit {
  private uploads: string;
  private path: string;
  private ipfs;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.uploads = this.config.get('packages.uploads');
    this.path = this.config.get('packages.path');

    const IPFS = await import('ipfs-core');
    this.ipfs = await IPFS.create({ start: false });
  }

  private async unzip(data: Buffer, dest: string): Promise<void> {
    const zip = new JSZip();
    const archive = await zip.loadAsync(data, { createFolders: true });

    await fs.mkdir(dest, { recursive: true });

    await Promise.all(
      Object.entries(archive.files).map(async ([filename, file]) => {
        const content = await file.async('nodebuffer');
        return fs.writeFile(`${dest}/${filename}`, content);
      }),
    );
  }

  private async getCid(dir: string): Promise<string> {
    const { cid } = await this.ipfs.add(dir, { onlyHash: true });

    return cid.toString();
  }

  private async storeByCid(dir: string): Promise<string> {
    const cid = await this.getCid(dir);
    const packageDir = `${this.path}/${cid}`;

    if (await fileExists(packageDir)) {
      // package already uploaded, with different zip file
      await fs.rm(dir, { recursive: true, force: true });
    } else {
      await fs.mkdir(packageDir, { recursive: true });
      await fs.rename(dir, packageDir);
    }

    await fs.symlink(packageDir, dir);

    return cid;
  }

  async store(data: Buffer): Promise<string> {
    const dir = this.uploads + '/' + multihash(data);

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
}
