import { ConfigService } from '../../config/config.service';

export const ipfsProviders = [
  {
    provide: 'IPFS',
    useFactory: async (config: ConfigService): Promise<IPFS> => {
      const IPFS = await import('ipfs-core');
      return await IPFS.create({ ...config.get('ipfs'), start: false });
    },
    inject: [ConfigService],
  },
];
