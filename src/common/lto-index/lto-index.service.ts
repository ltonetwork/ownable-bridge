import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config/config.service';
import { Binary } from '@ltonetwork/lto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class LtoIndexService {
  constructor(private config: ConfigService, private http: HttpService) {}

  async verifyAnchors(anchors: Array<{ key: Binary; value: Binary; signer: string }>): Promise<any> {
    const entries = anchors.map(({ key, value, signer }) => [key.hex, { hash: value.hex, sender: signer }]);
    const data = Object.fromEntries(entries);

    const url = `${this.config.get('lto.node')}/index/hash/verify?encoding=hex`;
    const response = await lastValueFrom(
      this.http.post(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
    );

    return JSON.parse(response.data);
  }
}
