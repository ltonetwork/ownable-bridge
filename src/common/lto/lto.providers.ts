import { LTO } from '@ltonetwork/lto';
import { ConfigService } from '../../config/config.service';

export const ltoProviders = [
  {
    provide: LTO,
    useFactory: (config: ConfigService) => {
      const lto = new LTO(config.get('lto.networkId'));
      lto.node = config.get('lto.node');
      return lto;
    },
    inject: [ConfigService],
  },
];
