import { LTO } from '@ltonetwork/lto';
import { ConfigService } from '../../config/config.service';

export const ltoProviders = [
  {
    provide: LTO,
    useFactory: async (config: ConfigService) => {
      await config.onModuleInit(); // Why isn't config service already initialized?

      const lto = new LTO(config.get('lto.networkId'));
      lto.node = config.get('lto.node');
      return lto;
    },
    inject: [ConfigService],
  },
];
