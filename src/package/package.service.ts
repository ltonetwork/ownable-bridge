import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../common/config/config.service';
import JSZip from 'jszip';
import * as fs from 'fs/promises';
import fileExists from '../utils/fileExists';
import path from 'path';

@Injectable()
export class PackageService implements OnModuleInit {
  private path: string;

  constructor(
    private readonly config: ConfigService,
    private readonly zip: JSZip,
    @Inject('IPFS') private readonly ipfs: IPFS,
  ) {}

  async onModuleInit() {
    this.path = this.config.get('path.packages');
    await fs.mkdir(this.path, { recursive: true });
  }

  private async unzip(data: Uint8Array): Promise<Map<string, Buffer>> {
    const archive = await this.zip.loadAsync(data, { createFolders: true });

    const entries: Array<[string, Buffer]> = await Promise.all(
      Object.entries(archive.files)
        .filter(([filename]) => filename !== 'chain.json')
        .map(async ([filename, file]) => [filename, await file.async('nodebuffer')]),
    );

    return new Map(entries);
  }

  private async getCid(files: Map<string, Buffer>): Promise<string> {
    const source = Array.from(files.entries()).map(([filename, content]) => ({
      path: `./${filename}`,
      content,
    }));

    for await (const entry of this.ipfs.addAll(source, { onlyHash: true, cidVersion: 1, recursive: true })) {
      if (entry.path === entry.cid.toString() && !!entry.mode) return entry.cid.toString();
    }
    throw new Error('Failed to calculate directory CID: importer did not find a directory entry in the input files');
  }

  private async storeFiles(cid: string, files: Map<string, Buffer>): Promise<void> {
    const packageDir = path.join(this.path, cid);
    await fs.mkdir(packageDir, { recursive: true });

    await Promise.all(
      Array.from(files.entries()).map(([filename, content]) => fs.writeFile(path.join(packageDir, filename), content)),
    );
  }

  private async storeZip(cid: string, data: Uint8Array): Promise<void> {
    const file = path.join(this.path, `${cid}.zip`);
    await fs.writeFile(file, data);
  }

  async store(data: Uint8Array): Promise<string> {
    const files = await this.unzip(data);
    if (!files.has('package.json')) throw new Error("Invalid package: 'package.json' is missing");

    const cid = await this.getCid(files);
    if (await this.exists(cid)) return cid;

    await this.storeFiles(cid, files);
    await this.storeZip(cid, data);

    return cid;
  }

  async exists(cid: string): Promise<boolean> {
    return await fileExists(`${this.path}/${cid}`);
  }

  file(cid: string, filename?: string): string {
    return filename ? `${this.path}/${cid}/${filename}` : `${this.path}/${cid}.zip`;
  }

  async zipped(cid: string): Promise<JSZip> {
    const data = await fs.readFile(this.file(cid), 'utf8');
    return await this.zip.loadAsync(data, { createFolders: true });
  }

  async hasMethod(cid: string, msgType: string, method: string): Promise<boolean> {
    const json = await fs.readFile(this.file(cid, `${msgType}_msg.json`), 'utf8');
    const schema = JSON.parse(json);

    return schema.oneOf.findIndex((m) => m.required.includes(method)) >= 0;
  }
}
