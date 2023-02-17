import { ConfigService } from '../config/config.service';
import { Provider } from '@nestjs/common';

export const ipfsProviders: Array<Provider> = [
  {
    provide: 'IPFS',
    useFactory: async (config: ConfigService): Promise<any> => {
      const IPFS = await import('ipfs-core');
      return await IPFS.create({ ...config.get('ipfs'), start: false });
    },
    inject: [ConfigService],
  },
];
