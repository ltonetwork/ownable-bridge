import { LTO } from '@ltonetwork/lto';
import { ConfigService } from '../config/config.service';
import { Provider } from '@nestjs/common';

export const ltoProviders: Array<Provider> = [
  {
    provide: LTO,
    useFactory: async (config: ConfigService) => {
      await config.onModuleInit(); // Why isn't config service already initialized?

      const lto = new LTO(config.get('lto.networkId'));
      lto.nodeAddress = config.get('lto.node');
      return lto;
    },
    inject: [ConfigService],
  },
];
